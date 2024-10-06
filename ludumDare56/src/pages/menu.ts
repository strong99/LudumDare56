import menuTemplate from './menu.html?raw'
import { createPlay } from './play';
import { createSettings } from './settings';
import { createLobby } from './lobby';
import * as game from '../services/gameManager';
import { FragmentHTMLElement } from './fragment';
import { createAbout } from './about';

const menuElementName = "ld56-menu";
export class Menu extends FragmentHTMLElement {
    public get name(): string { return "menu"; }

    public connectedCallback(): void {
        this.innerHTML = menuTemplate;
        if (!this.classList.contains("page-fragment")) {
            this.classList.add("page-fragment");
        }

        const btnContinue = this.querySelector('[name="btn-continue"]');
        if (btnContinue && !game.canContinue()) {
            btnContinue?.setAttribute('disabled', 'disabled');
        }
        
        this.listenOnce('[name="btn-continue"]', 'click', () => this.parentFragment?.replaceWith(createPlay()));
        this.listenOnce('[name="btn-new"]', 'click', () => this.replaceWith(createLobby()));
        this.listenOnce('[name="btn-settings"]', 'click', () => this.replaceWith(createSettings()));
        this.listenOnce('[name="btn-about"]', 'click', () => this.replaceWith(createAbout()));
    }
}


let defined = false;
export function createMenu() {
    if (!defined) {
        customElements.define(menuElementName, Menu);
        defined = true;
    }
    const element = document.createElement(menuElementName);
    element.classList.add("page-fragment");
    return element;
}