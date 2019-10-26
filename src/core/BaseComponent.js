export const BaseComponent = class BaseComponent {
    /**
     * Base Component
     * @param {Object} props
     */
    constructor(props = {}) {
        this.$vNode = null;
        this.props = props;
        this.slots = [];
    }
    /**
     * render
     * @param {VNode.create} h
     * @param {State} props
     * @param {Element} slots
     * @throws {Error} need implements
     */
    render(
    ) {
        throw new Error(`"need implements ${this.constructor.name}.action`);
    }
};
