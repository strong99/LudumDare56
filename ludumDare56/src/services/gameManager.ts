import waypointsFile from "./waypoints.json";
import { Game, GameDTO, StoryState } from "../models/game";
import * as storage from "./storageService";
import { EqualsBehaviourDTO } from "../models/behaviours/equalsBehaviour";
import { GameOverBehaviourDTO } from "../models/behaviours/gameOverBehaviour";

const gameSaveKey = "ld56:save";
let _game: Game | null = null;

export function load(): Game {
    const saveJson = storage.retrieve<GameDTO>(gameSaveKey);
    return new Game(saveJson);
}

export function save(): void {
    if (_game === null) {
        throw new Error("No active game");
    }
    storage.store(gameSaveKey, _game.serialize() as any);
}

export function create({ editor, sandbox, story }: {
    sandbox: boolean,
    editor: boolean,
    story: boolean
}): Game {
    const waypoints = waypointsFile;

    const safehousePosition = waypoints.reduce((a, b) => a && a.position.x < b.position.x ? a : b);

    return _game = new Game({
        entities: [{
            name: 'safehouse',
            position: safehousePosition.position,
            hitpoints: 100,
            properties: {},
            behaviour: {
                type: 'equals',
                left: '=hitpoints',
                right: 0,
                child: {
                    type: "gameOver",
                    reason: 'The safe house got over run'
                } as GameOverBehaviourDTO
            } as EqualsBehaviourDTO
        }],
        state: story ? {
            type: 'story',
            story: 'intro'
        } as StoryState : {
            type: 'run'
        },
        modifiers: [],
        money: 20,
        waypoints,
        editor,
        sandbox,
        story: story,
        duration: 0
    });
}

export function canContinue(): boolean {
    return !!_game || storage.has(gameSaveKey);
}

export function canLoad(): boolean {
    return storage.has(gameSaveKey);
}

export function get() {
    return _game;
}

export function active() {
    return !!_game;
}