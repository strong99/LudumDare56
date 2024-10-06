import { Entity } from "../entity";
import { Behaviour, BehaviourDTO, BehaviourResult, getProperty } from "./behaviour";
import { CreateBehaviour } from "./behaviourFactory";

export interface HasPropertyBehaviourDTO extends BehaviourDTO {
    type: "hasProperty";
    property: string;
    child: BehaviourDTO;
}

export class HasPropertyBehaviour implements Behaviour {
    public get active() { return this._active; }
    private _active: boolean = false;
    private owner: Entity;
    private property: string;
    private child: Behaviour;

    public constructor(entity: Entity, data: HasPropertyBehaviourDTO) {
        this.owner = entity;
        this.property = data.property;
        this.child = CreateBehaviour(this.owner, data.child);
    }

    private started = false;
    public enter() {
        this._active = true;
    }
    public run(delta: number): BehaviourResult {

        const property = getProperty<string>(this.owner, this.property);
        if (property && this.owner.properties[property]) {
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
