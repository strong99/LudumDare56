import { SettingsManager } from '../services/settingsManager';
import { FragmentHTMLElement } from './fragment';
import { createMenu } from './menu';
import menuTemplate from './menuLayout.html?raw';

const menuLayoutElementName = "ld56-menu-layout";
class MenuLayout extends FragmentHTMLElement {
    public connectedCallback() {
        this.innerHTML = menuTemplate;
        this.appendChild(createMenu());

        const audios = this.querySelectorAll('audio');
        const settingsManager = new SettingsManager();
        for (const audio of audios) {
            audio.volume = (audio.classList.contains('music') ? settingsManager.musicVolume : settingsManager.effectVolume) * settingsManager.allVolume;
        }
    }
}

let defined = false;
export function createMenuLayout() {
    if (!defined) {
        customElements.define(menuLayoutElementName, MenuLayout);
        defined = true;
    }
    const element = document.createElement(menuLayoutElementName);
    element.classList.add("page-fragment");
    return element;
}
