 /**
 * VCell (minimal node group or self)
 */
class VCell {
    static _maxUid = -1;
    /**
     * @property {String} template
     * @property {Array<Effect>} effects
     * @property {Array<VCell>} slots
     */
    constructor() {
        this.templateProps = [];
        this.events = {};
        this.ref = null;
        this.effects = [];
        this.slots = [];
        this.uid = (this.constructor._maxUid++);
    }
    /**
     * @param {String} name
     * @param {Function} on
     */
    addEventListener(name, on) {
        if (!(name in this.events)) {
            this.events[name] = [];
        }
        this.events[name].push(on);
    }
    /**
     * @getter
     * @description computed getter for HTMLElement ref
     */
    get $ref() {
        if (this.ref !== null) {
            return this.$ref;
        }
        return this.compile();
    }
    /**
     * generate full HTMLElement ref
     */
    compile() {
        debugger;
    }
    /**
     * remove ref and slots
     */
    remove() {
        this.$ref.remove();
        for (const effect of this.effects) {
            effect.remove();
        }
        for (const slot of this.slots) {
            slot.remove();
        }
    }
}
export const create = (templateGroup, ...mutationVariable) => {
    const [startAt, ...others] = templateGroup;
    const mutationSize = mutationVariable.length;
    let content = startAt;
    for (let nth = 0; nth < mutationSize; nth++) {
        const currentString = others[nth];
        const currentVariable = mutationVariable[nth];
    }
};
