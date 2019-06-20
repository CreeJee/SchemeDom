import Component from './Component.js';
import {State} from './State.js';
/**
 * ObserveElement
 */
class ObserveElement extends Component {
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
     * @param {State} props
     * @param {Element} slots
     * @param {ElementGenerator} h
     * @throws {Error} need implements
     * @return {HTMLElement}
     */
    render(props, slots, h) {
        return super.render(props, slots, h);
    }
}
export default ObserveElement;
