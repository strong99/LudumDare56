import { Entity } from "../entity";
import { Behaviour, BehaviourDTO, BehaviourResult } from "./behaviour";
import { CreateBehaviour } from "./behaviourFactory";

export interface AllBehaviourDTO extends BehaviourDTO {
    type: "all";
    children: BehaviourDTO[];
}

export class AllBehaviour implements Behaviour {
    private behaviours: Behaviour[];
    private index: number = 0;
    public get active(): boolean { return this._active; }
    private _active = false;

    public constructor(entity: Entity, data: AllBehaviourDTO) {
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
            if (result !== BehaviourResult.succeeded) {
                return result;
            }
            behaviour.exit();
            ++this.index;
        }
        return BehaviourResult.succeeded;
    }
    public exit() {
        this._active = false;
    }
}
