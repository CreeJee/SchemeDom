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
     * @decorator
     * @static
     * @param {String} action
     * @param {Object} target
     * @param {Any} name
     * @param {Object} descriptor
     * @return {Any} invoked Action
     */
    static decorator(action, target, name, descriptor) {
        return this[action].bind(this, action);
    }
    /**
     * inject Reference
     * @param {State} ref
     */
    static inject(ref) {
    }
    /**
     * @memberof State
     * @param {FixedTypeArray<FixedTypeArray<Any,Any>>} initState
     * @param {Any} key
     */
    constructor(initState, key = this) {
        this[_baseStateSymbol] = new Map(Object.entries(initState));
        this[_eventHandlersSymbol] = [];
        this.history = [this[_baseStateSymbol]];
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
     * @param {Any} k
     * @param {Any} v
     * @return {Any}
     */
    get(k, v) {
        return this[_baseStateSymbol].get(k);
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
const bind = State.observe;
export default ProxyConstructor;
export {
    ProxyConstructor as State,
    bind,
};
