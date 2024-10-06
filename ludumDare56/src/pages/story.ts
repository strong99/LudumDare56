import { StoryState } from '../models/game';
import * as game from '../services/gameManager';
import { SettingsManager } from "../services/settingsManager";
import { FragmentHTMLElement } from './fragment';
import { createMenuLayout } from './menuLayout';
import { createPlay } from './play';
import stories from './stories.json';
import storyTemplate from './story.html?raw';

const storyElementName = "ld56-story";
export class Story extends FragmentHTMLElement {
    public get name(): string { return "story"; }

    public connectedCallback(): void {
        this.innerHTML = storyTemplate;

        const audios = this.querySelectorAll('audio');
        const settingsManager = new SettingsManager();
        for (const audio of audios) {
            audio.volume = (audio.classList.contains('music') ? settingsManager.musicVolume : settingsManager.effectVolume) * settingsManager.allVolume;
        }

        const _game = game.get();
        if (!_game) {
            setTimeout(() => createMenuLayout(), 0);
            return;
        }
        if (_game.state.type !== 'story') {
            setTimeout(() => createPlay(), 0);
            return;
        }

        const state = _game.state as StoryState;
        const activeStory = (stories as { [key: string]: StoryEntry[] })[state.story];
        let currentEntry = 0;

        this.listenOnce('[name="btn-menu"]', 'click', () => {
            this.replaceWith(createMenuLayout());
        });

        this.listen('[name="btn-next"]', 'click', () => {
            ++currentEntry;
            if (currentEntry >= activeStory.length) {
                const s = _game.state as StoryState;
                _game.state = s && s.followUp ? { ...s.followUp } : {
                    type: 'run'
                };
                setTimeout(() => this.replaceWith(createPlay()), 0);
                return;
            }
            this.progress(activeStory, currentEntry);
        });
        this.progress(activeStory, currentEntry);
    }

    private progress(activeStory: StoryEntry[], currentEntry: number) {
        const entry = activeStory[currentEntry];

        const textElement = this.querySelector('.text');
        const htmlElement = this.querySelector('.html');
        const narratorElement = this.querySelector('.narrator');

        textElement!.innerHTML = "";
        htmlElement!.innerHTML = "";
        narratorElement!.innerHTML = "";

        if (entry.scene) {
            this.setAttribute('data-scene', entry.scene);
        }

        if (entry.html) {
            htmlElement!.innerHTML = entry.html;
        }
        if (entry.text) {
            textElement!.textContent = entry.text;
        }
        if (entry.narrator) {
            narratorElement!.textContent = entry.narrator;
        }
    }
}

interface StoryEntry {
    narrator?: string;
    html?: string;
    text?: string;
    scene?: string;
}

let defined = false;
export function createStory() {
    if (!defined) {
        customElements.define(storyElementName, Story);
        defined = true;
    }
    const element = document.createElement(storyElementName);
    element.classList.add("page-fragment");
    return element;
}
