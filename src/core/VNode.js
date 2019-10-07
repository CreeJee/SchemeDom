import * as ENV from './Env.js';
//observe 타입기준은
//    attribute 와
//    children 이있음 (실제로 children 안에 textNode 나 Element 나 같은걸로 취급해도 상관없을듯)
const Effect = class Effect {
    static watch = [];
    // vaild,mark가 쌍으로 매칭되야하는데 이때 이걸 어캐 메칭해야 자알메칭했다고 할끄아
    static vaild(expr) {
        const len = expr.length ;
        return expr[0] === '#' && expr[1] === '[' && expr[len - 1] === ']';
    }
    static mark(uid) {
        return `#[${uid}]`;
    }
    static unMark(expr){
        return this.vaild(expr) ? expr.slice(2,-1) : -1;
    }
    static unMarkExpression(expr){
        let uid = -1;
        if (uid = this.unMark()) {
            return this.watch[uid].value
        } else {
            throw new Error('error unwrapping');
        }
    }
    constructor(v, ...on){
        this.uid = this.constructor.watch.push(this) - 1;
        this._value = v;
        this.handlers = on;
    }
    set value(v){
        this._value = v;
        this.effect();
    }
    effect(){
        for (const handler of this.handlers){
            // do not context things
            handler(this._value);
        }
    }
    toString() {
        return this.constructor.mark(this.uid);
    }
    remove(){
        const watch = this.constructor.watch;
        watch.splice(watch.indexOf(this), 1);
        this.handlers.splice(0);
        this._value = undefined;
        this.uid = -1;
    }
};
const noOp = () => {};
const html = (templateGroup, ...mutationVariable) => {
    const [startAt, ...others] = templateGroup;
    const mutationSize = mutationVariable.length;

    let resultDom = document.createElement('template');
    let content = startAt;
    let walker = null;
    let _nextNode = null;

    for (let nth = 0; nth < mutationSize; nth++) {
        content += Effect.mark(mutationVariable[nth]) + others[nth];
    }
    resultDom.innerHTML = content;
    walker = document.createTreeWalker(resultDom.content, NodeFilter.SHOW_ALL, null, false);
    
    do{
        _nextNode = this.nextNode();
        // find tag and attribute
        // and allocate Effect
        // for [text,content,attribute]
    }while(_nextNode !== null)
    // gonna next and attach observe
    // 또한 이미 생성된 child
}
export const mutation = (uid, value) => {
    // uid 에 알맞는 effect 군들을 call해주면됨;
    // group에 대하여 대책은 차후 생각해보za
}
html`<div class='group' id='${2}'>
    <span>${1}</span>
    ${Array.from({length: 10}).fill('<span></span>')}
</div>`
