import settingsTemplate from './settings.html?raw'
import { Menu } from './menu';
import { SettingsManager } from '../services/settingsManager';
import { FragmentHTMLElement } from './fragment';

const settingsElementName = "ld56-settings";
export class Settings extends FragmentHTMLElement {
    private settingsManager = new SettingsManager();

    public get name(): string { return "settings"; }

    private initInputPercentageGroup(query: string, source: any, key: string) {
        const elements = this.querySelectorAll(query);
        for (const element of elements) {
            if (element instanceof HTMLInputElement) {
                element.value = (source[key] * 100).toString();
            }
        }

        this.listen(query, 'change', (args: InputEvent) => {
            const target = args.target as HTMLInputElement;
            source[key] = Number(target.value) / 100;

            for (const element of elements) {
                if (element instanceof HTMLInputElement && args.target !== element) {
                    element.value = (source[key] * 100).toString();
                }
            }

            const audios = this.parentElement!.querySelectorAll('audio');
            for (const audio of audios) {
                audio.volume = (audio.classList.contains('music') ? this.settingsManager.musicVolume : this.settingsManager.effectVolume) * this.settingsManager.allVolume;
            }
        });
    }

    public connectedCallback(): void {
        this.innerHTML = settingsTemplate;

        this.listenOnce('[name="btn-menu"]', 'click', () => {
            this.replaceWith(new Menu());
        });

        this.initInputPercentageGroup('[name="all-volume-range"],[name="all-volume-box"]', this.settingsManager, 'allVolume');
        this.initInputPercentageGroup('[name="music-volume-range"],[name="music-volume-box"]', this.settingsManager, 'musicVolume');
        this.initInputPercentageGroup('[name="effect-volume-range"],[name="effect-volume-box"]', this.settingsManager, 'effectVolume');
    }
}

let defined = false;
export function createSettings() {
    if (!defined) {
        customElements.define(settingsElementName, Settings);
        defined = true;
    }
    const element = document.createElement(settingsElementName);
    element.classList.add("page-fragment");
    return element;
}
