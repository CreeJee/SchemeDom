// Add Lifecycle beforeCreate
import {FixedType} from './FixedType.js';
const elementOrDoc = (v)=>(
    v instanceof HTMLElement ||
    v instanceof DocumentFragment
);
const childCond = (v)=>(
    v instanceof BaseComponent || elementOrDoc(v)
);
export const componentToDom = (o, mountZone) => {
    const el = o.render(
        elementGenerator.bind(o),
        o.$props,
        ...o.$slots
    );
    if (elementOrDoc(mountZone)) {
        o.$zone = mountZone;
    }
    o.$ref = el instanceof BaseComponent ? componentToDom(el, mountZone) : el;
    return o.$ref;
};
export const clearDom = (mountDom)=>mountDom.innerHTML = '';
export const renderDom = (mountDom, el, index = 0)=>{
    const isComponent = el instanceof BaseComponent;
    const selectedChild = mountDom.children[index];
    const hasNthChild = selectedChild instanceof HTMLElement;

    let appendDom = null;
    let $prevRef = null;
    // TODO : Add documentFragment
    if (isComponent) {
        el.$zone = mountDom;
        $prevRef = el.$ref;
        el.$ref = componentToDom(el, mountDom);
        appendDom = el.$ref;
    } else {
        appendDom = el;
    }
    if (!hasNthChild || selectedChild !== appendDom) {
        if (elementOrDoc(selectedChild)) {
            if (
                isComponent &&
                $prevRef instanceof DocumentFragment &&
                appendDom instanceof DocumentFragment
            ) {
                const childCount = appendDom.childElementCount;
                let igonredTagCount = 0;
                for (let i = 0; i < childCount; i++) {
                    const newTag = appendDom.children[igonredTagCount];
                    const oldTag = mountDom.children[i];
                    if (newTag.innerHTML !== oldTag.innerHTML) {
                        mountDom.insertBefore(newTag, oldTag);
                        oldTag.remove();
                    } else {
                        igonredTagCount++;
                    }
                }
            } else {
                mountDom.insertBefore(appendDom, selectedChild);
                selectedChild.remove();
            }
        } else {
            mountDom.appendChild(appendDom);
        }
    }
};
export const fragment = (...child)=>{
    const o = document.createDocumentFragment();
    for (let index = 0; index < child.length; index++) {
        o.appendChild(child[index]);
    }
    return o;
};
export const elementGenerator = (tag, attributes, ...children) => {
    const isBaseCond = (
        tag !== null &&
        tag !== undefined &&
        attributes instanceof Object &&
        children.every(childCond)
    );
    const isTagName = typeof tag === 'string';
    let isDOM = tag instanceof HTMLElement;
    const isFragment = tag instanceof DocumentFragment;
    const isComponent = tag instanceof BaseComponent;
    if (isBaseCond) {
        if (isTagName) {
            tag = document.createElement(tag);
            isDOM = true;
        }
        if (isDOM) {
            const {text, ...attr} = attributes;
            const entryAttr = Object.entries(attr);
            if (text !== undefined) {
                tag.textContent = text;
            }
            for (let index = 0; index < entryAttr.length; index++) {
                const [k, v] = entryAttr[index];
                tag.setAttribute(k, v);
            }
        }
        if (isFragment || isDOM) {
            for (let index = 0; index < children.length; index++) {
                renderDom(tag, children[index], index);
            }
        }
        if (isComponent) {
            tag.$props = attributes;
            tag.$slots = children;
            tag = componentToDom(tag);
        }
        return tag;
    } else {
        throw new Error(
            `arguments must (
                [String|HTMLElement|BaseComponent],
                Object,
                ...[HTMLElement|BaseComponent]
            )`
        );
    }
};


const BaseComponent = class baseComponent {
    /**
     * Base Component
     */
    constructor({...props} = {}) {
        this.$ref = null;
        this.$zone = null;
        this.$props = props;
        this.$children = [];
        this.$slots = [];
    }
    /**
     * render
     * @param {elementGenerator} h
     * @param {State} props
     * @param {Element} slots
     * @throws {Error} need implements
     */
    render(
        h = elementGenerator.bind(this),
        props = this.$props,
        slots = this.$slots
    ) {
        throw new Error(`"need implements ${this.constructor.name}.action`);
    }

    /**
     * @description if mutation is not defined just re render
     * @param {State} props
     * @param {Element} slots
     * @return {Element}
     */
    mutation(props, slots) {
        // clearDom(this.$zone);
        this.$props = props;
        this.$slots = slots;
        return renderDom(this.$zone, this);
    }
};
/**
* @param {Function} Parent
* @return {Element}
*/
class Component extends BaseComponent {
    /**
     * Element constructor
     * @description on init default tag generate
     */
    constructor() {
        super();
    }
    /**
     * @param {HTMLElement} mountDom
     * @param {Component} component
     */
    static async mount(mountDom, component) {
        // render ref logic
        clearDom(mountDom);
        renderDom(mountDom, component);
        return this;
    }
}
Component.mount = FixedType.expect(
    Component.mount,
    FixedType.instanceof(HTMLElement),
    FixedType.instanceof(BaseComponent)
);

export default Component;
export {
    Component,
    BaseComponent
};
