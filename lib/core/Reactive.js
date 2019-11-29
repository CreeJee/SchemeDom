
import {error} from './Log.js';

const OBSERVE_KEY = Symbol('__value__');
const isReactive = (obj) => {
    return OBSERVE_KEY in obj && typeof obj[OBSERVE_KEY] === 'object';
};
export const defineReactive = (obj) => {
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
export const addListener = (obj, handler) => {
    obj[OBSERVE_KEY].listener.push(handler);
};
export const notify = (obj) => {
    if (!isReactive(obj)) {
        throw error('first argument is must Reactived Object');
    }
    for (const listener of obj[OBSERVE_KEY].listener) {
        listener(obj[OBSERVE_KEY]);
    }
};
export const get = (obj, k) => obj[OBSERVE_KEY][k];
export const set = (obj, k, v) => {
    const prev = obj[OBSERVE_KEY][k];
    if (prev !== v) {
        obj[OBSERVE_KEY][k] = v;
        // notify(obj);
    }
};
export const toReactive = (obj) => {
    if (!isReactive(obj)) {
        defineReactive(obj);
        const keys = Object.keys(obj);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            if (!Object.getOwnPropertyDescriptor(obj, key).configurable) {
                continue;
            }
            set(obj, key, obj[key]);
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
    }
    return obj;
};
