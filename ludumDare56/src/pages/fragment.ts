export abstract class FragmentHTMLElement extends HTMLElement {
    protected activeEvents: {
        element: Element;
        event: string;
        callback: any;
    }[] = [];

    protected listen(query: string, event: string, callback: any) {
        const elements = this.querySelectorAll(query)
        for (const element of elements) {
            element.addEventListener(event, callback);

            const eventCallback = { element: element, event: event, callback: callback };
            this.activeEvents.push(eventCallback);
        }
    }

    protected listenOnce(query: string, event: string, callback: any) {
        const elements = this.querySelectorAll(query);
        for (const element of elements) {
            const overrideCallback = (args: any) => {
                const element = this.querySelector(query)
                element!.removeEventListener(event, overrideCallback);

                const idx = this.activeEvents.indexOf(eventCallback);
                if (idx >= 0) {
                    this.activeEvents.splice(idx, 1);
                }

                callback(args);
            };

            const eventCallback = { element: element, event: event, callback: overrideCallback };

            element.addEventListener(event, overrideCallback);
            this.activeEvents.push(eventCallback);
        }
    }

    public disconnectedCallback(): void {
        for (const activeEvent of this.activeEvents) {
            activeEvent.element.removeEventListener(activeEvent.event, activeEvent.callback);
        }
        this.activeEvents.length = 0;
    }

    public get parentFragment(): FragmentHTMLElement | null {
        let parent = this.parentElement;
        while (parent) {
            if (parent instanceof FragmentHTMLElement) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }
}
