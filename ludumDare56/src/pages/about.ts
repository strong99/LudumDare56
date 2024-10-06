import aboutTemplate from './about.html?raw';
import { FragmentHTMLElement } from './fragment';
import { createMenu } from './menu';

const aboutElementName = "ld56-about";
class About extends FragmentHTMLElement {
    public get name(): string { return "about"; }

    public connectedCallback(): void {
        this.innerHTML = aboutTemplate;

        this.listenOnce('[name="btn-menu"]', 'click', () => {
            this.replaceWith(createMenu());
        });
    }
}

let defined = false;
export function createAbout() {
    if (!defined) {
        customElements.define(aboutElementName, About);
        defined = true;
    }
    const element = document.createElement(aboutElementName);
    element.classList.add("page-fragment");
    return element;
}
