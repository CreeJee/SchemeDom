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
        super({});
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
        debugger;
        const slots = this.$slots;
        if (this.isUpdated(props)) {
            setTimeout(async ()=>{
                const result = await this.deliveredProps(props);
                if(typeof result === "object" && result !== null){
                    props = result;
                }
                this.mutation(props,slots);
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
