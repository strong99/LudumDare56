import { assertHTMLElement } from "../exceptions";
import * as game from '../services/gameManager';
import { SettingsManager } from '../services/settingsManager';
import { FragmentHTMLElement } from './fragment';
import lobbyTemplate from './lobby.html?raw';
import { createMenu } from './menu';
import { createPlay } from './play';

const lobbyElementName = "ld56-lobby";
class Lobby extends FragmentHTMLElement {
    private readonly settingsManager = new SettingsManager();

    public connectedCallback(): void {

        this.innerHTML = lobbyTemplate;

        const inputStory = assertHTMLElement(this.querySelector('[name="input-story"]'), HTMLInputElement, 'unable to find the story input');
        inputStory.checked = this.settingsManager.story;

        const inputPlayerName = assertHTMLElement(this.querySelector('[name="player-name"]'), HTMLInputElement, 'unable to find the player name input');
        inputPlayerName.value = this.settingsManager.playerName ?? "Arez";

        this.listenOnce('[name="btn-menu"]', 'click', () => this.replaceWith(createMenu()));
        this.listenOnce('[name="btn-start"]', 'click', () => {
            const sandbox = (this.querySelector('[name="input-sandbox"]') as HTMLInputElement).checked;
            const editor = (this.querySelector('[name="input-editor"]') as HTMLInputElement).checked;
            const story = inputStory.checked;
            const playerName = this.settingsManager.playerName = inputPlayerName.value;

            this.settingsManager.story = story;

            game.create({
                playerName,
                sandbox,
                editor,
                story
            });
            this.parentFragment?.replaceWith(createPlay());
        });
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
