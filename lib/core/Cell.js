/**
 * Cell (minimal node group or self)
 */
// remove memory-leak for use 
// 'https://engineering.huiseoul.com/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EB%8A%94-%EC%96%B4%EB%96%BB%EA%B2%8C-%EC%9E%91%EB%8F%99%ED%95%98%EB%8A%94%EA%B0%80-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-4%EA%B0%80%EC%A7%80-%ED%9D%94%ED%95%9C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%88%84%EC%88%98-%EB%8C%80%EC%B2%98%EB%B2%95-5b0d217d788d';
// 1. closure things like (high-order-function)
// https://blog.meteor.com/an-interesting-kind-of-javascript-memory-leak-8b47d2e7f156

//
import {_extractFragment, _propertySwap} from './Util.js';
import {__slotAttributeName, bind} from './View.js';
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
        element.querySelector(`[${__slotAttributeName}="${nth}"]`)
};
/**
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
                            cellZone.appendChild(next.$ref);
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
