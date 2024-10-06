import { V2 } from "../../math/vector2";
import { Game } from "../../models/game";
import { Waypoint } from "../../models/waypoint";
import { Play } from "../play";
import { Tool } from "./tool";
import { WaypointView } from "./waypointDebugView";

export class ConnectWaypointTool implements Tool {
    private readonly play: Play;
    private readonly debug?: WaypointView;
    private readonly pointerMove: (event: PointerEvent) => void;
    private readonly pointerUp: (event: PointerEvent) => void;
    private readonly pointerCancel: (event: PointerEvent) => void;
    private readonly cancelEvent: (event: KeyboardEvent) => void;

    public constructor(play: Play, game: Game, waypoint: Waypoint, debug?: WaypointView) {
        this.play = play;
        this.debug = debug;

        this.pointerMove = (_: PointerEvent) => { }
        this.pointerUp = (event: PointerEvent) => {
            const activeLayer = play.layers[Math.ceil(waypoint.position.z)];
            if (activeLayer) {
                const localCoords = V2(activeLayer.toLocal(V2(event.pageX, event.pageY)));
                const nextWaypoint = game.waypoints.find(x => V2(x.position.x, x.position.y).distanceTo(localCoords) < 6);
                if (!!nextWaypoint) {
                    const exists = waypoint.exits.some(x => x.equals(nextWaypoint.position));
                    if (exists) {
                        const wIdx = waypoint.exits.findIndex(x => x.equals(nextWaypoint.position));
                        const nIdx = nextWaypoint.exits.findIndex(x => x.equals(waypoint.position));
                        if (wIdx >= 0) waypoint.exits.splice(wIdx, 1);
                        if (wIdx >= 0) nextWaypoint.exits.splice(nIdx, 1);
                    }
                    else {
                        waypoint.exits.push(nextWaypoint.position);
                        nextWaypoint.exits.push(waypoint.position);
                    }
                    this.debug?.dirty();
                }
            }
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
