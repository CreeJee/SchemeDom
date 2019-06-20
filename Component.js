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
    (tagName, classObj, attributes) =>{
        const el = document.createElement(tagName);
        Object.entries(attributes).forEach(_elementEffect(el, 'setAttribute'));
        Object.entries(classObj).forEach(_elementEffect(el, 'classList.add'));
    },
    String,
    Object,
    Object
);
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
        this.$props = {};
    }
    /**
     * render
     * @param {State} props
     * @param {ElementGenerator} h
     * @throws {Error} need implements
     * @return {HTMLElement}
     */
    async render(props, h = ElementGenerator) {
        throw new Error(`"need implements ${this.constructor.name}.action`);
    }
    /**
     * @param {State} props
     * @description if mutation is not defined just re render
     * @return {Element}
     */
    async mutation(props) {
        return this.render(props);
    }
    /**
     * @param {HTMLElement} mountDom
     * @param {HTMLElement} mountedArea
     */
    static async mount(mountDom) {
        mountDom.appendChild(this.render(
            this.$props
        ));
        return mountDom;
    }
}

export default Component;
export {
    Component,
    ElementGenerator
};
