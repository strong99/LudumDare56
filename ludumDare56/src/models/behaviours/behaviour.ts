import { Entity } from "../entity";

export enum BehaviourResult {
    active,
    failed,
    succeeded
}

export interface BehaviourDTO {
    type: string;
}

export interface Behaviour {
    readonly active: boolean;
    enter(): void;
    run(delta: number): BehaviourResult;
    exit(): void;
}

export function getProperty<T>(entity: Entity, value: any): T {
    if (typeof value === 'string' && value.length > 0 && value[0] === '=') {
        const key = value.substring(1);
        if (key in entity.properties) {
            return entity.properties[key] as T;
        }
        else if (key in entity) {
            return (entity as any)[key] as T;
        }
    }
    return value as T;
}