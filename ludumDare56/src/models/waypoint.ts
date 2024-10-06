import { IVector3, V3, Vector3 } from "../math/vector3";
import { Game } from "./game";

export enum WaypointType {
    normal, // for everyone
    nimble, // only nible things can climb or travel through
    drop, // something can be dropped into the sewers e.g.
    buildable,
    spawn
}

export interface WaypointDTO {
    position: IVector3;
    exits: IVector3[];
    hints?: WaypointType[];
}

export class Waypoint {
    //private readonly game: Game;
    public position: Vector3;
    public readonly exits: Vector3[];
    public readonly hints: WaypointType[];

    public constructor(_: Game, { position, exits, hints }: WaypointDTO) {
        //this.game = game;
        this.position = V3(Math.round(position.x), Math.round(position.y), position.z);
        this.exits = exits.map(x => V3(Math.round(x.x), Math.round(x.y), x.z));
        this.hints = hints ? [...hints] : [];
    }

    public serialize(): WaypointDTO {
        return {
            position: this.position,
            exits: this.exits,
            hints: this.hints
        }
    }
}
