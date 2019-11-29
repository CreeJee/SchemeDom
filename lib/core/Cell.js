 /**
 * Cell (minimal node group or self)
 */
export class Cell {
    static _maxUid = -1;
    /**
     * @property {String} template
     * @property {Array<Effect>} effects
     * @property {Array<Cell>} slots
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
            return this.ref;
        }
        return this.compile();
    }
    /**
     * generate self $ref
     * and generate slot $ref;
     * and binding lots of event
     * 
     */
    compile() {
        //concat generatedTemplates and mix effect and slots
        //순서는 template -> slot -> effect -> {recursive} 순으로 반영시킴
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
    toString() {
        return '';
    }
}