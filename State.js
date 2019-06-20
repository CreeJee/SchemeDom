import {FixedType} from './FixedType.js';
const reflectState = new Map();
const _eventHandlersSymbol = Symbol('$$attachHandlers');
const _baseStateSymbol = Symbol('$$baseState');

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
     * @param {Function} observer
     * @param {...Any} keys
     * @static
     */
    static observe(observer, ...keys) {
        const base = this[_eventHandlersSymbol];
        keys.forEach((key)=>{
            let eventList$ = base.get(key);
            if (!Array.isArray(eventList$)) {
                eventList$ = [];
                base.set(key, eventList$);
            }
            eventList$.push(observer);
        });
    }
    /**
     * @decorator
     * @static
     * @param {String} action
     * @param {Object} target
     * @param {Any} name
     * @param {Object} descriptor
     * @return {Any} invoked Action
     */
    static decorator(action, target, name, descriptor) {
        return this[action].bind(target[name]);
    }
    /**
     * @memberof State
     * @param {FixedTypeArray<FixedTypeArray<Any,Any>>} initState
     * @param {Any} key
     */
    constructor(initState, key = this) {
        Object.defineProperty(this, _baseStateSymbol, {
            value: new Map(Object.entries(initState)),
            writable: false,
            enumerable: false,
            configurable: false,
        });
        // method binder
        this.boundState = FixedType.expect(
            this.boundState,
            Function,
            FixedType.array(FixedType.any)
        );
        this.setState = FixedType.expect(
            this.setState,
            FixedType.any,
            FixedType.any
        );
        this.merge = FixedType.expect(
            this.merge,
            FixedType.spread(State)
        );
        this[_baseStateSymbol].init();
        this[_eventHandlersSymbol] = new Map();
        reflectState.set(key, this);
    }
    /**
     * @memberof State
     * @description state clearedValue
     * @param {Any} key
     * @param {Any} value
     * @memberof State
     * @return {Any} value
     */
    init(key, value = new State()) {
        const hasValue = this[_baseStateSymbol].has(key);
        if (!hasValue) {
            this.set(key, value);
        }
        return (hasValue ? this.get(key) : value);
    }
    /**
     * @memberof State
     * @param {Any} key
     * @param {Any} value
     * @return {Any} returns value`
     */
    setState(key, value) {
        this.__state.set(key, value);
        return value;
    }
    /**
     * @memberof State
     * @description rollback State
     * @return {Promise<State>};
     */
    async rollback() {
        return this;
    }
}
const ProxyConstructor = FixedType.expect(
    State,
    FixedType.Array(FixedType.Array(FixedType.Any)),
    FixedType.Any
);
const useState = State.decorator('useState');
export default ProxyConstructor;
export {
    State as ProxyConstructor,
    useState
};
