export const BaseComponent = class baseComponent {
    /**
     * Base Component
     * @param {Object} props
     */
    constructor(props = {}) {
        this.$vNode = null;
        this.$parent = null;
        this.props = props;
    }
    /**
     * component appendRef
     * @readonly
     */
    get $zone() {
        return this.$parent === null ? this._zone : this.$parent.$vNode.$ref;
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
