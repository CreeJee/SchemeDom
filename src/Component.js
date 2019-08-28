// add component dom cloning
// or
// auto merge component

//
import {FixedType} from './core/FixedType.js';
import {BaseComponent} from './core/BaseComponent.js';
import {
    Element as VNodeElement,
    Fragment,
    generate,
} from './core/VNode.js';
const bindVNode = (component, props, ...childs) => (
    component.render(
        componentOrElement,
        props,
        ...childs
    )
);
const componentOrElement = (arg1, props, ...childs)=>(
    arg1 instanceof BaseComponent ?
        bindVNode(arg1, props, ...childs) :
        VNodeElement.create(arg1, props, ...childs)
);
export const clearDom = (mountDom)=>mountDom.innerHTML = '';
export const renderDom = (mountDom, component)=>{
    component.$vNode = bindVNode(component, {});
    generate(mountDom, component.$vNode);
};

/**
 *
 *
 * @class Component
 * @extends {BaseComponent}
 */
class Component extends BaseComponent {
    /**
     *Creates an instance of Component.
     * @param {Object} props
     * @memberof Component
     */
    constructor(props) {
        super(props);
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
        Component.mount(this.$zone, this);
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
    BaseComponent,
};
