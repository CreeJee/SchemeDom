import {FixedType} from './core/FixedType.js';
import {BaseComponent} from './core/BaseComponent.js';
import {create, bind, update} from './core/VNode.js';
const componentOrElement = (handler) => (
    (componentOrString, ...effect) => {
        return componentOrString instanceof BaseComponent ?
            renderDom(componentOrString) :
            typeof handler === 'function' ?
                handler(componentOrString, ...effect):
                bind(create(componentOrString, ...effect));
    }
);
export const renderDom = function(component) {
    return component.render(
        componentOrElement(false),
        component.props,
        component.slots
    );
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
        component.$vNode = renderDom(component);
        component.$update = componentOrElement(mountDom, update(component.$vNode));
        mountDom.appendChild(component.$vNode);
        return this;
    }
    /**
     * @description if mutation is not defined just re render
     * @param {State} props
     * @return {Element}
     */
    mutation(props) {
        debugger;
        this.render(
            this.$update,
            Object.assign(this.props, props),
            this.slots
        );
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
