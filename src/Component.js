// TODO : side effect hook

import {FixedType} from './FixedType.js';
const _invoke = (ref, str, param) => (
    (
        new Function(
            ...Object.keys(param).concat(str)
        )
    ).apply(
        ref,
        Object.values(param)
    )
);
const _elementEffect = (element, invokeStr) => (
    ([k, v]) => _invoke(element, `this.${invokeStr}(k,v)`, {k, v})
);
const ElementGenerator = FixedType.expect(
    (tagName, attributes, ...children) =>{
        const el = document.createElement(tagName);
        const text = attributes.text;

        el.textContent = text;
        delete attributes.text;

        Object.entries(attributes).forEach(_elementEffect(el, 'setAttribute'));
        children.forEach((v)=>el.appendChild(v));
        return el;
    },
    String,
    Object,
    FixedType.spread(FixedType.instanceof(HTMLElement))
);
// const ComponentGenerator = FixedType.expect(
//     ()
// );

/**
* @param {Function} Parent
* @return {Element}
*/
class Component {
    /**
     * Element constructor
     * @description on init default tag generate
     */
    constructor() {
        // this.$state =  {extendsState}
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
     * @return {HTMLElement}
     */
    async render(h = ElementGenerator, props, slots) {
        throw new Error(`"need implements ${this.constructor.name}.action`);
    }
    /**
     * @param {State} props
     * @param {Element} slots
     * @description if mutation is not defined just re render
     * @return {Element}
     */
    async mutation(props, slots) {
        return this.render(ElementGenerator, props, slots);
    }
    /**
     * @param {HTMLElement} mountDom
     * @param {Component} component
     */
    static async mount(mountDom, component) {
        // render ref logic
        this.$ref = await component.render(
            ElementGenerator,
            this.$props,
            this.$slots,
        );
        mountDom.appendChild(this.$ref);
        return mountDom;
    }
}

export default Component;
export {
    Component,
    ElementGenerator
};
