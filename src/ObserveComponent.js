import Component from './Component.js';
import {State} from './State.js';
import FixedType from './core/FixedType.js';

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
        $state.addEvent(this._updated.bind(this));
    }
    /**
     * @description use safe mutation props
     * @param {Function} next async next handler
     * @param {State} state
     */
    deliveredProps(next, state) {
        next(state);
    }
    /**
    * @private
    * @param {Object} props
    * @description observeComponent lifecycle private util
    */
    _updated(props) {
        if (this.isUpdated(props)) {
            this.props = props;
            this.deliveredProps(
                this.mutation.bind(this),
                props
            );
        }
    }
}
const ProxyedConstruct = FixedType.expect(
    ObserveComponent,
    State
);
export default ProxyedConstruct;
export {ProxyedConstruct as ObserveComponent};
