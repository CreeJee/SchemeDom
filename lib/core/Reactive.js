const OBSERVE_KEY = Symbol('__value__');
const isReactive = (obj) => {
    return OBSERVE_KEY in obj && typeof obj[OBSERVE_KEY] === 'object';
};
export const defineReactive = (obj, ...caller) => {
    Object.defineProperty(
        obj, OBSERVE_KEY, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {
                listener: [],
            },
        }
    );
};
export const addListener = (obj, ...handlers) => {
    obj[OBSERVE_KEY].listener.push(...handlers);
};
const notify = (obj) => {
    for (const listener of obj[OBSERVE_KEY].listener) {
        listener();
    }
};
export const get = (obj, k) => obj[OBSERVE_KEY][k];
export const set = (obj, k, v) => {
    obj[OBSERVE_KEY][k] = v;
    notify(obj);
};
export const toReactive = (obj, ...caller) => {
    if (!isReactive(obj)) {
        defineReactive(obj);
    }
    addListener(obj, ...caller);
    const keys = Object.keys(obj);
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        if (!Object.getOwnPropertyDescriptor(obj, key).configurable) {
            continue;
        }
        Object.defineProperty(
            obj,
            key,
            {
                enumerable: true,
                configurable: true,
                get: () => get(obj, key),
                set: (v) => set(obj, key, v),
            }
        );
    }
    return obj;
};
