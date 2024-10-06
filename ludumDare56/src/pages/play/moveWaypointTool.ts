import { V2 } from "../../math/vector2";
import { V3 } from "../../math/vector3";
import { Game } from "../../models/game";
import { Waypoint } from "../../models/waypoint";
import { Play } from "../play";
import { Tool } from "./tool";
import { WaypointView } from "./waypointDebugView";

export class MoveWaypointTool implements Tool {
    private readonly play: Play;
    private readonly debug?: WaypointView;
    private readonly pointerMove: (event: PointerEvent) => void;
    private readonly pointerUp: (event: PointerEvent) => void;
    private readonly pointerCancel: (event: PointerEvent) => void;
    private readonly cancelEvent: (event: KeyboardEvent) => void;

    public constructor(play: Play, game: Game, waypoint: Waypoint, debug?: WaypointView) {
        this.play = play;
        this.debug = debug;

        console.log('MoveWaypointTool::constructor');
        this.pointerMove = (event: PointerEvent) => {
            console.log('MoveWaypointTool::move');
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
            console.log('MoveWaypointTool::up');
            this.play.setTool(null);
        }
        this.pointerCancel = (_: PointerEvent) => {
            console.log('MoveWaypointTool::cancel');
            this.play.setTool(null);
        };
        this.cancelEvent = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                console.log('MoveWaypointTool::cancel');
                this.play.setTool(null);
            }
        }
    }
    private canvas?: HTMLDivElement;
    public connectedCallback(): void {
        this.canvas = (this.play.querySelector('.canvas-wrapper') as HTMLDivElement);
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
