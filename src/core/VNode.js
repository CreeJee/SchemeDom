// import * as ENV from './Env.js';
import {error} from './Log.js';

const _extractFragment = (content) => {
    return document.createRange().createContextualFragment(content);
};
const _clearDom = (mountDom) => {
    const range = document.createRange();
    range.selectNodeContents(mountDom);
    range.deleteContents();
};
const attributeEffect = ($ref, attributeName) => (value) => {
    $ref.attributes[attributeName].value = value;
};
const slotEffect = ($ref) => (value) => {
    _clearDom($ref);
    // TODO : 달라진 ref한정으로 변경
    $ref.appendChild(_extractFragment(value.join('')));
};
const textEffect = ($ref) => (value) => {
    $ref.data = value;
};
const _invokeAttach = (groupRef, uid, findEffect) => {
    if (!isNaN(uid)) {
        const effect = Effect.get(uid);
        const attachFunctor = findEffect(effect, findEffect);
        attachFunctor(effect.value);
        effect.attach(attachFunctor);
        groupRef.push(uid);
    }
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
    static vaildExpr(expr) {
        const len = expr.length;
        return expr[0] === '#' && expr[1] === '[' && expr[len - 1] === ']';
    }
    /**
     * @memberof Effect
     * @static
     * @param {Number} uid
     * @return {Boolean}
     */
    static vaildUid(uid) {
        return this.watch.length > uid;
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
        return this.vaildExpr(expr) ? parseFloat(expr.slice(2, -1)) : NaN;
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
        if (this.vaildUid(uid)) {
            this.watch[uid].attach(on);
        }
    }
    /**
     * @static
     * @param {Number} uid
     * @return {Effect}
     */
    static get(uid) {
        return this.vaildUid(uid) ? this.watch[uid] : null;
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
     * gain value
     * @return {any} v
     */
    get value() {
        return this._value;
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
export const create = (mountZone)=> (templateGroup, ...mutationVariable) => {
    const [startAt, ...others] = templateGroup;
    const mutationSize = mutationVariable.length;
    const mutationGroup = [];

    let child = null;
    let content = startAt;
    let _walker = null;
    let _nextNode = null;


    for (let nth = 0; nth < mutationSize; nth++) {
        const currentString = others[nth];
        content += Effect.generate(mutationVariable[nth]) + currentString;
    }
    _clearDom(mountZone);
    mountZone.appendChild(_extractFragment(content));
    child = mountZone.childNodes[mountZone.childElementCount-1];
    // 구조상 모순이 안날라면 여시점에서 append가 되고
    // 그 상단의 ref로 부터 walker로 순회하며 attach 하고 참조상의 이득을 바야함
    _walker = document.createTreeWalker(
        child,
        NodeFilter.SHOW_ALL,
        null,
        false
    );
    // 이론상 fragment를 뿌리고 walker를 돌아야되나
    // 으쉣
    while (_nextNode = _walker.nextNode()) {
        let uid = NaN;
        let attributes = null;
        let attributeSize = -1;

        switch (_nextNode.nodeType) {
        case Node.ELEMENT_NODE:
            attributes = _nextNode.attributes;
            attributeSize = attributes.length;
            for (let index = 0; index < attributeSize; index++) {
                const {name, value} = attributes[index];
                uid = Effect.unMark(value);
                _invokeAttach(mutationGroup, uid, () => attributeEffect(_nextNode, name));
            }
            break;
        case Node.TEXT_NODE:
            uid = Effect.unMark(_nextNode.data.trim());
            _invokeAttach(
                mutationGroup,
                uid,
                ({value}) => (
                    value instanceof Array ?
                        slotEffect(_nextNode.parentNode) :
                        textEffect(_nextNode)
                )
            );
            break;
        }
    }
    child.group = mutationGroup;
    return child;
};
export const update = (createdNode) => (unusedGroup, ...mutationGroup) => {
    const prevGroup = createdNode.group;
    const createdSize = prevGroup.length;
    if (createdSize !== mutationGroup.length) {
        error('Non accessable mutation dected');
    }
    for (let index = 0; index < createdSize.length; index++) {
        Effect.get(createdSize[index]).notify(mutationGroup[index]);
    }
};
// window.start = performance.now();
// window.result = u`<div class='group' id='${2}'>
//     <span>${1}</span>
//     ${Array.from({length: 10000}).fill('').map((v, k) => `<span>${k}</span>`)}
// </div>`;
// console.log(performance.now() - window.start);
