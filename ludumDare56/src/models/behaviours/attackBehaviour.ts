import { IVector2 } from "../../math/vector2";
import { Entity } from "../entity";
import { DamageEvent, ParticleEvent } from "../game";
import { Behaviour, BehaviourDTO, BehaviourResult, getProperty } from "./behaviour";

export interface AttackBehaviourDTO extends BehaviourDTO {
    type: "attack";
    cooldown: number;
    damage: number;
    fromKey: string;
    particle?: AttackParticleDTO;
}

interface AttackParticleDTO { 
    id: string;
    duration: number;
    position: IVector2;
    entity?: 'self' | 'target';
}

export class AttackBehaviour implements Behaviour {
    public get active() { return this._active; }
    private _active: boolean = false;
    private owner: Entity;
    private readonly cooldown: number|string;
    private readonly damage: number | string;
    private readonly fromKey: string;
    private readonly particle?: AttackParticleDTO;
    private time: number = 0;

    public constructor(entity: Entity, data: AttackBehaviourDTO) {
        this.owner = entity;

        this.cooldown = data.cooldown;
        this.damage = data.damage;
        this.fromKey = data.fromKey;
        this.particle = data.particle;
    }

    public enter() {
        this._active = true;
        this.time = 0;
    }
    public run(delta: number): BehaviourResult {

        this.time += delta;

        const cooldown = getProperty<number>(this.owner, this.cooldown);
        if (this.time > cooldown) {
            this.time -= cooldown;

            console.log('attempt: target');

            const targetId = getProperty<number>(this.owner, this.fromKey);
            const targetValue = this.owner.properties[targetId];
            const target = this.owner.game.entities.find(x => x.id === targetValue);
            if (target) {
                const damage = getProperty<number>(this.owner, this.damage);
                target.hitpoints -= damage;

                if (this.particle) {
                    this.owner.game.dispatchGameEvent({
                        type: 'particle',
                        id: this.particle.id,
                        duration: this.particle.duration,
                        position: this.particle.position,
                        entity: this.particle.entity === 'self' ? this.owner.id : this.particle.entity === 'target' ? target.id : undefined
                    } as ParticleEvent);
                }
                this.owner.game.dispatchGameEvent({
                    type: 'damage',
                    damage: damage,
                    entity: target.id
                } as DamageEvent);

                console.log('attack: target', damage, target.hitpoints);

                if (target.hitpoints === 0) {
                    this.owner.game.kills++;
                    this.owner.game.money += 2;
                }

                return BehaviourResult.succeeded;
            }
            else {
                return BehaviourResult.failed;
            }
        }

        return BehaviourResult.active;
    }
    public exit() {
        this._active = false;
    }
}
