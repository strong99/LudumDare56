import playTemplate from './play.html?raw'
import { FragmentHTMLElement } from './fragment';
import { createMenuLayout } from './menuLayout';
import { Application, Assets, ColorMatrixFilter, Container, Sprite, Text, Ticker } from 'pixi.js';
import { Entity } from '../models/entity';
import { DamageEvent, Event, Game, GameOverState, State } from '../models/game';
import * as game from '../services/gameManager';
import { EntityView } from './play/entityView';
import { WaypointView } from "./play/waypointDebugView";
import { V2, Vector2 } from '../math/vector2';
import { AllBehaviourDTO } from '../models/behaviours/allBehaviour';
import { V3, Vector3 } from '../math/vector3';
import { GoToBehaviourDTO } from '../models/behaviours/goToBehaviour';
import { ConstructBehaviourDTO } from '../models/behaviours/constructBehaviour';
import { DeleteBehaviourDTO } from '../models/behaviours/deleteBehaviour';
import { Waypoint, WaypointType } from '../models/waypoint';
import { Tool } from './play/tool';
import { MoveWaypointTool } from './play/moveWaypointTool';
import { ConnectWaypointTool } from './play/connectWaypointTool';
import { PlaceOnPathTool } from './play/placeOnPathTool';
import { clamp } from '../math/utils';
import { AttackBehaviourDTO } from '../models/behaviours/attackBehaviour';
import { InRangeBehaviourDTO } from '../models/behaviours/inRangeBehaviour';
import { AnyBehaviourDTO } from '../models/behaviours/anyBehaviour';
import { HasPropertyBehaviourDTO } from '../models/behaviours/hasPropertyBehaviour';
import { ClearPropertyBehaviourDTO } from '../models/behaviours/clearPropertyBehaviour';
import { SettingsManager } from '../services/settingsManager';
import { createStory } from './story';

const playElementName = "ld56-play";
export class Play extends FragmentHTMLElement {
    public get name(): string { return "play"; }
    public get layers(): readonly Container[] { return this._layers; }
    private visuals?: Application;
    private _layers: Container[] = [];
    private game?: Game | null;
    private sky?: Sprite;

    private wrapper?: HTMLDivElement;

    private entities: EntityView[] = [];
    private debugWaypoints?: WaypointView;
    private tool?: Tool;

    private scrollHorizontale: number = 0;

    private mouseCoords = V2();
    private canvasHover = false;

    private money?: HTMLSpanElement;
    private kills?: HTMLSpanElement;
    private survival?: HTMLSpanElement;
    private survivalTracker?: Entity;

    private tick: (ticker: Ticker) => void;
    private pointerDown: (event: PointerEvent) => void;
    private pointerMove: (event: PointerEvent) => void;
    private pointerOut: (event: PointerEvent) => void;
    private addEntity: (entity: Entity) => void;
    private removeEntity: (entity: Entity) => void;
    private keydown: (args: KeyboardEvent) => void;
    private stateChanged: (args: State) => void;
    private eventListener: (args: Event) => void;

    public constructor() {
        super();

        this.keydown = (args: KeyboardEvent) => {
            const isEditor = this.getAttribute('editor') === 'true';
            if (this.canvasHover) {
                if (isEditor && args.key === "Insert") {
                    const layer = this.layers[this.layerIdx];
                    const localCoords = layer.toLocal(V2(this.mouseCoords.x, this.mouseCoords.y));
                    this.game?.addWaypoint(new Waypoint(this.game, { position: V3(localCoords.x, localCoords.y, this.layerIdx), exits: [] }));
                    this.debugWaypoints?.dirty();
                }
                else if (isEditor && args.key === ",") {
                    const layer = this.layers[this.layerIdx];
                    const mousePosition = V2(layer.toLocal(V2(this.mouseCoords.x, this.mouseCoords.y)));
                    const waypoint = this.game?.waypoints.find(x => Math.ceil(x.position.z) == this.layerIdx && V2(x.position.x, x.position.y).distanceTo(mousePosition) < 6);
                    const idx = waypoint?.hints.indexOf(WaypointType.nimble) ?? -1;
                    if (idx >= 0) {
                        waypoint?.hints.splice(idx, 1);
                    }
                    else {
                        waypoint?.hints.push(WaypointType.nimble);
                    }
                    this.debugWaypoints?.dirty();
                }
                else if (isEditor && args.key === ".") {
                    const layer = this.layers[this.layerIdx];
                    const mousePosition = V2(layer.toLocal(V2(this.mouseCoords.x, this.mouseCoords.y)));
                    const waypoint = this.game?.waypoints.find(x => Math.ceil(x.position.z) == this.layerIdx && V2(x.position.x, x.position.y).distanceTo(mousePosition) < 6);
                    const idx = waypoint?.hints.indexOf(WaypointType.drop) ?? -1;
                    if (idx >= 0) {
                        waypoint?.hints.splice(idx, 1);
                    }
                    else {
                        waypoint?.hints.push(WaypointType.drop);
                    }
                    this.debugWaypoints?.dirty();
                }
                else if (isEditor && args.key === "/") {
                    const layer = this.layers[this.layerIdx];
                    const mousePosition = V2(layer.toLocal(V2(this.mouseCoords.x, this.mouseCoords.y)));
                    const waypoint = this.game?.waypoints.find(x => Math.ceil(x.position.z) == this.layerIdx && V2(x.position.x, x.position.y).distanceTo(mousePosition) < 6);
                    const idx = waypoint?.hints.indexOf(WaypointType.normal) ?? -1;
                    if (idx >= 0) {
                        waypoint?.hints.splice(idx, 1);
                    }
                    else {
                        waypoint?.hints.push(WaypointType.normal);
                    }
                    this.debugWaypoints?.dirty();
                }
                else if (isEditor && args.key === "m") {
                    const layer = this.layers[this.layerIdx];
                    const mousePosition = V2(layer.toLocal(V2(this.mouseCoords.x, this.mouseCoords.y)));
                    const waypoint = this.game?.waypoints.find(x => Math.ceil(x.position.z) == this.layerIdx && V2(x.position.x, x.position.y).distanceTo(mousePosition) < 6);
                    const idx = waypoint?.hints.indexOf(WaypointType.buildable) ?? -1;
                    if (idx >= 0) {
                        waypoint?.hints.splice(idx, 1);
                    }
                    else {
                        waypoint?.hints.push(WaypointType.buildable);
                    }
                    this.debugWaypoints?.dirty();
                }
                else if (isEditor && args.key === "n") {
                    const layer = this.layers[this.layerIdx];
                    const mousePosition = V2(layer.toLocal(V2(this.mouseCoords.x, this.mouseCoords.y)));
                    const waypoint = this.game?.waypoints.find(x => Math.ceil(x.position.z) == this.layerIdx && V2(x.position.x, x.position.y).distanceTo(mousePosition) < 6);
                    const idx = waypoint?.hints.indexOf(WaypointType.spawn) ?? -1;
                    if (idx >= 0) {
                        waypoint?.hints.splice(idx, 1);
                    }
                    else {
                        waypoint?.hints.push(WaypointType.spawn);
                    }
                    this.debugWaypoints?.dirty();
                }
                else if (isEditor && args.key === "+") {
                    const layer = this.layers[this.layerIdx];
                    const mousePosition = V2(layer.toLocal(V2(this.mouseCoords.x, this.mouseCoords.y)));
                    const waypoint = this.game?.waypoints.find(x => Math.ceil(x.position.z) == this.layerIdx && V2(x.position.x, x.position.y).distanceTo(mousePosition) < 6);
                    if (waypoint) {
                        const oldPosition = V3(waypoint.position);
                        waypoint.position.z = clamp(this.layerIdx - 1 + 0.02, waypoint.position.z + 0.24, this.layerIdx - 0.02);
                        this.updateWaypointExitsTo(oldPosition, waypoint.position);
                        this.debugWaypoints?.dirty();
                    }
                }
                else if (isEditor && args.key === "-") {
                    const layer = this.layers[this.layerIdx];
                    const mousePosition = V2(layer.toLocal(V2(this.mouseCoords.x, this.mouseCoords.y)));
                    const waypoint = this.game?.waypoints.find(x => Math.ceil(x.position.z) == this.layerIdx && V2(x.position.x, x.position.y).distanceTo(mousePosition) < 6);
                    if (waypoint) {
                        const oldPosition = V3(waypoint.position);
                        waypoint.position.z = clamp(this.layerIdx - 1 + 0.02, waypoint.position.z - 0.24, this.layerIdx - 0.02);
                        this.updateWaypointExitsTo(oldPosition, waypoint.position);
                        this.debugWaypoints?.dirty();
                    }
                }
                else if (isEditor && args.key === "Delete") {
                    const layer = this.layers[this.layerIdx];
                    const mousePosition = V2(layer.toLocal(V2(this.mouseCoords.x, this.mouseCoords.y)));
                    const waypoint = this.game?.waypoints.find(x => Math.ceil(x.position.z) == this.layerIdx && V2(x.position.x, x.position.y).distanceTo(mousePosition) < 6);
                    if (waypoint) {
                        this.game?.removeWaypoint(waypoint);

                        for (const nextWaypoint of this.game?.waypoints ?? []) {
                            const idx = nextWaypoint.exits.findIndex(x => x.equals(waypoint.position));
                            if (idx >= 0) {
                                nextWaypoint.exits.splice(idx, 1);
                            }
                        }

                        this.debugWaypoints?.dirty();
                    }
                }
                else if (isEditor && args.key === "s" && args.ctrlKey) {
                    navigator.clipboard.writeText(JSON.stringify(this.game?.waypoints.map(x => x.serialize())));
                    args.preventDefault();
                    args.stopImmediatePropagation()
                }
            }
        };
        this.pointerDown = (args: PointerEvent) => {
            if (this.tool) {
                return;
            }

            const layer = this.layers[this.layerIdx];
            const mousePosition = V2(layer.toLocal(V2(args.pageX, args.pageY)));
            const waypoint = this.game?.waypoints.find(x => Math.ceil(x.position.z) == this.layerIdx && V2(x.position.x, x.position.y).distanceTo(mousePosition) < 6);
            if (waypoint) {
                console.log(args.button);
                if (args.button === 0) {
                    this.setTool(new MoveWaypointTool(this, this.game!, waypoint, this.debugWaypoints));
                }
                else if (args.button === 1) {
                    this.setTool(new ConnectWaypointTool(this, this.game!, waypoint, this.debugWaypoints));
                }
                args.preventDefault();
            }
        };
        this.pointerOut = (_: PointerEvent) => {
            this.scrollHorizontale = 0;
            this.canvasHover = false;
        };
        this.pointerMove = (event: PointerEvent) => {
            this.canvasHover = true;
            const target = (event.target as HTMLElement);
            const boundingBox = target.getBoundingClientRect();
            const padding = 50;
            this.mouseCoords.x = event.pageX;
            this.mouseCoords.y = event.pageY;
            if (event.pageX < boundingBox.x + padding) {
                this.scrollHorizontale = +1;
            }
            else if (event.pageX > boundingBox.x + boundingBox.width - padding) {
                this.scrollHorizontale = -1;
            }
            else {
                this.scrollHorizontale = 0;
            }
        };
        const scrollSpeed = 5;
        let spawnMouseInterval = 5000;
        let spawnRatInterval = 20000;
        let spawnGoblinInterval = 60000;
        let lastMoney = 0;
        this.tick = (ticker: Ticker) => {
            if (this.scrollHorizontale !== 0) {
                const newX = this.visuals!.stage.position.x + this.scrollHorizontale * ticker.deltaTime * scrollSpeed;
                this.visuals!.stage.position.x = clamp((-1080 * 4 * this.visuals!.stage.scale.x) + this.wrapper!.clientWidth, newX, 0);
            }

            this.debugWaypoints?.tick(ticker.deltaTime);

            this.sky!.position.x = -this.visuals!.stage.position.x / this.visuals!.stage.scale.x;
            for (let i = 0; i < this.layers.length; ++i) {
                this.layers[i].position.x = -this.visuals!.stage.position.x * (i / 10);
            }

            if (this.game?.state.type === 'run') {
                this.kills!.textContent = this.game!.kills.toString();

                if (lastMoney !== this.game!.money) {
                    lastMoney = this.game!.money;
                    this.money!.textContent = this.game!.money.toString();

                    for (const t in this.constructTemplates) {
                        this.updateBuyButton(t);
                    }
                }

                if (this.survivalTracker) {
                    const maxHitpoints = this.survivalTracker.maxHitpoints;
                    const hitpoints = clamp(0, this.survivalTracker.hitpoints, maxHitpoints)
                    this.survival!.textContent = `${hitpoints} / ${maxHitpoints}`;
                }

                try {
                    this.game?.tick(ticker.deltaTime);
                } catch (e) {
                    console.error(e);
                }

                for (const entity of this.entities) {
                    try {
                        entity.tick(ticker.deltaTime);
                    } catch (e) {
                        console.error(e);
                    }
                }

                spawnMouseInterval -= ticker.deltaMS;
                if (spawnMouseInterval < 0) {
                    const targetPosition = this.game!.waypoints.reduce((a, b) => a && (a.position.x < b.position.x || a.hints.includes(WaypointType.spawn)) ? a : b).position;
                    this.createMouse(targetPosition);
                    spawnMouseInterval += 5000;
                }
                spawnRatInterval -= ticker.deltaMS;
                if (spawnRatInterval < 0) {
                    const targetPosition = this.game!.waypoints.reduce((a, b) => a && (a.position.x < b.position.x || a.hints.includes(WaypointType.spawn)) ? a : b).position;
                    this.createRat(targetPosition);
                    spawnRatInterval += 10000;
                }
                spawnGoblinInterval -= ticker.deltaMS;
                if (spawnGoblinInterval < 0) {
                    const targetPosition = this.game!.waypoints.reduce((a, b) => a && (a.position.x < b.position.x || a.hints.includes(WaypointType.spawn)) ? a : b).position;
                    this.createGoblin(targetPosition);
                    spawnGoblinInterval += 45000;
                }
            }

            for (let x = this.particles.length - 1; x >= 0; --x) {
                const particle = this.particles[x];
                particle.duration -= ticker.deltaTime;
                particle.node.position.set(
                    particle.node.position.x + particle.direction.x * ticker.deltaTime,
                    particle.node.position.y + particle.direction.y * ticker.deltaTime
                );
                if (particle.duration < 0) {
                    particle.node.removeFromParent();
                    this.particles.splice(x, 1);
                }
            }
        };
        this.addEntity = (entity: Entity) => {
            console.log('created entity');
            this.entities.push(new EntityView(this, entity, this.visuals!.stage));
        }
        this.removeEntity = (entity: Entity) => {
            const idx = this.entities.findIndex(x => x.is(entity));
            if (idx >= 0) {
                console.log('deleted entity');
                this.entities[idx].destroy();
                this.entities.splice(idx, 1);
            }
        }
        this.stateChanged = (_: State) => {
            this.handleState();
        }
        this.eventListener = (event: Event) => {
            if (event.type === 'damage') {
                const damageEvent = event as DamageEvent;
                console.log('event received: ', damageEvent.entity, damageEvent.damage);
                const entity = this.game?.entities.find(x => x.id === damageEvent.entity);
                const view = this.entities.find(x => x.is(entity));
                if (!entity || !view) {
                    return;
                }
                this.addDamageParticle(V3(entity.position.x, entity.position.y - view.height, entity.position.z), damageEvent.damage);
            }
        }
    }

    private particles: { duration: number; node: Container, direction: Vector2 }[] = [];
    private addDamageParticle(position: Vector3, damage: number) {
        const layerIdx = Math.ceil(position.z);
        const layer = this._layers[layerIdx];
        const text = new Text(`-${damage}`);
        text.anchor.set(0.5, 1);
        text.position.set(position.x, position.y);
        text.zIndex = 999;
        layer.addChild(text);

        this.particles.push({
            duration: 50,
            node: text,
            direction: V2(0, -2)
        });
    }

    private handleState() {
        if (!this.game) {
            console.error('game is not set');
            throw new Error();
        }

        const state = this.game.state;
        if (state.type === 'story') {
            this.replaceWith(createStory());
        }
        else if (state.type === 'gameOver') {
            const gameOverState = state as Readonly<GameOverState>;
            const modal = this.querySelector('.gameOver.popup.modal') as HTMLDialogElement;
            if (!modal) {
                throw new Error('incomplete HTML could not find the game over popup');
            }
            modal.classList.add('show');
            modal.showModal();
            modal.querySelector('p.reason')!.textContent = gameOverState.reason ?? 'you lost the game';

            (modal.querySelector('p.score span.score') as HTMLSpanElement).textContent = Math.ceil(this.game!.duration).toString();
        }
    }

    private updateWaypointExitsTo(_old: Vector3, _new: Vector3) {
        if (!this.game) {
            return;
        }
        for (const waypoint of this.game.waypoints) {
            for (let i = 0; i < waypoint.exits.length; ++i) {
                const exit = waypoint.exits[i];
                if (exit.equals(_old)) {
                    waypoint.exits[i] = _new;
                    console.log('updated waypoint exit');
                }
            }
        }
    }

    public setTool(tool: Tool | null) {
        this.tool?.disconnectedCallback();
        if (!tool) {
            delete this.tool;
        }
        else {
            this.tool = tool;
            this.tool.connectedCallback();
        }
    }

    public async connectedCallback(): Promise<void> {
        this.innerHTML = playTemplate;

        this.game = game.get();
        if (!this.game) {
            throw new Error();
        }

        if (this.game.state.type === "story") {
            setTimeout(() => this.replaceWith(createStory()));
            return;
        }

        if (this.game.sandbox) {
            this.setAttribute('sandbox', 'true');
        }
        if (this.game.editor) {
            this.setAttribute('editor', 'true');
        }

        const audios = this.querySelectorAll('audio');
        const settingsManager = new SettingsManager();
        for (const audio of audios) {
            audio.volume = (audio.classList.contains('music') ? settingsManager.musicVolume : settingsManager.effectVolume) * settingsManager.allVolume;
        }

        this.survivalTracker = this.game.entities.find(x => x.name === 'safehouse');

        this.wrapper = this.querySelector('.canvas-wrapper') as HTMLDivElement;
        this.money = this.querySelector('label.money > span.value') as HTMLSpanElement;
        this.kills = this.querySelector('label.kills > span.value') as HTMLSpanElement;
        this.survival = this.querySelector('label.survival > span.value') as HTMLSpanElement;

        this.wrapper.addEventListener('wheel', args => {
            console.log(args.deltaX);
            if (args.deltaY === 0) {
                return;
            }
            this.activeLayer = clamp(0, this.activeLayer + (args.deltaY > 0 ? 1 : -1), this.layers.length - 1);
            this.hideLayersBefore(this.activeLayer);
        });

        this.visuals = new Application();
        setTimeout(this.visuals.resize, 10);
        await this.visuals.init({
            canvas: this.querySelector('canvas') as HTMLCanvasElement,
            resizeTo: this.wrapper,
            background: '#1099bb'
        });
        await Assets.init({
            basePath: 'ldjam56/'
        });

        const skyAsset = await Assets.load('/assets/sky.png');
        this.sky = new Sprite(skyAsset);
        this.sky.scale.set(3);
        this.visuals.stage.addChild(this.sky);

        const resize = () => {
            const scale = this.wrapper!.clientHeight / 1080;
            this.visuals?.stage.scale.set(scale);
        };
        window.addEventListener('resize', resize);
        resize();

        this.listen('[name|="btn-layer"]', 'click', (args: InputEvent) => {
            const layerIdx = Number((args.target as HTMLElement).getAttribute('data-layer'));
            this.hideLayersBefore(layerIdx);
        });

        for (const entity of this.game.entities) {
            this.addEntity(entity);
        }

        this.listenOnce('[name="btn-menu"]', 'click', () => {
            this.replaceWith(createMenuLayout());
        });

        this.listen('[name="doctor"]', 'click', () => this.setTool(new PlaceOnPathTool(this, this.game!, this.visuals!.stage, p => this.createDoctor(p))));
        this.listen('[name="purger"]', 'click', () => this.setTool(new PlaceOnPathTool(this, this.game!, this.visuals!.stage, p => this.createPurger(p))));
        this.listen('[name="mouse-trap"]', 'click', () => this.setTool(new PlaceOnPathTool(this, this.game!, this.visuals!.stage, p => this.createMouseTrap(p))));
        this.listen('[name="shock-tower"]', 'click', () => this.setTool(new PlaceOnPathTool(this, this.game!, this.visuals!.stage, p => this.createShockTower(p))));

        this.game.addEventListener('changed-state', this.stateChanged);
        this.game.addEventListener('created-entity', this.addEntity);
        this.game.addEventListener('deleted-entity', this.removeEntity);
        this.game.addEventListener('event', this.eventListener);

        this.wrapper.addEventListener('pointerdown', this.pointerDown);
        this.wrapper.addEventListener('pointermove', this.pointerMove);
        this.wrapper.addEventListener('pointerout', this.pointerOut);

        document.addEventListener('keydown', this.keydown);

        for (let x = 2; x >= 0; --x) {
            const layer = new Container();
            layer.sortableChildren = true;
            for (let y = 0; y < 4; ++y) {
                const assetBack = await Assets.load(`/assets/layers-${(x + 1).toString().padStart(2, '0')}-back-${(y + 1).toString().padStart(2, '0')}.png`);
                const assetFront = await Assets.load(`/assets/layers-${(x + 1).toString().padStart(2, '0')}-front-${(y + 1).toString().padStart(2, '0')}.png`);
                const layerTileBack = new Sprite(assetBack);
                const layerTileFront = new Sprite(assetFront);
                layerTileBack.position.x = y * 1080;
                layerTileFront.position.x = y * 1080;
                layerTileFront.zIndex = 0.66;
                layerTileBack.zIndex = 0.33;
                layer.addChild(layerTileBack);
                layer.addChild(layerTileFront);
            }
            this.visuals.stage.addChild(layer);
            this._layers.unshift(layer);
        }

        if (this.getAttribute('editor') === 'true') {
            this.debugWaypoints = new WaypointView(this, this.game, this.visuals.stage);
        }
        this.hideLayersBefore(this.layerIdx);

        this.repairWaypoints();
        this.handleState();
        this.visuals.ticker.add(this.tick);
    }

    private repairWaypoints() {
        let repaired = 0;
        let deleted = 0;
        for (const exitWaypoint of this.game!.waypoints) {
            for (let y = 0; y < exitWaypoint.exits.length; ++y) {
                const exit = exitWaypoint.exits[y];
                const exitZ = Math.ceil(exit.z);
                const exit3 = V3(exit.x, exit.y, exitZ);
                let found = false;
                for (const waypoint of this.game!.waypoints) {
                    const sourceZ = Math.ceil(waypoint.position.z);
                    const source3 = V3(waypoint.position.x, waypoint.position.y, sourceZ);

                    if (source3.distanceTo(exit3) < 6) {
                        found = true;
                        if (!exit.equals(waypoint.position)) {
                            exitWaypoint.exits[y] = waypoint.position;
                            ++repaired;
                            console.log('waypoint repaired', exit, waypoint.position, exitWaypoint.exits[y]);
                        }
                    }
                }
                if (!found) {
                    ++deleted;
                    exitWaypoint.exits.splice(y, 1);
                    --y;
                }
            }
        }
        console.log(`repaired ${repaired} and deleted ${repaired} waypoint exits`);
    }

    public createMouse(p: Vector3) {
        const spawnPosition = this.game!.waypoints.reduce((a, b) => a && (a.position.x > b.position.x || !b.hints.includes(WaypointType.spawn)) ? a : b).position;
        console.log('createMouse', p, spawnPosition);
        this.game!.addEntity(new Entity(this.game!, {
            name: 'mouse',
            hitpoints: 5,
            position: spawnPosition,
            properties: {
                targetPosition: p.serialize(),
                spawnPosition: spawnPosition.serialize()
            },
            behaviour: {
                type: 'any',
                children: [
                    {
                        type: 'inRange',
                        max: 20,
                        targets: ['safehouse'],
                        toKey: 'target',
                        child: {
                            type: 'attack',
                            fromKey: 'target',
                            cooldown: 6,
                            damage: 3
                        } as AttackBehaviourDTO
                    } as InRangeBehaviourDTO,
                    {
                        type: 'goto',
                        position: '=targetPosition'
                    } as GoToBehaviourDTO,
                    {
                        type: 'delete'
                    }
                ]
            } as AnyBehaviourDTO
        }));
    }
    public createRat(p: Vector3) {
        const spawnPosition = this.game!.waypoints.reduce((a, b) => a && (a.position.x > b.position.x || !b.hints.includes(WaypointType.spawn)) ? a : b).position;
        console.log('createRat', p, spawnPosition);
        this.game!.addEntity(new Entity(this.game!, {
            name: 'rat',
            hitpoints: 6,
            position: spawnPosition,
            properties: {
                targetPosition: p.serialize(),
                spawnPosition: spawnPosition.serialize()
            },
            behaviour: {
                type: 'any',
                children: [
                    {
                        type: 'inRange',
                        max: 20,
                        targets: ['safehouse'],
                        toKey: 'target',
                        child: {
                            type: 'attack',
                            fromKey: 'target',
                            cooldown: 6,
                            damage: 3
                        } as AttackBehaviourDTO
                    } as InRangeBehaviourDTO,
                    {
                        type: 'goto',
                        position: '=targetPosition'
                    } as GoToBehaviourDTO,
                    {
                        type: 'delete'
                    }
                ]
            } as AnyBehaviourDTO
        }));
    }
    public createGoblin(p: Vector3) {
        const spawnPosition = this.game!.waypoints.reduce((a, b) => a && (a.position.x > b.position.x || !b.hints.includes(WaypointType.spawn)) ? a : b).position;
        console.log('createGoblin', p, spawnPosition);
        this.game!.addEntity(new Entity(this.game!, {
            name: 'goblin',
            hitpoints: 9,
            position: spawnPosition,
            properties: {
                targetPosition: p.serialize(),
                spawnPosition: spawnPosition.serialize()
            },
            behaviour: {
                type: 'any',
                children: [
                    {
                        type: 'inRange',
                        max: 20,
                        targets: ['safehouse'],
                        toKey: 'target',
                        child: {
                            type: 'attack',
                            fromKey: 'target',
                            cooldown: 10,
                            damage: 3
                        } as AttackBehaviourDTO
                    } as InRangeBehaviourDTO,
                    {
                        type: 'goto',
                        position: '=targetPosition'
                    } as GoToBehaviourDTO,
                    {
                        type: 'delete'
                    }
                ]
            } as AnyBehaviourDTO
        }));
    }

    public createDoctor(p: Vector3) {
        const template = this.constructTemplates['doctor'];
        if (!this.game?.sandbox && (!template || template.cost > (this.game?.money ?? 0))) {
            return;
        }

        this.game!.money -= template.cost;

        console.log('createDoctor', p);
        const spawnPosition = this.game!.waypoints.reduce((a, b) => a && (a.position.x < b.position.x || a.hints.includes(WaypointType.spawn)) ? a : b).position;
        this.game!.addEntity(new Entity(this.game!, {
            name: 'doctor',
            hitpoints: 6,
            position: spawnPosition,
            properties: {
                targetPosition: p.serialize(),
                spawnPosition: spawnPosition.serialize()
            },
            behaviour: {
                type: 'any',
                children: [
                    {
                        type: 'hasProperty',
                        property: 'targetPosition',
                        child: {
                            type: 'all',
                            children: [
                                {
                                    type: 'goto',
                                    position: '=targetPosition',
                                    never: [WaypointType.nimble]
                                } as GoToBehaviourDTO,
                                {
                                    type: 'clearProperty',
                                    property: 'targetPosition'
                                } as ClearPropertyBehaviourDTO
                            ]
                        } as AllBehaviourDTO
                    } as HasPropertyBehaviourDTO,
                    {
                        type: 'inRange',
                        max: 600,
                        targets: ['purger', 'mouseTrap', 'shockTower'],
                        toKey: 'target',
                        child: {
                            type: 'all',
                            children: [
                                {
                                    type: 'goto',
                                    position: '=target',
                                    never: [WaypointType.nimble]
                                } as GoToBehaviourDTO
                            ]
                        } as AllBehaviourDTO
                    } as InRangeBehaviourDTO
                ]
            } as AnyBehaviourDTO
        }));
    }
    public createPurger(p: Vector3) {
        const template = this.constructTemplates['purger'];
        if (!this.game?.sandbox && (!template || template.cost > (this.game?.money ?? 0))) {
            return;
        }

        this.game!.money -= template.cost;

        const spawnPosition = V3(0, 768, 0);
        this.game!.addEntity(new Entity(this.game!, {
            name: 'purger',
            hitpoints: 10,
            position: spawnPosition,
            properties: {
                targetPosition: p.serialize(),
                spawnPosition: spawnPosition.serialize()
            },
            behaviour: {
                type: 'any',
                children: [
                    {
                        type: 'hasProperty',
                        property: 'targetPosition',
                        child: {
                            type: 'all',
                            children: [
                                {
                                    type: 'goto',
                                    position: '=targetPosition',
                                    minDistance: 30,
                                    never: [WaypointType.nimble]
                                } as GoToBehaviourDTO,
                                {
                                    type: 'clearProperty',
                                    property: 'targetPosition'
                                } as ClearPropertyBehaviourDTO
                            ]
                        } as AllBehaviourDTO
                    } as HasPropertyBehaviourDTO,
                    {
                        type: 'inRange',
                        max: 200,
                        targets: ['mouse', 'rat', 'goblin'],
                        toKey: 'target',
                        child: {
                            type: 'attack',
                            fromKey: 'target',
                            cooldown: 6,
                            damage: 2
                        } as AttackBehaviourDTO
                    } as InRangeBehaviourDTO,
                    {
                        type: 'inRange',
                        max: 400,
                        targets: ['mouse', 'rat', 'goblin'],
                        toKey: 'target',
                        child: {
                            type: 'goto',
                            position: '=target',
                            minDistance: 200,
                            never: [WaypointType.nimble]
                        } as GoToBehaviourDTO,
                    } as InRangeBehaviourDTO
                ]
            } as AnyBehaviourDTO
        }));
    }
    public createMouseTrap(p: Vector3) {
        const template = this.constructTemplates['mouse trap'];
        if (!this.game?.sandbox && (!template || template.cost > (this.game?.money ?? 0))) {
            return;
        }

        this.game!.money -= template.cost;

        const spawnPosition = V3(0, 768, 0);
        this.game!.addEntity(new Entity(this.game!, {
            name: 'engineer',
            hitpoints: 6,
            position: spawnPosition,
            properties: {
                targetPosition: p.serialize(),
                spawnPosition: spawnPosition.serialize()
            },
            behaviour: {
                type: 'all',
                children: [
                    {
                        type: 'goto',
                        position: '=targetPosition',
                        never: [WaypointType.nimble]
                    } as GoToBehaviourDTO,
                    {
                        type: 'construct',
                        duration: 100,
                        template: {
                            name: 'mouseTrap',
                            position: V3().serialize(),
                            properties: {},
                            hitpoints: 25,
                            behaviour: {
                                type: 'inRange',
                                max: 100,
                                targets: ['mouse', 'rat'],
                                toKey: 'target',
                                child: {
                                    type: 'attack',
                                    fromKey: 'target',
                                    cooldown: 10,
                                    damage: 3
                                } as AttackBehaviourDTO
                            } as InRangeBehaviourDTO,
                        }
                    } as ConstructBehaviourDTO,
                    {
                        type: 'goto',
                        position: '=spawnPosition',
                        never: [WaypointType.nimble]
                    } as GoToBehaviourDTO,
                    {
                        type: 'delete'
                    } as DeleteBehaviourDTO
                ]
            } as AllBehaviourDTO
        }));
    }
    public createShockTower(p: Vector3) {
        const template = this.constructTemplates['shock tower'];
        if (!this.game?.sandbox && (!template || template.cost > (this.game?.money ?? 0))) {
            return;
        }

        this.game!.money -= template.cost;

        const spawnPosition = V3(0, 768, 0);
        this.game!.addEntity(new Entity(this.game!, {
            name: 'engineer',
            hitpoints: 6,
            position: spawnPosition,
            properties: {
                targetPosition: p.serialize(),
                spawnPosition: spawnPosition.serialize()
            },
            behaviour: {
                type: 'all',
                children: [
                    {
                        type: 'goto',
                        position: '=targetPosition',
                        never: [WaypointType.nimble]
                    } as GoToBehaviourDTO,
                    {
                        type: 'construct',
                        duration: 100,
                        template: {
                            name: 'shockTower',
                            position: V3().serialize(),
                            properties: {},
                            hitpoints: 100,
                            behaviour: {
                                type: 'inRange',
                                max: 200,
                                targets: ['mouse', 'rat', 'goblin'],
                                toKey: 'target',
                                child: {
                                    type: 'attack',
                                    fromKey: 'target',
                                    cooldown: 5,
                                    damage: 2
                                } as AttackBehaviourDTO
                            } as InRangeBehaviourDTO,
                        }
                    } as ConstructBehaviourDTO,
                    {
                        type: 'goto',
                        position: '=spawnPosition',
                        never: [WaypointType.nimble]
                    } as GoToBehaviourDTO,
                    {
                        type: 'delete'
                    } as DeleteBehaviourDTO
                ]
            } as AllBehaviourDTO
        }));
    }

    private updateBuyButton(type: string) {
        const template = (this.constructTemplates as any)[type];
        const button = this.querySelector(`.buildmenu button[name="${type.replace(' ', '-')}"]`);
        if (button && template) {
            button.querySelector('.cost')!.textContent = template.cost.toString();
            if (template.cost > this.game!.money && !this.game?.sandbox) {
                button.setAttribute('disabled', 'disabled');
            }
            else {
                button.removeAttribute('disabled');
            }
        }
    }

    private constructTemplates = {
        'doctor': {
            type: 'unit',
            cost: 5,
            creator: this.createDoctor,
        },
        'purger': {
            type: 'unit',
            cost: 6,
            creator: this.createPurger,
        },
        'mouse trap':
        {
            type: 'construction',
            cost: 12,
            creator: this.createMouseTrap,
        },
        'shock tower': {
            type: 'construction',
            cost: 40,
            creator: this.createShockTower,
        }
    };

    public async disconnectedCallback(): Promise<void> {
        this.game?.removeEventListener('created-entity', this.addEntity);
        this.game?.removeEventListener('deleted-entity', this.removeEntity);
        this.game?.removeEventListener('changed-state', this.stateChanged);
        this.game?.removeEventListener('event', this.eventListener);
        this.wrapper?.removeEventListener('pointerdown', this.pointerDown);
        this.wrapper?.removeEventListener('pointermove', this.pointerMove);
        this.wrapper?.removeEventListener('pointerout', this.pointerOut);
        this.visuals?.ticker.remove(this.tick);
        this.debugWaypoints?.destroy();

        document.removeEventListener('keydown', this.keydown);
    }

    public get layerIdx() { return this.activeLayer; }
    private activeLayer: number = 0;
    private hideLayersBefore(layerIdx: number) {
        this.activeLayer = layerIdx;

        const layerButtons = document.querySelectorAll('.widget.layer > li');
        for (let i = 0; i < layerButtons.length; ++i) {
            const layerButton = layerButtons[i];
            if (layerButton instanceof HTMLElement) {
                const active = i == layerIdx;
                const hasFlag = layerButtons[i].classList.contains('active');
                if (!hasFlag && active) {
                    layerButtons[i].classList.add('active');
                }
                else if (hasFlag && !active) {
                    layerButtons[i].classList.remove('active');
                }
            }
        }

        for (let i = 0; i < this.layers.length; ++i) {
            this._layers[i].visible = i >= layerIdx;
        }
        for (let i = layerIdx; i < this.layers.length; ++i) {
            let colorMatrix = new ColorMatrixFilter();
            colorMatrix.brightness(1 + (i - layerIdx) / 3, true);
            this.layers[i].filters = [colorMatrix];
        }
    }
}

let defined = false;
export function createPlay() {
    if (!defined) {
        customElements.define(playElementName, Play);
        defined = true;
    }
    const element = document.createElement(playElementName);
    element.classList.add("page-fragment");
    return element;
}
