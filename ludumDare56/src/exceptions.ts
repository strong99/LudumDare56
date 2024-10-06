export function assertHTMLElement<Type>(element: Node | null, type: new () => Type, message: string): Type {
    if (element && element instanceof type) {
        return element as Type;
    }
    throw new ElementNotFoundException(element, message);
}

export class ElementNotFoundException extends Error {
    public readonly element: Node | null;

    public constructor(element: Node | null, message?: string) {
        super(message);

        this.element = element;
    }
}