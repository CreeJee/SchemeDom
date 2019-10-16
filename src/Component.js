// add component dom cloning
// or
// auto merge component

//
import {FixedType} from './core/FixedType.js';
import {BaseComponent} from './core/BaseComponent.js';
import {
    html as create,
} from './core/VNode.js';

export const renderDom = function(mountDom, component) {
    const res = component.render(create, component.props, component.slots);
    component._zone = mountDom;
    mountDom.appendChild(res);
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
