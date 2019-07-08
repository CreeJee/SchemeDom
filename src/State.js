import {FixedType} from './FixedType.js';
const reflectState = new Map();
const _eventHandlersSymbol = Symbol('$$attachHandlers');
const _baseStateSymbol = Symbol('$$baseState');

const stateProxyHandler = {
    get: (o, prop, receiver)=>{
        return (
            Reflect.has(o, prop) ?
                Reflect.get(o, prop, receiver) :
                o[_baseStateSymbol].get(prop)
        );
    },
    apply: (target, thisArg, ...args)=>{
        return Reflect.apply(target, thisArg, ...args);
    }
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
        this[_baseStateSymbol] = new Map(Object.entries(initState));
        this[_eventHandlersSymbol] = [];
        this.history = [this[_baseStateSymbol]];
        reflectState.set(key, this);
        return new Proxy(this, stateProxyHandler);
    }
    /**
     * @memberof State
     * @param {Any} value
     * @return {Any} returns value`
     */
    set(value) {
        this[_baseStateSymbol] = new Map(Object.entries(value));
        this.history.push(this[_baseStateSymbol]);
        for (const observer of this[_eventHandlersSymbol]) {
            observer(value);
        }
        return value;
    }
    /**
     * @param {Function} observer
     * @return {State}
     */
    observe(observer) {
        this[_eventHandlersSymbol].push(observer);
        return this;
    }
    /**
     * @memberof State
     * @description rollback State
     * @return {Promise<State>};
     */
    async revert() {
        [this[_baseStateSymbol]] = this.history.splice(-1, 1);
        return this;
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
