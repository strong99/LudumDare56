import { Entity } from "../entity";
import { Behaviour, BehaviourDTO, BehaviourResult } from "./behaviour";

export interface DeleteBehaviourDTO extends BehaviourDTO {
    type: "delete";
}

export class DeleteBehaviour implements Behaviour {
    public get active() { return this._active; }
    private _active: boolean = false;
    private owner: Entity;

    public constructor(entity: Entity/*, data: DeleteBehaviourDTO*/) {
        this.owner = entity;
    }

    public enter() {
        this._active = true;
    }
    public run(/*delta: number*/): BehaviourResult {
        this.owner.game.removeEntity(this.owner);
        return BehaviourResult.succeeded;
    }
    public exit() {
        this._active = false;
    }
}
