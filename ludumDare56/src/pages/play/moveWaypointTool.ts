import { assertHTMLElement } from "../../exceptions";
import { V2 } from "../../math/vector2";
import { V3 } from "../../math/vector3";
import { Game } from "../../models/game";
import { Waypoint } from "../../models/waypoint";
import { Play } from "../play";
import { Tool } from "./tool";
import { WaypointDebugView } from "./waypointDebugView";

export class MoveWaypointTool implements Tool {
    private readonly play: Play;
    private readonly debug?: WaypointDebugView;
    private readonly pointerMove: (event: PointerEvent) => void;
    private readonly pointerUp: (event: PointerEvent) => void;
    private readonly pointerCancel: (event: PointerEvent) => void;
    private readonly cancelEvent: (event: KeyboardEvent) => void;
    private canvas?: HTMLDivElement;

    public constructor(play: Play, game: Game, waypoint: Waypoint, debug?: WaypointDebugView) {
        this.play = play;
        this.debug = debug;

        this.pointerMove = (event: PointerEvent) => {
            const activeLayer = play.layers[Math.ceil(waypoint.position.z)];
            if (activeLayer) {
                const localCoords = activeLayer.toLocal(V2(event.pageX, event.pageY));
                const oldPosition = waypoint.position;
                waypoint.position = V3(localCoords.x, localCoords.y, waypoint.position.z);

                for (const other of game.waypoints) {
                    const p = other.exits.find(e => e.equals(oldPosition));
                    if (p) {
                        p.x = waypoint.position.x;
                        p.y = waypoint.position.y;
                        p.z = waypoint.position.z;
                    }
                }

                this.debug?.dirty();
            }
        }
        this.pointerUp = (_: PointerEvent) => {
            this.play.setTool(null);
        }
        this.pointerCancel = (_: PointerEvent) => {
            this.play.setTool(null);
        };
        this.cancelEvent = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                this.play.setTool(null);
            }
        }
    }

    public connectedCallback(): void {
        this.canvas = assertHTMLElement(this.play.querySelector('.canvas-wrapper'), HTMLDivElement, 'unable to find the canvas wrapper');
        this.canvas.addEventListener('pointermove', this.pointerMove);
        this.canvas.addEventListener('pointerup', this.pointerUp);
        this.canvas.addEventListener('pointerout', this.pointerCancel);
        window.document.body.addEventListener('keydown', this.cancelEvent);
    }
    public disconnectedCallback(): void {
        this.canvas?.removeEventListener('pointermove', this.pointerMove);
        this.canvas?.removeEventListener('pointerup', this.pointerUp);
        this.canvas?.removeEventListener('pointerout', this.pointerCancel);
        window.document.body.removeEventListener('keydown', this.cancelEvent);
    }
}
