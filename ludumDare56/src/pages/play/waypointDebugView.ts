import { Container, Graphics, Text } from "pixi.js";
import { Vector3 } from "../../math/vector3";
import { Game } from "../../models/game";
import { Play } from "../play";

export class WaypointDebugView {
    private readonly graphics: Graphics[] = [];
    private readonly game: Game;

    public constructor(play: Play, game: Game, _: Container) {
        this.graphics = [new Graphics(), new Graphics(), new Graphics()];
        this.game = game;

        this.draw();

        this.graphics.forEach((x, i) => play.layers[i].addChild(x));
    }

    private draw() {
        this._dirty = false;

        for (const graphics of this.graphics) {
            const idx = this.graphics.indexOf(graphics);
            graphics.zIndex = 1;
            graphics.clear();

            const colour = [0xE4B1F0, 0x7E60BF, 0x433878];
            const done: Vector3[] = [];
            const textNodes = graphics.children.filter(x => x instanceof Text);
            const availableWaypoints = this.game.waypoints.filter(x => Math.ceil(x.position.z) === idx);
            for (let i = availableWaypoints.length; i < graphics.children.length; ++i) {
                graphics.children[i].removeFromParent();
            }

            for (let i = 0; i < availableWaypoints.length; ++i) {
                const waypoint = availableWaypoints[i];

                const size = 3 + (3 - idx);
                graphics.beginPath();
                graphics.circle(waypoint.position.x, waypoint.position.y, size * 2);
                graphics.fill(colour[idx]);

                let textNode = textNodes[i];
                if (!textNode) {
                    graphics.addChild(textNode = new Text());
                    textNode.anchor.set(0.5, 1);
                }
                textNode.text = waypoint.hints.join(',') + "; " + (1 + (waypoint.position.z - Math.ceil(waypoint.position.z)));
                textNode.position.set(waypoint.position.x, waypoint.position.y - 8);

                if (done.some(x => x.equals(waypoint.position))) {
                    continue;
                }

                done.push(waypoint.position);

                for (const neighbour of waypoint.exits) {
                    if (done.some(x => x.equals(neighbour))) {
                        continue;
                    }

                    const layerIdx = Math.ceil(Math.max(waypoint.position.z, neighbour.z));

                    graphics.beginPath();
                    graphics.moveTo(waypoint.position.x, waypoint.position.y)
                        .lineTo(neighbour.x, neighbour.y)
                        .stroke({ width: 2, color: colour[layerIdx], alpha: 3 });
                }
            }
        }
    }

    private _dirty = false;
    public dirty() {
        this._dirty = true;
    }

    public tick(_: number) {
        if (this._dirty) {
            this.draw();
        }
    }

    public destroy() {
        this.graphics.forEach(x=>x.removeFromParent());
    }
}
