import Component from './Component.js';
import {State} from './State.js';
/**
 * ObserveComponent
 */
class ObserveComponent extends Component {
    /**
     * @param {String} key reflect key
     * @param  {...any} used used boundedState
     */
    constructor(key, ...used) {
        super();
        this.$state = State.reflect(key);
        State.observe(this.render, ...used);
    }
    /**
     * @param {ElementGenerator} h
     * @param {State} props
     * @throws {Error} need implements
     * @return {HTMLElement}
     */
    render(h, props) {
        return super.render(h, props);
    }
}
export default ObserveComponent;
export {ObserveComponent};
