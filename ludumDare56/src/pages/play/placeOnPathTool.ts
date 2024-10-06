import { Container } from "pixi.js";
import { lineOnLineIntersection } from "../../math/utils";
import { V2, Vector2 } from "../../math/vector2";
import { Vector3, V3 } from "../../math/vector3";
import { Play } from "../play";
import { Tool } from "./tool";
import { Game } from "../../models/game";
import { WaypointType } from "../../models/waypoint";

export class PlaceOnPathTool implements Tool {
    private readonly play: Play;
    private readonly container: Container;
    private readonly callback: (position: Vector3) => void;
    private readonly placeEvent: (event: PointerEvent) => void;
    private readonly pointerMove: (event: PointerEvent) => void;
    private readonly cancelEvent: (event: KeyboardEvent) => void;
    private placeholder?: HTMLDivElement;

    public constructor(play: Play, game: Game, stage: Container, callback: (position: Vector3) => void) {
        this.play = play;
        this.container = stage;
        this.callback = callback;

        this.placeEvent = (event: PointerEvent) => {
            const target = (event.target as HTMLDivElement);
            const boundingBox = target.getBoundingClientRect();
            const mouseCoords = this.container.toLocal(V2(event.pageX - boundingBox.x, event.pageY - boundingBox.y));

            for (const waypoint of game.waypoints) {
                let nearest: Vector2 | null = null;
                for (const neighbour of waypoint.exits) {
                    const neighbourWaypoint = game.waypoints.find(x => x.position.equals(neighbour));
                    if (!waypoint.hints.includes(WaypointType.normal) &&
                        !neighbourWaypoint?.hints.includes(WaypointType.normal)
                    ) {
                        continue;
                    }

                    if (Math.ceil(waypoint.position.z) === this.play.layerIdx || Math.ceil(neighbour.z) === this.play.layerIdx) {
                        const a = V2(waypoint.position.x, waypoint.position.y);
                        const b = V2(neighbour.x, neighbour.y);
                        nearest = lineOnLineIntersection(a, b, V2(mouseCoords.x, mouseCoords.y - 100), V2(mouseCoords.x, mouseCoords.y + 50));
                        if (nearest) {
                            this.callback(V3(nearest.x, nearest.y, Math.max(waypoint.position.z, neighbour.z)));
                            break;
                        }
                    }
                }

                if (nearest) {
                    break;
                }
            }

            this.play.setTool(null);
        }
        this.pointerMove = (event: PointerEvent) => {
            this.placeholder?.style.setProperty('--x', event.pageX.toString());
            this.placeholder?.style.setProperty('--y', event.pageY.toString());

            const target = (event.target as HTMLDivElement);
            const boundingBox = target.getBoundingClientRect();
            const mouseCoords = this.container.toLocal(V2(event.pageX - boundingBox.x, event.pageY - boundingBox.y));
            let allowed = false;
            for (const waypoint of game.waypoints) {
                let nearest: Vector2 | null = null;
                for (const neighbour of waypoint.exits) {
                    const neighbourWaypoint = game.waypoints.find(x => x.position.equals(neighbour));
                    if (!waypoint.hints.includes(WaypointType.normal) &&
                        !neighbourWaypoint?.hints.includes(WaypointType.normal)
                    ) {
                        continue;
                    }


                    if (Math.ceil(waypoint.position.z) === this.play.layerIdx || Math.ceil(neighbour.z) === this.play.layerIdx) {
                        const a = V2(waypoint.position.x, waypoint.position.y);
                        const b = V2(neighbour.x, neighbour.y);
                        nearest = lineOnLineIntersection(a, b, V2(mouseCoords.x, mouseCoords.y - 100), V2(mouseCoords.x, mouseCoords.y + 50));
                        if (nearest) {
                            allowed = true;
                            break;
                        }
                    }
                }

                if (nearest) {
                    break;
                }
            }
            if (allowed && !this.placeholder?.classList.contains('allowed')) {
                this.placeholder?.classList.add('allowed');
            }
            else if (!allowed && this.placeholder?.classList.contains('allowed')) {
                this.placeholder?.classList.remove('allowed');
            }
        }
        this.cancelEvent = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                this.play.setTool(null);
            }
        }
    }
    private canvas?: HTMLDivElement;
    public connectedCallback(): void {
        this.canvas = (this.play.querySelector('.canvas-wrapper') as HTMLDivElement);
        this.canvas.addEventListener('pointerdown', this.placeEvent);
        this.placeholder = document.createElement('div') as HTMLDivElement;
        this.placeholder.classList.add('placeholder');
        document.body.appendChild(this.placeholder);
        window.document.body.addEventListener('pointermove', this.pointerMove);
        window.document.body.addEventListener('keydown', this.cancelEvent);

        document.body.classList.add('dragging','buildable');
    }
    public disconnectedCallback(): void {
        this.canvas?.removeEventListener('pointerdown', this.placeEvent!);
        delete this.canvas;

        this.placeholder?.remove();
        delete this.placeholder;

        window.document.body.removeEventListener('pointermove', this.pointerMove);
        window.document.body.removeEventListener('keydown', this.cancelEvent);

        document.body.classList.remove('dragging', 'buildable');
    }
}