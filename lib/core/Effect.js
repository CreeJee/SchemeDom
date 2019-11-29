export const Effect = class Effect {
    static watch = [];
    static KEYED_SYMBOL = '$';
    // vaild,mark가 쌍으로 매칭되야하는데 이때 이걸 어캐 메칭해야 자알메칭했다고 할끄아
    /**
     * @memberof Effect
     * @static
     * @param {String} expr
     * @return {Boolean}
     */
    static vaildExpr(expr) {
        const len = expr.length;
        return expr[0] === this.KEYED_SYMBOL && expr[1] === '[' && expr[len - 1] === ']';
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
        return `${this.KEYED_SYMBOL}[${uid}]`;
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
        if (uid = this.unMark(expr)) {
            return this.watch[uid].value;
        } else {
            throw new Error('error unwrapping');
        }
    }
    /**
     * @param {String} expr
     * @return {Array<Effect>}
     */
    static unMarkGroup(expr) {
        const exprGroup = expr.split(this.KEYED_SYMBOL).slice(1);
        return exprGroup.map((uid)=>this.unMark(`${this.KEYED_SYMBOL}${uid}`));
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
     * Creates an Effect.
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
        const old = this.value;
        this._value = v;
        this.effect(v, old);
    }
    /**
     * force set value on effect
     * @param {any} v 
     */
    _forceSet(v) {
        this._value = v;
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
     * @param {any} value
     * @param {any} oldValue
     */
    effect(value = this.value, oldValue = undefined) {
        for (const handler of this.handlers) {
            // do not context things
            handler(this.value, oldValue, this);
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