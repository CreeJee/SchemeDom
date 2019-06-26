import Component from './Component.js';
import {State} from './State.js';
import FixedType from './FixedType.js';
/**
 * ObserveComponent
 */
class ObserveComponent extends Component {
    /**
     * @param {State} state
     */
    constructor(state) {
        super(state);
        this.$state = state;
        state.observe(this._updated.bind(this));
    }
    /**
     * when needs mutation check
     * @param {Object} props
     * @return {Boolean}
     */
    isUpdated(props = {}) {
        return true;
    }
    /**
     * @description use safe mutation props
     * @param {Object} oldProps
     * @return {Promise<Object>} delivedProps
     */
    async deliveredProps(oldProps) {
    }
    /**
     * @private
     * @param {Object} props
     */
    _updated(props) {
        const slots = this.$slots;
        if (
            this.isUpdated(props)
        ) {
            setTimeout(async ()=>{
                await this.deliveredProps(props);
                this.$dom.innerHTML = '';
                this.$dom.appendChild(this.mutation(props, slots));
            }, 0);
        }
    }
}
const ProxyedConstruct = FixedType.expect(
    ObserveComponent,
    State
);
export default ProxyedConstruct;
export {ProxyedConstruct as ObserveComponent};
