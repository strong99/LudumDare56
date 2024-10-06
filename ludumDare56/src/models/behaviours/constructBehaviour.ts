import { Entity, EntityDTO } from "../entity";
import { Behaviour, BehaviourDTO, BehaviourResult, getProperty } from "./behaviour";

export interface ConstructBehaviourDTO extends BehaviourDTO {
    type: "construct";
    template: EntityDTO | string;
    duration: number | string;
}

export class ConstructBehaviour implements Behaviour {
    public get active() { return this._active; }
    private owner: Entity;
    private _active: boolean = false;
    private template: EntityDTO | string;
    private duration: number | string;
    private waited = 0;

    public constructor(entity: Entity, data: ConstructBehaviourDTO) {
        this.owner = entity;
        this.template = data.template;
        this.duration = data.duration;
    }

    public enter() {
        this._active = true;
        this.waited = 0;
    }
    public run(delta: number): BehaviourResult {
        this.waited += delta;

        const duration = getProperty<number>(this.owner, this.duration);
        if (this.waited > duration) {
            const template = getProperty<EntityDTO>(this.owner, this.template);

            const newEntity = new Entity(this.owner.game, { ...template, position: this.owner.position.serialize() });
            this.owner.game.addEntity(newEntity);
            return BehaviourResult.succeeded;
        }

        return BehaviourResult.active;
    }
    public exit() {
        this._active = false;
    }
}
