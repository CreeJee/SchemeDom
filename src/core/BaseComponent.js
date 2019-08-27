export const BaseComponent = class baseComponent {
    /**
     * Base Component
     */
    constructor({...props} = {}) {
        this.$vNode = null;
        this.$zone = null;
        this.props = props;
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

