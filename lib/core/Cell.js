/**
 * Cell (minimal node group or self)
 */
// memory leak 자체는 없고 랜더러 자체를 promise like 로 해야하는데

//
import {Effect} from './Effect.js';
import {_extractFragment, _propertySwap} from './Util.js';
import {__slotAttributeName} from './View.js'
import {error} from './Log.js';

const __findCellZone = (element, nth) => {
    if (!(element instanceof HTMLElement)) {
        throw error('slot error');
    }
    return (
        __slotAttributeName in element.attributes &&
        element.getAttribute(__slotAttributeName) === nth.toString()
    ) ?
        element :
        element.querySelector(`[${__slotAttributeName}="${nth}"]`);
};
const attributeEffect = (attribute) => (
    (value, oldValue, effect) => {
        oldValue = oldValue ? oldValue : Effect.mark(effect.uid);
        attribute.value = attribute.value.replace(oldValue, value);
    }
);
const unsafeTextFragmentEffect = ($ref) => (value, oldValue, effect) => {
    if (Array.isArray(oldValue)) {
        for (const node of oldValue) {
            node.remove();
        }
    }
    value = Array.isArray(value) ? value : [value];
    if (value.every((v)=> v instanceof Node)) {
        // fragmentMode
        const fragment = document.createDocumentFragment();
        for (const slot of value) {
            fragment.appendChild(slot);
        }
        value = fragment;
    } else {
        value = _extractFragment(value.join(''));
    }
    effect._forceSet(Array.from(value.childNodes));
    $ref.appendChild(value);
};
const _invokeAttach = (uid, findEffect) => {
    if (!isNaN(uid)) {
        const effect = Effect.get(uid);
        const attachFunctor = findEffect(effect);
        attachFunctor(effect.value, undefined, effect);
        effect.attach(attachFunctor);
    }
};
const bindWalker = (_walker, element, boundFunctor) => {
    let _nextNode = null;
    while (_nextNode = _walker.nextNode()) {
        boundFunctor(_walker, _nextNode, element);
    }
};
const attributeBound = (_walker, _nextNode, element) => {
    const {attributes} = _nextNode;
    const attributeSize = attributes.length;
    for (let index = 0; index < attributeSize; index++) {
        const current = attributes[index];
        const name = current.name;
        const value = current.value;
        const group = (
            name === 'class' ?
                value.split(' ').map((value) => Effect.unMark(value)) :
                [Effect.unMark(value)]
        );
        for (const uid of group) {
            _invokeAttach(
                uid,
                () => {
                    return attributeEffect(attributes[name]);
                }
            );
        }
    }
};
const textBound = (_walker, _nextNode, element) => {
    let expr = _nextNode.nodeValue.replace(/[\r\n\s]+/g, '');
    const group = Effect.unMarkGroup(expr);
    for (const uid of group) {
        expr = expr.replace(Effect.mark(uid), '');
        _nextNode.nodeValue = expr;
        _invokeAttach(
            uid,
            () => {
                return unsafeTextFragmentEffect(_nextNode.parentNode);
            }
        );
    }
};
const bind = (element) => {
    const wrappedFragment = document.createDocumentFragment();
    wrappedFragment.appendChild(element);
    const attributeWalker = document.createTreeWalker(
        wrappedFragment,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
    );
    const textWalker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    bindWalker(textWalker, element, textBound);
    bindWalker(attributeWalker, element, attributeBound);
    // element.group.push(...mutationGroup);
    // element.fragment.push(...element.childNodes);
    return element;
};

/**
 * cell util
 */
export class Cell {
    static _maxUid = -1;
    /**
     * @property {String} template
     * @property {Array<Effect>} effects
     * @property {Array<Cell>} slots
     */
    constructor() {
        this.templateProps = [];
        this.events = {};
        this.ref = null;
        this.effects = [];
        this.slots = {};
        this.uid = (this.constructor._maxUid++);
    }
    /**
     * @param {Cell} cell
     * @return {Boolean}
     */
    equalCell(cell) {
        // TODO :check effect
        return (
            this === cell ||
            (
                cell instanceof Cell &&
                this.templateProps[0].join('') === cell.templateProps[0].join('')
            )
        );
    }
    /**
     * @param {String} name
     * @param {Function} on
     */
    addEventListener(name, on) {
        if (!(name in this.events)) {
            this.events[name] = {handlers: [], listener: null};
        }
        if (typeof on !== 'function') {
            throw error('addEventListener is must function');
        }
        this.events[name].handlers.push(on);
    }
    /**
     * @getter
     * @description computed getter for HTMLElement ref
     */
    get $ref() {
        if (this.ref !== null) {
            return this.ref;
        }
        const el = this.compile();
        return this.ref = bind(el);
    }
    /**
     * todo: remove event listeners
     */
    _attachEvent() {
        for (const name of Object.keys(this.events)) {
            const item = this.events[name];
            item.listener = (e)=> {
                for (const event of item.handlers) {
                    event(e);
                }
            };
            this.ref.addEventListener(name, item.listener);
        }
    }
    /**
     *
     */
    _removeEvent() {
        for (const [name, {listener}] of Object.entries(this.events)) {
            if (listener) {
                this.ref.removeEventListener(name, listener);
            }
        }
    }
    /**
     * generate self $ref
     * and generate slot $ref;
     * and binding lots of event
     * @return {HTMLElement}
     * slot effect is gone $ref is not bounded
     */
    compile() {
        // concat generatedTemplates and mix effect and slots
        // 순서는 template -> slot -> effect -> {recursive} 순으로 반영시킴
        const {templateProps, slots} = this;
        const template = String.raw(templateProps[0], ...templateProps[1]);
        const element = _extractFragment(template).firstChild;
        for (const [nth, slotGroup] of Object.entries(slots)) {
            if (Array.isArray(slotGroup)) {
                const $zone = __findCellZone(element, nth);
                const fragment = document.createDocumentFragment();
                for (const slot of slotGroup) {
                    const slotted = slot.compile();
                    fragment.appendChild(slotted);
                }
                $zone.appendChild(fragment);
            }
        }
        this.ref = element;
        this._attachEvent();
        return element;
    }
    /**
     * mutate other cells
     * @param {Cell} cell
     */
    mutation(cell) {
        // todo : keyed optimize
        const {slots, effects} = cell;
        if (this.equalCell(cell)) {
            for (let index = 0; index < effects.length; index++) {
                this.effects[index].notify(effects[index].value);
            }
            for (const [nth, becomeSlotGroup] of Object.entries(slots)) {
                const nowSlotGroup = this.slots[nth];
                const becomeSlotSize = becomeSlotGroup.length;
                const cellZone = __findCellZone(this.$ref, nth);
                for (let index = 0; index < becomeSlotSize; index++) {
                    const current = nowSlotGroup[index];
                    const next = becomeSlotGroup[index];
                    // TODO : not check index base
                    if (!next.equalCell(current)) {
                        const _ref = next.$ref;
                        cellZone.appendChild(_ref);
                        nowSlotGroup.splice(index, 0, next);
                        delete becomeSlotGroup[index];
                        // becomeSlotGroup.splice(index,1);
                    } else {
                        if (current.ref === null) {
                            cellZone.appendChild(current.ref = next.compile());
                        } else {
                            current.mutation(next);
                            //debugger;
                        }
                    }
                }
                becomeSlotGroup.length = 0;
            }
        } else {
            this.swap(cell);
            cell.$ref.parentElement.replaceChild(this.$ref, cell.$ref);
        }
        cell.remove();
    }
    /**
     * remove ref and slots
     */
    remove() {
        if (this.ref instanceof HTMLElement) {
            this._removeEvent();
            this.ref.remove();
            this.ref = null;
        }
        for (const slots of Object.values(this.slots)) {
            for (const slot of slots) {
                slot.remove();
            }
        }
        // TODO : gc된 노드삭제
        // this.purge();
    }
    /**
     * remove only effect
     */
    purge() {
        for (const effect of this.effects) {
            effect.remove();
        }
    }
    /**
     * mutateCell
     * generic swap object's property
     */
    swap(cell) {
        _propertySwap(this, cell);
    }
    /**
     * @return {String}
     */
    toString() {
        return '';
    }
}
