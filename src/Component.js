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

const bindVNode = function(parent, component, props, ...childs) {
    component.$vNode = component.render(
        componentOrElement.bind(component),
        props,
        ...childs
    );
    component.$parent = parent;
    return component.$vNode;
};
const componentOrElement = function(arg1, props, ...childs) {
    return arg1 instanceof BaseComponent ?
        bindVNode(this, arg1, props, ...childs) :
        VNodeElement.create(arg1, props, ...childs);
};
export const clearDom = (mountDom) => {
    const range = document.createRange();
    range.selectNodeContents(mountDom);
    range.deleteContents();
};
export const renderDom = function(mountDom, component) {
    let comparedTree = null;
    component._zone = mountDom;
    if (component.$vNode !== null && component.isUpdated()) {
        comparedTree = component.$vNode;
    }
    component.$vNode = bindVNode(null, component, component.props);
    generate(mountDom, component.$vNode, comparedTree);
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
     * @return {Component}
     */
    static mount(mountDom, component) {
        // 효과적인 dom튜닝방법을 찾을것
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
     * @return {Element}
     */
    mutation(props) {
        const $zone = this.$zone;
        Component.mount($zone, this);
        return this;
    }
    /**
     * @description use safe mutation props
     * @param {Function} next async next handler
     * @param {Object} props
     */
    deliveredProps(next, props) {
        next(props);
    }
    /**
     * when needs mutation check
     * @param {Object} props
     * @return {Boolean}
     */
    isUpdated(props = {}) {
        return true;
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
