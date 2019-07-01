// Add Lifecycle beforeCreate
import {FixedType} from './FixedType.js';

const isElementOrComponent = (v)=>(
    v instanceof HTMLElement ||
    v instanceof BaseComponent
);
export const componentToDom = (o, mountZone) => {
    const el = o.render(
        elementGenerator.bind(o),
        o.$props,
        ...o.$slots
    );
    if (mountZone instanceof HTMLElement) {
        o.$zone = mountZone;
    }
    o.$ref = el instanceof BaseComponent ? componentToDom(el, mountZone) : el;
    return o.$ref;
};
export const clearDom = (mountDom)=>mountDom.innerHTML = '';
export const renderDom = (mountDom, el)=>{
    const isComponent = el instanceof BaseComponent;
    // TODO : Add documentFragment
    if (isComponent) {
        el.$zone = mountDom;
        el.$ref = componentToDom(el, mountDom);
    }
    mountDom.appendChild(isComponent ? el.$ref : el);
};
export const elementGenerator = (tag, attributes, ...children) => {
    const isBaseCond = (
        tag !== null &&
        tag !== undefined &&
        attributes instanceof Object &&
        children.every(isElementOrComponent)
    );
    if (isBaseCond) {
        if (typeof tag === 'string') {
            tag = document.createElement(tag);
        }
        if (tag instanceof HTMLElement) {
            const {text, ...attr} = attributes;
            const entryAttr = Object.entries(attr);
            if (text !== undefined) {
                tag.textContent = text;
            }
            for (let index = 0; index < entryAttr.length; index++) {
                const [k, v] = entryAttr[index];
                tag.setAttribute(k, v);
            }
            for (let index = 0; index < children.length; index++) {
                renderDom(tag, children[index]);
            }
        }
        if (tag instanceof BaseComponent) {
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
        clearDom(this.$zone);
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
