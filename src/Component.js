// Add Lifecycle beforeCreate
import {FixedType} from './core/FixedType.js';
import {BaseComponent} from './core/BaseComponent.js'
import {VNode,fragment} from './core/VNode.js'

export const clearDom = (mountDom)=>mountDom.innerHTML = '';
export const renderDom = async (mountDom,component)=>{
    component.$vNode = component.render(
        VNode.create,
        component.$props = await component.deliveredProps(component.$props),
        ...component.$slots
    );
    component.$vNode.render(mountDom)
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
        // 효과적인 dom튜닝방법을 찾을것
        clearDom(mountDom);
        await renderDom(mountDom, component);
        return this;
    }
    /**
     * fragment generator
     * @param  {...VNode} child 
     */
    static fragment(...child){
        return fragment(...child);
    }
    /**
     * @description if mutation is not defined just re render
     * @param {State} props
     * @param {Element} slots
     * @return {Element}
     */
    async mutation(props, slots) {
        this.$props = props;
        this.$slots = slots;
        await renderDom(this.$zone, this);
        return this;
    }
    /**
     * @description use safe mutation props
     * @param {Object} oldProps
     * @return {Promise<Object>} delivedProps
     */
    async deliveredProps(oldProps) {
        return {};
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
