import {FixedType} from './core/FixedType.js';
const reflectState = new Map();
const _eventHandlersSymbol = Symbol('$$attachHandlers');
const _baseStateSymbol = Symbol('$$baseState');
const __StoreType = Map;
const generateInnerStore = (entry) => new __StoreType(entry);
const rewriteStore = (o, action, args = []) =>{
    const store = generateInnerStore(o[_baseStateSymbol]);
    store[action].apply(store,args);
    o.set(store);
    return o;
};
// remove proxy memory leak
const stateProxyHandler = {
    get: (o, prop, receiver) => {
        return Reflect.has(o, prop) ?
            Reflect.get(o, prop, receiver) :
            o[_baseStateSymbol].get(prop);
    },
    set: (o, prop, value, receiver) => {
        if (Reflect.has(o, prop)) {
            return Reflect.set(o, prop, value, receiver);
        } else {
            rewriteStore(o, 'set', [prop, value]);
            return o;
        }
    },
    deleteProperty: (o, prop, receiver)=> {
        if (Reflect.has(o, prop, receiver)) {
            return Reflect.set(o, prop, receiver);
        } else {
            rewriteStore(o, 'delete', [prop]);
        }
    },
    // proxy hook
    apply: Reflect.apply,
    has: (o, prop) => o[_baseStateSymbol].has(prop),
};

/**
 * State
 */
class State {
    /**
     * @static
     * @param {Any} key
     * @return {Any}
     */
    static reflect(key) {
        if (!reflectState.has(key)) {
            throw new Error('[SchemeDom.Reflect] matched store not available');
        }
        return reflectState.get(key);
    }
    /**
     * @memberof State
     * @param {FixedTypeArray<FixedTypeArray<Any,Any>>} initState
     * @param {Any} key
     */
    constructor(initState = {}, key = this) {
        this[_baseStateSymbol] = generateInnerStore(Object.entries(initState));
        this[_eventHandlersSymbol] = [];
        reflectState.set(key, this);
        return new Proxy(this, stateProxyHandler);
    }
    /**
     * @memberof State
     * @param {Any} value
     * @return {Any} returns value
     */
    set(value) { 
        this.forceSet(value);
        for (const observer of this[_eventHandlersSymbol]) {
            observer(value);
        }
        return value;
    }
    /**
     * force set value for state
     * @param {State} value
     * @memberof State
     */
    forceSet(value) {
        this[_baseStateSymbol] = value instanceof __StoreType ? value : generateInnerStore(Object.entries(value));
    }
    /**
     * add event
     * @param {Function} observer
     * @return {State}
     */
    addEvent(observer) {
        const events = this[_eventHandlersSymbol];
        if (!events.includes(observer)) {
            this[_eventHandlersSymbol].push(observer);
        }
        return this;
    }
    /**
     * remove event
     * @param {Function} observer
     * @memberof State
     */
    removeEvent(observer) {
        const events = this[_eventHandlersSymbol];
        events.splice(events.indexOf(observer), 1);
    }
}
const ProxyConstructor = FixedType.expect(
    State,
    FixedType.array(FixedType.array(FixedType.any)),
    FixedType.any
);
export default ProxyConstructor;
export {
    ProxyConstructor as State,
};
