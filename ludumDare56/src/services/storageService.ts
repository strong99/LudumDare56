type JSONValue = string | number | boolean | JSONValue[] | { [key: string]: JSONValue };

export function store(key: string, value: JSONValue) {
    localStorage[key] = JSON.stringify(value);
}

export function has(key: string) {
    return key in localStorage;
}

export function retrieve<T>(key: string, defaultValue?: T): T {
    if (key in localStorage === false) {
        if (defaultValue) {
            return defaultValue;
        }
        throw new Error("Unable to locate the given key");
    }

    const output = JSON.parse(localStorage[key]) as T ?? defaultValue;
    if (typeof output === 'undefined') {
        throw new Error("Unable to locate or use default value for retrieve");
    }
    return output;
}
