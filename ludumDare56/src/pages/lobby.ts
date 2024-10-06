import lobbyTemplate from './lobby.html?raw'
import { createPlay } from './play';
import { createMenu } from './menu';
import { FragmentHTMLElement } from './fragment';
import * as game from '../services/gameManager';
import { SettingsManager } from '../services/settingsManager';

const lobbyElementName = "ld56-lobby";
export class Lobby extends FragmentHTMLElement {
    private readonly settingsManager = new SettingsManager();

    private initInput(query: string, source: any, key: string) {
        const elements = this.querySelectorAll(query);
        for (const element of elements) {
            if (element instanceof HTMLInputElement) {
                element.value = source[key].toString();
            }
        }

        this.listen(query, 'change', (args: InputEvent) => {
            const target = args.target as HTMLInputElement;
            source[key] = target.value;

            for (const element of elements) {
                if (element instanceof HTMLInputElement && args.target !== element) {
                    element.value = source[key].toString();
                }
            }
        });
    }

    private playerName: string = "Arez";

    public connectedCallback(): void {

        this.innerHTML = lobbyTemplate;

        this.playerName = this.playerName;
        this.playerName = this.playerName;

        (this.querySelector('[name="input-story"]') as HTMLInputElement).checked = this.settingsManager.story;

        this.listenOnce('[name="btn-menu"]', 'click', () => this.replaceWith(createMenu()));
        this.listenOnce('[name="btn-start"]', 'click', () => {

            const sandbox = (this.querySelector('[name="input-sandbox"]') as HTMLInputElement).checked;
            const editor = (this.querySelector('[name="input-editor"]') as HTMLInputElement).checked;
            const story = (this.querySelector('[name="input-story"]') as HTMLInputElement).checked;

            this.settingsManager.story = story;

            game.create({
                sandbox,
                editor,
                story
            });
            this.parentFragment?.replaceWith(createPlay());
        });

        this.initInput('[name="player-name"]', this, 'playerName');
    }
}

let defined = false;
export function createLobby() {
    if (!defined) {
        customElements.define(lobbyElementName, Lobby);
        defined = true;
    }
    const element = document.createElement(lobbyElementName);
    element.classList.add("page-fragment");
    return element;
}
