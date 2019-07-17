// Add Lifecycle beforeCreate
import {FixedType} from './FixedType.js';
import {BaseComponent} from './core/BaseComponent.js'
import {VNode} from './core/VNode.js'

export const clearDom = (mountDom)=>mountDom.innerHTML = '';
export const renderDom = (mountDom,component)=>{
    const vnode = component.render(
        VNode.create,
        component.$props,
        component.$slots
    );
    mountDom.appendChild(vnode.render(mountDom));
}

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
        renderDom(mountDom, component);
        return this;
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
        renderDom(this.$zone, this);
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
