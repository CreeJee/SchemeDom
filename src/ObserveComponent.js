import Component from './Component.js';
import {State} from './State.js';
import FixedType from './core/FixedType.js';
/**
 * @private
 * @param {Component} component
 * @param {Object} props
 * @description observeComponent lifecycle private util
 */
const _updated = (component, props)=>{
    if (component.isUpdated(props)) {
        component.deliveredProps(
            component.mutation.bind(component),
            props
        );
    }
};
/**
 * ObserveComponent
 */
class ObserveComponent extends Component {
    /**
     * @param {State} $state
     */
    constructor($state) {
        super({});
        if (!($state instanceof State)) {
            throw new Error('need initalized State');
        }
        this.$state = $state;
        $state.observe(_updated.bind(null, this));
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
const ProxyedConstruct = FixedType.expect(
    ObserveComponent,
    State
);
export default ProxyedConstruct;
export {ProxyedConstruct as ObserveComponent};
