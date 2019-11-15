// import * as ENV from './Env.js';
import {error} from './Log.js';
import {toReactive, addListener} from './Reactive.js';
// utils

/* 
TODO : appendChild 횟수를 줄이며 가능할경우 create를 우선으로 하고 node부분을 다른객체로 우선확장한뒤에
update를 붙임으로서 append횟수절약 및 gc처리
그럴경우 create에만 경우가 생기고
effect에서만 append처리가능
*/
const _extractFragment = (content) => {
    // debugger;
    // return document.createRange().createContextualFragment(content);

    // const fragment = document.createDocumentFragment();
    // fragment.appendChild(_domParser.parseFromString(content, 'text/xml').firstChild);
    // return fragment;
    
    const o = document.createElement('template');
    let result = null;
    o.innerHTML = content;
    result = o.content;
    o.remove();
    return result;
};
const _clearDom = (mountDom) => {
    const range = document.createRange();
    range.selectNodeContents(mountDom);
    range.deleteContents();
};
const attributeEffect = ($ref, attributeName) => (value, oldValue, effect) => {
    oldValue = oldValue ? oldValue : Effect.mark(effect.uid);
    const attribute = $ref.attributes[attributeName];
    attribute.value = attribute.value.replace(oldValue, value);
};
const slotEffect = ($ref, $self) => (value, oldValue = []) => {
    const fragment = document.createDocumentFragment();
    const effector = fragmentEffect(fragment, $self);
    const removerRange = document.createRange();
    if ($self.nodeValue !== '') {
        // when create mode
        _clearDom($ref);
    }
    for (const oldSlot of oldValue) {
        for (const node of oldSlot.fragment) {
            removerRange.insertNode(node);
        }
    }
    removerRange.deleteContents();
    for (const slot of value) {
        effector(slot);
    }
    $ref.appendChild(fragment);
};
const fragmentEffect = ($ref, $self) => (fragment, old, effect) => {
    $ref.appendChild(fragment);
};
const textEffect = ($ref) => (value) => {
    $ref.nodeValue = value;
};
const _invokeAttach = (groupRef, uid, findEffect) => {
    if (!isNaN(uid)) {
        const effect = Effect.get(uid);
        const attachFunctor = findEffect(effect);
        attachFunctor(effect.value, undefined, effect);
        effect.attach(attachFunctor);
        groupRef.push(uid);
    }
};

export const Effect = class Effect {
    static watch = [];
    static KEYED_SYMBOL = '$';
    // vaild,mark가 쌍으로 매칭되야하는데 이때 이걸 어캐 메칭해야 자알메칭했다고 할끄아
    /**
     * @memberof Effect
     * @static
     * @param {String} expr
     * @return {Boolean}
     */
    static vaildExpr(expr) {
        const len = expr.length;
        return expr[0] === this.KEYED_SYMBOL && expr[1] === '[' && expr[len - 1] === ']';
    }
    /**
     * @memberof Effect
     * @static
     * @param {Number} uid
     * @return {Boolean}
     */
    static vaildUid(uid) {
        return this.watch.length > uid;
    }
    /**
     *
     * @memberof Effect
     * @static
     * @param {Number} uid
     * @return {String}
     */
    static mark(uid) {
        return `${this.KEYED_SYMBOL}[${uid}]`;
    }
    /**
     *
     * @memberof Effect
     * @static
     * @param {any} v
     * @return {Effect}
     */
    static generate(v) {
        return new this(v);
    }
    /**
     * @memberof Effect
     * @static
     * @param {String} expr
     * @return {Number}
     */
    static unMark(expr) {
        return this.vaildExpr(expr) ? parseFloat(expr.slice(2, -1)) : NaN;
    }
    /**
     *
     * @memberof Effect
     * @static
     * @param {String} expr
     * @return {any}
     */
    static unMarkExpression(expr) {
        let uid = -1;
        if (uid = this.unMark(expr)) {
            return this.watch[uid].value;
        } else {
            throw new Error('error unwrapping');
        }
    }
    /**
     * @param {String} expr
     * @return {Array<Effect>}
     */
    static unMarkGroup(expr) {
        const exprGroup = expr.split(this.KEYED_SYMBOL).slice(1);
        return exprGroup.map((uid)=>this.unMark(`${this.KEYED_SYMBOL}${uid}`));
    }
    /**
     * attach handler
     * @static
     * @param {Number} uid
     * @param {Function} on
     */
    static attach(uid, on) {
        if (this.vaildUid(uid)) {
            this.watch[uid].attach(on);
        }
    }
    /**
     * @static
     * @param {Number} uid
     * @return {Effect}
     */
    static get(uid) {
        return this.vaildUid(uid) ? this.watch[uid] : null;
    }
    /**
     * Creates an Effect.
     * @param {any} v
     */
    constructor(v) {
        this.uid = this.constructor.watch.push(this) - 1;
        this._value = v;
        this.handlers = [];
    }
    /**
     * attach handler
     * @param {Function} on
     */
    attach(on) {
        this.handlers.push(on);
    }
    /**
     * @param {any} v
     */
    notify(v) {
        const old = this.value;
        this._value = v;
        this.effect(v, old);
    }
    /**
     * force set value on effect
     * @param {any} v 
     */
    _forceSet(v) {
        this._value = v;
    }
    /**
     * gain value
     * @return {any} v
     */
    get value() {
        return this._value;
    }
    /**
     * side effect exec
     * @param {any} value
     * @param {any} oldValue
     */
    effect(value = this.value, oldValue = undefined) {
        for (const handler of this.handlers) {
            // do not context things
            handler(this.value, oldValue, this);
        }
    }
    /**
     * auto mark html variable
     * @return {String}
     */
    toString() {
        return this.constructor.mark(this.uid);
    }
    /**
     * Observe handler remove
     */
    remove() {
        const watch = this.constructor.watch;
        watch.splice(watch.indexOf(this), 1);
        this.handlers.splice(0);
        this._value = undefined;
        this.uid = -1;
    }
};

export const create = (templateGroup, ...mutationVariable) => {
    const [startAt, ...others] = templateGroup;
    const mutationSize = mutationVariable.length;
    let content = startAt;
    for (let nth = 0; nth < mutationSize; nth++) {
        const currentString = others[nth];
        const currentVariable = mutationVariable[nth];
        content += Effect.generate(currentVariable) + currentString;
    }
    return _extractFragment(content);
};
export const bind = (element) => {
    const mutationGroup = [];
    const _walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_ALL,
        null,
        false
    );
    let _nextNode = null;
    while (_nextNode = _walker.nextNode()) {
        let attributes = null;
        let attributeSize = -1;

        switch (_nextNode.nodeType) {
        case Node.ELEMENT_NODE:
            attributes = _nextNode.attributes;
            attributeSize = attributes.length;
            for (let index = 0; index < attributeSize; index++) {
                const {name, value} = attributes[index];
                const group = (name === 'class' ? value.split(' ').map((value) => Effect.unMark(value)) : [Effect.unMark(value)]);
                for (const uid of group) {
                    _invokeAttach(
                        mutationGroup,
                        uid,
                        () => attributeEffect(_nextNode, name)
                    );
                }
            }
            break;
        case Node.TEXT_NODE:
            // we will need multiple Effect
            {
                let expr = _nextNode.nodeValue.replace(/[\r\n\s]+/g, '');
                let parent = _nextNode.parentNode;
                const group = Effect.unMarkGroup(expr);
                for (const uid of group) {
                    expr = expr.replace(Effect.mark(uid), '');
                    _nextNode.nodeValue = expr;
                    _invokeAttach(
                        mutationGroup,
                        uid,
                        ({value}) => {
                            const isSlot = value instanceof Array;
                            const isFragment = value instanceof DocumentFragment;
                            const isText = !isSlot && !isFragment;
                            let result = null;
                            parent = parent instanceof DocumentFragment ? parent.firstElementChild : parent;
                            if (isSlot) {
                                result = slotEffect(parent, _nextNode);
                            }
                            if (isFragment) {
                                result = fragmentEffect(parent, _nextNode);
                            }
                            if (isText) {
                                result = textEffect(_nextNode);
                            } else {
                                _nextNode.remove();
                            }
                            return result;
                        }
                    );
                }
            }
            break;
        }
    }
    element.group = mutationGroup;
    element.fragment = Array.from(element.childNodes);
    return element;
};
// TODO : rename update to 'createUpdater'
export const update = (createdNode) => (unusedGroup, ...mutationGroup) => {
    const prevGroup = createdNode.group;
    const createdSize = prevGroup.length;
    if (createdSize !== mutationGroup.length) {
        throw error('Non accessable mutation dected');
    }
    for (let index = 0; index < createdSize; index++) {
        Effect.get(prevGroup[index]).notify(mutationGroup[index]);
    }
};
export const remove = (createdNode) => {
    const {group, fragment} = createdNode;
    let len = -1;
    if (!Array.isArray(group)) {
        throw error('first argument is not VNode');
    }
    len = group.length;
    for (let index = 0; index < len; index++) {
        Effect.get(group[index]).remove();
    }
    for (const node of fragment) {
        node.remove();
    }
};
export const bound = (templateGroup, ...mutationVariable) => {
    return bind(create(templateGroup, ...mutationVariable));
};
export const generate = (obj, renderCall) => {
    let $ref = null;
    // gc 에 대한 대책필요
    addListener(
        toReactive(obj),
        () => renderCall(update($ref))
    );
    return ($ref = renderCall(bound));
};
