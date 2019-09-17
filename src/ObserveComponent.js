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
        component.props = props;
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
        $state.addEvent(_updated.bind(null, this));
    }
    /**
     * @description use safe mutation props
     * @param {Function} next async next handler
     * @param {State} state
     */
    deliveredProps(next, state) {
        next(state);
    }
}
const ProxyedConstruct = FixedType.expect(
    ObserveComponent,
    State
);
export default ProxyedConstruct;
export {ProxyedConstruct as ObserveComponent};
