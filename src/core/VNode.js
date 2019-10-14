import * as ENV from './Env.js';
// observe 타입기준은
//    attribute 와
//    children 이있음 (실제로 children 안에 textNode 나 Element 나 같은걸로 취급해도 상관없을듯)

const attributeEffect = ($ref, attributeName) => (value) => {
    $ref.attributes[attributeName] = value;
};
const slotEffect = (effect) => (value) => {
    effect.notify(value);
};
const textEffect = ($ref) => (value) => {
    $ref.data = value;
};


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
     * attach handler
     * @static
     * @param {Number} uid
     * @param {Function} on
     */
    static attach(uid, on) {
        const watch = this.watch;
        if (watch.length > uid) {
            watch[uid].attach(on);
        }
    }
    /**
     * @static
     * @param {Number} uid
     * @return {Effect}
     */
    static get(uid) {
        const watch = this.watch;
        return watch.length > uid ? this.vaild[uid] : null;
    }
    /**
     *Creates an instance of Effect.
     * @param {any} v
     */
    constructor(v) {
        this.uid = this.constructor.watch.push(this) - 1;
        this._value = v;
        this.handlers = [];
    }
    /**
     * attach handler
     * @param {Function} on
     */
    attach(on) {
        this.handlers.push(on);
    }
    /**
     * @param {any} v
     */
    notify(v) {
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
};


const html = (templateGroup, ...mutationVariable) => {
    const [startAt, ...others] = templateGroup;
    const mutationSize = mutationVariable.length;

    const resultDom = document.createElement('template');
    let cacheKey = startAt;
    let content = startAt;
    // TODO : cacheKey 생성후 content 가져오기 
    let walker = null;
    let _nextNode = null;

    for (let nth = 0; nth < mutationSize; nth++) {
        const currentString = others[nth];
        content += Effect.generate(mutationVariable[nth]) + currentString;
        cacheKey += currentString;
    }
    
    resultDom.innerHTML = content;
    walker = document.createTreeWalker(
        resultDom.content,
        NodeFilter.SHOW_ALL,
        null,
        false
    );

    while (_nextNode = walker.nextNode()) {
        let uid = NaN;
        let attributes = null;
        let attributeSize = -1;
        let value = null;

        switch (_nextNode.nodeType) {
        case Node.ELEMENT_NODE:
            attributes = _nextNode.attributes;
            attributeSize = attributes.length;
            for (let index = 0; index < attributeSize; index++) {
                const pair = attributes[index];
                uid = Effect.unMark(pair.value);
                if (!isNaN(uid)) {
                    Effect.attach(uid, attributeEffect(_nextNode, pair.key));
                }
            }
            break;
        case Node.TEXT_NODE:
            uid = Effect.unMark(_nextNode.data);
            if (!isNaN(uid)) {
                value = Effect.get(uid);
                Effect.attach(
                    uid,
                    value instanceof Effect ?
                        slotEffect(value) :
                        textEffect(_nextNode)
                );
            }
            break;
        }
    }
    return resultDom.content;
};
html`<div class='group' id='${2}'>
    <span>${1}</span>
    ${Array.from({length: 10}).fill(`<span></span>`)}
</div>`;
export const mutation = (uid, value) => {
    // uid 에 알맞는 effect 군들을 call해주면됨;
    // group에 대하여 대책은 차후 생각해보za
};
