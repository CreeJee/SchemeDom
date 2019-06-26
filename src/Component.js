// TODO : side effect hook

import {FixedType} from './FixedType.js';
const BaseComponent = class baseComponent {
    /**
     * Base Component
     */
    constructor() {
        this.$ref = null;
        this.$props = {};
        this.$slots = [];
    }
    /**
     * render
     * @param {ElementGenerator} h
     * @param {State} props
     * @param {Element} slots
     * @throws {Error} need implements
     */
    render(h = ElementGenerator, props, slots) {
        throw new Error(`"need implements ${this.constructor.name}.action`);
    }

    /**
     * @description if mutation is not defined just re render
     * @param {State} props
     * @param {Element} slots
     * @return {Element}
     */
    mutation(props, slots) {
        return this.render(ElementGenerator, props, slots);
    }
};
// const _invoke = (ref, str, param) => (
//     (
//         new Function(
//             ...Object.keys(param).concat(str)
//         )
//     ).apply(
//         ref,
//         Object.values(param)
//     )
// );
// const _elementEffect = (element, invokeStr) => (
//     ([k, v]) => _invoke(element, `this.${invokeStr}(k,v)`, {k, v})
// );
// const ElementGenerator = FixedType.expect(
//     (tagName, attributes, ...children) =>{
//         const el = document.createElement(tagName);
//         const text = attributes.text;

//         el.textContent = text;
//         delete attributes.text;

//         Object.entries(attributes)
//               .forEach(_elementEffect(el, 'setAttribute'));
//         children.forEach((v)=>{
//             return el.appendChild(el instanceof Component ? v.render() : v);
//         });
//         return el;
//     },
//     String,
//     Object,
//     FixedType.spread(
//         FixedType.or(
//             FixedType.instanceof(HTMLElement),
//             FixedType.instanceof(BaseComponent)
//         )
//     )
// );
const isElementOrComponent = (v)=>(
    v instanceof HTMLElement ||
    v instanceof BaseComponent
);
const ElementGenerator = (tagName, attributes, ...children) =>{
    if (
        typeof tagName === 'string' &&
        attributes instanceof Object &&
        children.every(isElementOrComponent)) {
        const el = document.createElement(tagName);
        const text = attributes.text;

        el.textContent = text;
        delete attributes.text;

        Object.entries(attributes).forEach(([k, v])=>el.setAttribute(k, v));
        children.forEach((v)=>{
            el.appendChild(
                v instanceof Component ?
                    v.render(ElementGenerator, v.$props, children) :
                    v
            );
        });
        return el;
    } else {
        throw new Error(
            'arguments must [String,Object,...[HTMLElement|BaseComponent]'
        );
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
        component.$ref = component.render(
            ElementGenerator,
            this.$props,
            this.$slots,
        );
        mountDom.innerHTML = '';
        mountDom.appendChild(component.$ref);

        component.$dom = mountDom;
        return component.$dom;
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
    BaseComponent,
    ElementGenerator
};
