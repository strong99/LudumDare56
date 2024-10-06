import { Entity } from "../entity";
import { Behaviour, BehaviourDTO, BehaviourResult } from "./behaviour";
import { CreateBehaviour } from "./behaviourFactory";

export interface AnyBehaviourDTO extends BehaviourDTO {
    type: "any";
    children: BehaviourDTO[];
}

export class AnyBehaviour implements Behaviour {
    private behaviours: Behaviour[];
    private index: number = 0;
    public get active() { return this._active; }
    private _active: boolean = false;

    public constructor(entity: Entity, data: AnyBehaviourDTO) {
        this.behaviours = !data.children ? [] : data.children.map(x => CreateBehaviour(entity, x));
    }

    public enter() {
        this.index = 0;
        this._active = true;
    }
    public run(delta: number): BehaviourResult {
        while (this.index < this.behaviours.length) {
            const behaviour = this.behaviours[this.index];
            if (!behaviour.active) {
                behaviour.enter();
            }

            const result = behaviour.run(delta);
            if (result !== BehaviourResult.active) {
                behaviour.exit();
            }
            if (result !== BehaviourResult.failed) {
                return result;
            }
            ++this.index;
        }
        return BehaviourResult.failed;
    }
    public exit() {
        this._active = false;
    }
}
