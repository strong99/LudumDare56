import { Entity } from "../entity";
import { Behaviour, BehaviourDTO, BehaviourResult, getProperty } from "./behaviour";
import { CreateBehaviour } from "./behaviourFactory";

export interface EqualsBehaviourDTO extends BehaviourDTO {
    type: "equals";
    left: number | boolean | string;
    right: number | boolean | string;
    child: BehaviourDTO;
}

export class EqualsBehaviour implements Behaviour {
    public get active() { return this._active; }
    private _active: boolean = false;
    private owner: Entity;
    private readonly child: Behaviour;

    private readonly left: number | boolean | string;
    private readonly right: number | boolean | string;

    public constructor(entity: Entity, data: EqualsBehaviourDTO) {
        this.owner = entity;

        this.left = data.left;
        this.right = data.right;

        this.child = CreateBehaviour(entity, data.child);
    }

    private started = false;
    public enter() {
        this._active = true;
    }
    public run(delta: number): BehaviourResult {

        const left = getProperty(this.owner, this.left);
        const right = getProperty(this.owner, this.right);
        if (left === right) {
            if (!this.started) {
                this.child.enter();
                this.started = true;
            }
            const result = this.child.run(delta);
            if (result !== BehaviourResult.active) {
                this.child.exit();
                this.started = false;
            }
            return result;
        }

        return BehaviourResult.failed;
    }
    public exit() {
        this._active = false;
    }
}
