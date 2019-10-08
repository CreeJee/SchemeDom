import * as ENV from './Env.js';
// observe 타입기준은
//    attribute 와
//    children 이있음 (실제로 children 안에 textNode 나 Element 나 같은걸로 취급해도 상관없을듯)
const Effect = class Effect {
    static watch = [];
    // vaild,mark가 쌍으로 매칭되야하는데 이때 이걸 어캐 메칭해야 자알메칭했다고 할끄아
    /**
     * @memberof Effect
     * @static
     * @param {String} expr
     * @return {Boolean}
     */
    static vaild(expr) {
        const len = expr.length;
        return expr[0] === '#' && expr[1] === '[' && expr[len - 1] === ']';
    }
    /**
     *
     * @memberof Effect
     * @static
     * @param {Number} uid
     * @return {String}
     */
    static mark(uid) {
        return `#[${uid}]`;
    }
    /**
     *
     * @memberof Effect
     * @static
     * @param {any} v
     * @return {Effect}
     */
    static generate(v) {
        return new this(v);
    }
    /**
     * @memberof Effect
     * @static
     * @param {String} expr
     * @return {Number}
     */
    static unMark(expr) {
        return this.vaild(expr) ? parseFloat(expr.slice(2, -1)) : NaN;
    }
    /**
     *
     * @memberof Effect
     * @static
     * @param {String} expr
     * @return {any}
     */
    static unMarkExpression(expr) {
        let uid = -1;
        if (uid = this.unMark()) {
            return this.watch[uid].value;
        } else {
            throw new Error('error unwrapping');
        }
    }
    /**
     * @static
     */
    static attach(uid, on) {

    }
    /**
     *Creates an instance of Effect.
     * @param {any} v
     * @param {...function} on
     */
    constructor(v, ...on) {
        this.uid = this.constructor.watch.push(this) - 1;
        this._value = v;
        this.handlers = on;
    }
    /**
     * @param {any} v
     */
    set value(v) {
        this._value = v;
        this.effect();
    }
    /**
     * side effect exec
     */
    effect() {
        for (const handler of this.handlers) {
            // do not context things
            handler(this._value);
        }
    }
    /**
     * auto mark html variable
     * @return {String}
     */
    toString() {
        return this.constructor.mark(this.uid);
    }
    /**
     * Observe handler remove
     */
    remove() {
        const watch = this.constructor.watch;
        watch.splice(watch.indexOf(this), 1);
        this.handlers.splice(0);
        this._value = undefined;
        this.uid = -1;
    }
    /**
     *
     *
     */
    attach() {

    }
};

// const noOp = () => {};
const html = (templateGroup, ...mutationVariable) => {
    const [startAt, ...others] = templateGroup;
    const mutationSize = mutationVariable.length;

    const resultDom = document.createElement('template');
    let content = startAt;
    let walker = null;
    let _nextNode = null;

    for (let nth = 0; nth < mutationSize; nth++) {
        content += Effect.generate(mutationVariable[nth]) + others[nth];
    }
    resultDom.innerHTML = content;
    walker = document.createTreeWalker(
        resultDom.content,
        NodeFilter.SHOW_ALL,
        null,
        false
    );

    while (_nextNode = walker.nextNode()) {
        for (const pair of _nextNode.attributes) {
            const uid = Effect.unMark(pair.value);
            if (!isNaN(uid)) {
                debugger;
            }
        }
    }
    // gonna next and attach observe
    // 또한 이미 생성된 child
};
html`<div class='group' id='${2}'>
    <span>${1}</span>
    ${Array.from({length: 10}).fill(`<span></span>`)}
</div>`;
export const mutation = (uid, value) => {
    // uid 에 알맞는 effect 군들을 call해주면됨;
    // group에 대하여 대책은 차후 생각해보za
};
