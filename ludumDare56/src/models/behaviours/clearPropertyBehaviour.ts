import { Entity } from "../entity";
import { Behaviour, BehaviourDTO, BehaviourResult, getProperty } from "./behaviour";

export interface ClearPropertyBehaviourDTO extends BehaviourDTO {
    type: "clearProperty";
    property: string;
}

export class ClearPropertyBehaviour implements Behaviour {
    public get active() { return this._active; }
    private _active: boolean = false;
    private owner: Entity;
    private property: string;

    public constructor(entity: Entity, data: ClearPropertyBehaviourDTO) {
        this.owner = entity;
        this.property = data.property;
    }

    public enter() {
        this._active = true;
    }
    public run(/*delta: number*/): BehaviourResult {

        const property = getProperty<string>(this.owner, this.property);
        if (property && this.owner.properties[property]) {
            delete this.owner.properties[property];
            return BehaviourResult.succeeded;
        }

        return BehaviourResult.failed;
    }
    public exit() {
        this._active = false;
    }
}
