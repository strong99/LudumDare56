import { clamp } from "../math/utils";
import { retrieve, store } from "./storageService";

const allVolumeKey: string = "settings:volume-all";
const musicVolumeKey: string = "settings:volume-music";
const effectVolumeKey: string = "settings:volume-effect";
const storyKey: string = "settings:story";
const playerNameKey: string = "settings:player-name";

export class SettingsManager {
    public get allVolume(): number { return retrieve(allVolumeKey, 0.5); }
    public set allVolume(value: number) { store(allVolumeKey, clamp(0, value, 1)); }

    public get musicVolume(): number { return retrieve(musicVolumeKey, 0.5); }
    public set musicVolume(value: number) { store(musicVolumeKey, clamp(0, value, 1)); }

    public get effectVolume(): number { return retrieve(effectVolumeKey, 0.5); }
    public set effectVolume(value: number) { store(effectVolumeKey, clamp(0, value, 1)); }

    public get story(): boolean { return retrieve(storyKey, true); }
    public set story(value: boolean) { store(storyKey, value); }

    public get playerName(): string { return retrieve(playerNameKey, 'Arez'); }
    public set playerName(value: string) { store(playerNameKey, value); }
}
