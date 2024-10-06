import { Entity, EntityDTO } from "./entity";
import { Modifier, ModifierDTO } from "./modifier";
import { Waypoint, WaypointDTO } from "./waypoint";


export interface State {
    type: string;
}

export interface StoryState {
    type: 'story';
    story: string;
}

export interface RunState {
    type: 'run';
}

export interface GameOverState {
    type: 'gameOver';
    reason?: string;
}

export interface GameDTO {
    entities: EntityDTO[];
    modifiers: ModifierDTO[];
    waypoints: WaypointDTO[];
    state: State;
    sandbox: boolean;
    editor: boolean;
    money: number;
    kills?: number;
    duration: number;
}

export class Game {
    public readonly sandbox: boolean;
    public readonly editor: boolean;
    public duration: number;

    public get waypoints(): ReadonlyArray<Waypoint> { return this._waypoints; }
    private _waypoints: Waypoint[] = [];

    public get entities(): ReadonlyArray<Entity> { return this._entities; }
    private _entities: Entity[] = [];

    public get modifiers(): ReadonlyArray<Modifier> { return this._modifiers; }
    private _modifiers: Modifier[] = [];

    public get state(): Readonly<State> { return this._state; }
    public set state(state: State) {
        this._state = state;
        this.dispatchEvent("changed-state", state);
    }
    private _state: State;

    public money: number;
    public kills: number;

    public constructor({ entities, modifiers, waypoints, sandbox, editor, money, kills, state, duration }: GameDTO) {
        this._entities = entities.map(x => new Entity(this, x));
        this._modifiers = modifiers.map(x => new Modifier(this, x));
        this._waypoints = waypoints.map(x => new Waypoint(this, x));
        this.editor = editor;
        this.sandbox = sandbox;
        this.money = money;
        this.kills = kills || 0;
        this._state = state;
        this.duration = duration;
    }

    public addEntity(entity: Entity) {
        this._entities.push(entity);
        this.dispatchEvent("created-entity", entity);
        return this;
    }
    public removeEntity(entity: Entity) {
        const idx = this._entities.indexOf(entity);
        if (idx >= 0) {
            this._entities.splice(idx, 1);
            this.dispatchEvent("deleted-entity", entity);
        }
        return this;
    }

    public addModifier(modifier: Modifier) {
        this._modifiers.push(modifier);
        this.dispatchEvent("created-modifier", modifier);
        return this;
    }
    public removeModifier(modifier: Modifier) {
        const idx = this._modifiers.indexOf(modifier);
        if (idx >= 0) {
            this._modifiers.splice(idx, 1);
            this.dispatchEvent("deleted-modifier", modifier);
        }
        return this;
    }

    public addWaypoint(waypoint: Waypoint) {
        this._waypoints.push(waypoint);
        this.dispatchEvent("created-waypoint", waypoint);
        return this;
    }
    public removeWaypoint(waypoint: Waypoint) {
        const idx = this._waypoints.indexOf(waypoint);
        if (idx >= 0) {
            this._waypoints.splice(idx, 1);
            this.dispatchEvent("deleted-waypoint", waypoint);
        }
        return this;
    }

    public tick(deltaTime: number) {
        if (this.state.type === 'run') {
            this.duration += deltaTime;

            for (const entity of this.entities) {
                entity.tick(deltaTime);
            }
        }
    }

    private readonly listeners: { type: string, callback: (data: any) => void }[] = [];
    public addEventListener(type: "changed-state", callback: (data: State) => void): void;
    public addEventListener(type: "created-entity", callback: (data: Entity) => void): void;
    public addEventListener(type: "deleted-entity", callback: (data: Entity) => void): void;
    public addEventListener(type: "created-modifier", callback: (data: Modifier) => void): void;
    public addEventListener(type: "deleted-modifier", callback: (data: Modifier) => void): void;
    public addEventListener(type: "created-waypoint", callback: (data: Waypoint) => void): void;
    public addEventListener(type: "deleted-waypoint", callback: (data: Waypoint) => void): void;
    public addEventListener(type: string, callback: (data: any) => void): void {
        this.listeners.push({type, callback});
    }
    protected dispatchEvent(type: "changed-state", data: State): void;
    protected dispatchEvent(type: "created-entity", data: Entity): void;
    protected dispatchEvent(type: "deleted-entity", data: Entity): void;
    protected dispatchEvent(type: "created-modifier", data: Modifier): void;
    protected dispatchEvent(type: "deleted-modifier", data: Modifier): void;
    protected dispatchEvent(type: "created-waypoint", data: Waypoint): void;
    protected dispatchEvent(type: "deleted-waypoint", data: Waypoint): void;
    protected dispatchEvent(type: string, data: any): void {
        for (const listener of this.listeners) {
            if (listener.type === type) {
                listener.callback(data);
            }
        }
    }
    public removeEventListener(type: string, callback: (data: any) => void): void {
        const idx = this.listeners.findIndex(x => x.type === type && x.callback === callback);
        if (idx >= 0) {
            this.listeners.splice(idx, 1);
        }
    }

    public serialize(): GameDTO {
        return {
            entities: this._entities.map(x=>x.serialize()),
            modifiers: this._modifiers.map(x => x.serialize()),
            waypoints: this._waypoints.map(x => x.serialize()),
            state: this._state,
            sandbox: this.sandbox,
            editor: this.editor,
            money: this.money, 
            kills: this.kills,
            duration: this.duration
        };
    }
}
