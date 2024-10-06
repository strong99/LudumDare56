import { Entity } from "../entity";
import { GameOverState, StoryState } from "../game";
import { Behaviour, BehaviourDTO, BehaviourResult } from "./behaviour";

export interface GameOverBehaviourDTO extends BehaviourDTO {
    type: "gameOver";
    reason?: string;
}

export class GameOverBehaviour implements Behaviour {
    public get active() { return this._active; }
    private _active: boolean = false;
    private owner: Entity;

    private readonly reason?: string;

    public constructor(entity: Entity, data: GameOverBehaviourDTO) {
        this.owner = entity;
        this.reason = data.reason;
    }

    public enter() {
        this._active = true;
    }
    public run(/*delta: number*/): BehaviourResult {
        console.log('game over behaviour');

        const gameOverState = {
            type: 'gameOver',
            reason: this.reason
        } as GameOverState;

        this.owner.game.state = this.owner.game.story ? {
            type: 'story',
            story: 'outro',
            followUp: gameOverState
        } as StoryState : gameOverState;
        return BehaviourResult.succeeded;
    }
    public exit() {
        this._active = false;
    }
}
