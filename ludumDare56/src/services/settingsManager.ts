import { clamp } from "../math/utils";
import { retrieve, store } from "./storageService";

export class SettingsManager {
    private allVolumeKey: string = "settings:volume-all";
    private musicVolumeKey: string = "settings:volume-music";
    private effectVolumeKey: string = "settings:volume-effect";
    private storyKey: string = "settings:story";

    public get allVolume(): number { return retrieve(this.allVolumeKey, 0.5); }
    public set allVolume(value: number) { store(this.allVolumeKey, clamp(0, value, 1)); }

    public get musicVolume(): number { return retrieve(this.musicVolumeKey, 0.5); }
    public set musicVolume(value: number) { store(this.musicVolumeKey, clamp(0, value, 1)); }

    public get effectVolume(): number { return retrieve(this.effectVolumeKey, 0.5); }
    public set effectVolume(value: number) { store(this.effectVolumeKey, clamp(0, value, 1)); }

    public get story(): boolean { return retrieve(this.storyKey, true); }
    public set story(value: boolean) { store(this.storyKey, value); }
}
