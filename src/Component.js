// Add Lifecycle beforeCreate
import {FixedType} from './core/FixedType.js';
import {BaseComponent} from './core/BaseComponent.js';
import {
    Element as VNodeElement,
    Fragment,
    generate,
} from './core/VNode.js';
const bindVNode = (component) => (
    component.render(
        componentOrElement,
        component.$props,
        ...component.$slots
    )
);
const componentOrElement = (arg1, ...args)=>(
    arg1 instanceof BaseComponent ?
        bindVNode(arg1) :
        VNodeElement.create(arg1, ...args)
);
export const clearDom = (mountDom)=>mountDom.innerHTML = '';
export const renderDom = (mountDom, component)=>{
    component.$vNode = bindVNode(component);
    generate(mountDom, component.$vNode);
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
        component.$zone = mountDom;
        // 효과적인 dom튜닝방법을 찾을것
        clearDom(mountDom);
        renderDom(mountDom, component);
        return this;
    }
    /**
     * fragment generator
     * @param  {...VNode} child
     * @return {VNode.Fragment}
     */
    static fragment(...child) {
        return new Fragment(...child);
    }
    /**
     * @description if mutation is not defined just re render
     * @param {State} props
     * @param {Element} slots
     * @return {Element}
     */
    mutation(props, slots) {
        this.$props = props;
        this.$slots = slots;
        Component.mount(this.$zone, this);
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
    BaseComponent,
};
