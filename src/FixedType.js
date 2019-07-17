/**
 * TODO : CustomError and Generating Type Error (ex :prefix,etc...)
 */
const customDefaultFunc = () => {};

const parentSymbol = Symbol('@@Parent');
const TypeListSymbol = Symbol('@@TypeList');
const TypeTable = class TypeTable extends Map {
};
const JUST_VALUE_CONFIG = Object.freeze({
    enumerable: false,
    configurable: false,
    writable: false
});
/**
 *
 * @param {*} obj
 * @description detect undefined,null
 * @return {Boolean}
 */
const isErrorValue = (obj) => obj === null || obj === undefined;

/**
 *obj convert as Function or value
 * @param {Any} obj
 * @return {Function}
 */
const justConstructor = (obj) => {
    if (isErrorValue(obj)) {
        return customDefaultFunc;
    } if (typeof obj === 'function') {
        return obj;
    }
    return obj.constructor;
};
/**
 *
 * @param {Any} obj
 * @description gain Type name
 * @return {String}
 */
const gainTypeName = (obj) => {
    const result = justConstructor(obj);
    return isErrorValue(obj) ? obj+'' : result.name;
};
/**
 *definePropery suger
 *
 * @param {Any} target
 * @param {Any} prop
 * @param {Any} value
 * @return {Any} target
 */
const justValueProp = (target, prop, value) => {
    Object.defineProperty(target, prop, Object.assign(
        {},
        JUST_VALUE_CONFIG,
        {
            value
        }
    ));
    return target;
};
/**
 * defineProperties suger
 * @param {Object} target target Object
 * @param {Object} obj properties set
 * @return {target} target
 */
const justValueProps = (target, obj) => {
    const props = Object.keys(obj)
        .concat(Object.getOwnPropertySymbols(obj))
        .reduce(
            (accr, k) => {
                accr[k] = Object.assign(
                    {},
                    JUST_VALUE_CONFIG,
                    {
                        value: obj[k]
                    }
                );
                return accr;
            },
            {}
        );
    Object.defineProperties(target, props);
    return target;
};
/**
 * @param {TypeTable} parent
 * @param {Object} obj
 * @return {TypeTable} table
 */
const expectBinder = (parent, obj) => {
    let child = null;
    if (parent.has(obj)) {
        child = parent.get(obj);
    } else {
        parent.set(obj, child = new TypeTable());
        justValueProp(child, parentSymbol, parent);
    }
    return child;
};
/** *********************
*  FixedType Instance  *
*********************** */
let FixedTypeInstance = null;
const expectHandler = (instance) => ({
    apply: (target, thisArg, args) => {
        instance.search(target, ...args);
        return Reflect.apply(target, thisArg, args);
    },
    construct: (target, args, newTarget) => {
        instance.search(newTarget, ...args);
        return Reflect.construct(target, args, newTarget);
    }
});
/**
 * property handler
 * @param {FixedType} instance
 * @return {Object} wrappedObject
 */
const propertyHandler = (instance) => ({
    set: (obj, prop, value) => {
        instance.search(instance.initProp(obj, prop), value);
        return Reflect.set(obj, prop, value);
    }
});
/**
 * fixed type method then expect
 * @param  {Object} name proxy chain method name
 * @param  {ProxyHandler} handler proxyHandler custom action
 * @param  {Function} value expext reference object
 * @param  {...Type} args type as Function
 * @return {Proxy<Any>} return this
 *
 * please do not break type instead of create new Type
 */
const expect = (name, handler, value, ...args) => {
    // let proxyValue = value;
    if (!(value instanceof Object)) {
        throw new Error('referenced Target is Must Object');
    }
    if (
        !(
            typeof value[TypeListSymbol] === 'object' &&
            value[TypeListSymbol] instanceof TypeTable
        )
    ) {
        // proxyValue = new Proxy(value, handler);
        justValueProps(
            value, {
                [TypeListSymbol]: new TypeTable(),
                [name]: expectBinder.bind(value, name, handler, value)
            }
        );
    }
    args.reduce(expectBinder, value[TypeListSymbol]);
    return value;
};
/**
 * @param {Function} TypeClass
 */
const FixedBaseType = class FixedBaseType {
    /**
     * @param {TypeTable} parent
     * @param {Function} objType
     */
    action(parent, objType) {
        throw new Error(`"need implements ${this.constructor.name}.action`);
    }
    /**
     * @param {Function} type
     * @return {Boolean} is same reference
     */
    same(type) {
        return this.TypeClass === type || type;
    }
    /**
     * @param {Function} TypeClass
     */
    constructor(TypeClass) {
        this.TypeClass = TypeClass;
    }
};
/**
 * @param {Type} Type
 * @example
 * const foo = FixedType.expect(
 *      (...v)=>v.map((o)=>typeof o).join(','),
 *      FixedType.Spread(String)
 * );
 * foo('a','b') // 'string,string'
 * foo('a') // 'string'
 * foo(1) // 'number'
 */
const FixedTypeSpread = class FixedTypeSpread extends FixedBaseType {
    /**
     * @param {TypeTable} parent
     * @param {Function} objType
     * @param {Any} obj
     * @return {null} when action fail
     * @return {Any} when action is success
     */
    action(parent, objType, obj) {
        // this instancof 처리...
        // 타입비교처리 필요
        return (
            (
                this.TypeClass instanceof FixedBaseType
                    ? this.TypeClass.action(parent, objType, obj)
                    : this.same(objType)
            )
                ? parent
                : null
        );
    }

    /**
    * Creates an instance of FixedType.Spread.
    * @param {Function|T} TypeClass
    */
    constructor(TypeClass) {
        super(TypeClass);
    }
};
/**
 * @param {...{Type}} Type
 * @example
 * const foo = FixedType.expect((o)=>typeof o,FixedType.Or(String,Number));
 * foo('a') // 'string'
 * foo(1) // 'number'
 */
const FixedTypeOr = class FixedTypeOr extends FixedBaseType {
    /**
     * @param {TypeTable} parent
     * @param {Any} objType
     * @param {Any} obj
     * @return {Any} is middleware is vaild
     * @return {null} is middleware is not vaild
     */
    action(parent, objType, obj) {
        const mappingLike = (o) =>(
            o instanceof FixedBaseType ?
                o.action(parent, objType, obj) :
                obj instanceof o
        );
        return this.TypeClass.map(mappingLike).find((n)=>!!n);
    }
    /**
     * @param  {...Any} TypeClass
     */
    constructor(...TypeClass) {
        super(TypeClass);
    }
};
const FixedTypeAny = class FixedTypeAny extends FixedBaseType {
    /**
     * @description Any Fixed filter
     * @return {undefined}
     */
    action() {
        return true;
    }
};
const fixedTypeAny = new FixedTypeAny();
const FixedTypeArray = class FixedTypeArray extends FixedBaseType {
    /**
     * @param {TypeTable} parent
     * @param {Function} objType
     * @param {Object} obj
     * @return {Object}
     * @return {null}
     */
    action(parent, objType, obj) {
        const cond = obj.every((v) => this.same(justConstructor(v)));
        return cond ? parent.get(this) : null;
    }
};
/**
 * Fixed Type instanceof Logic
 */
const FixedTypeInstanceOf = class FixedTypeInstanceof extends FixedBaseType {
    /**
     * @param {TypeTable} parent
     * @param {Function} objType
     * @param {Object} obj
     * @return {Object}
     * @return {null}
     */
    action(parent, objType, obj) {
        return obj instanceof this.TypeClass ? parent.get(this) : null;
    }
};
/**
 *Type Fixed Class
 *
 * @class FixedType
 */
class FixedType {
    /**
     * Creates an instance of FixedType.
     * @memberof FixedType
     */
    constructor() {
        justValueProps(this, {
            useProps: [
                FixedTypeSpread,
                FixedTypeOr,
                FixedTypeAny,
                FixedTypeArray,
                FixedTypeInstanceOf
            ],
        });
        return this;
    }

    /**
     *
     * @description Singletone
     * @readonly
     * @static
     * @memberof FixedType
     */
    static get Instance() {
        if (FixedTypeInstance === null) {
            FixedTypeInstance = new FixedType();
        }
        return FixedTypeInstance;
    }

    /**
     * use MiddleFilter
     * @param {FixedType.BaseType} {Type,action}
     * @return {FixedType} return fixed type
     * @memberof FixedType
     */
    use(...types) {
        types.filter((type) => type instanceof FixedType.BaseType)
            .forEach((baseTypes) => this.useProps.push(baseTypes));
        return this;
    }

    /**
    * fixed type method then expect
    * please do not break type instead of create new Type
    * @static
    * @param  {Function} func expext type for each arguments
    * @param  {...Type} args type as Function
    * @return {Proxy<Any>} return this
    * @memberof FixedType
    *
    * @example
    * const foo = FixedType.expect(function(str){return typeof str},String);
    * foo('') //'string'
    * foo(1) //throw error
    *
    */
    static expect(func, ...args) {
        return expect('expect', expectHandler(this.Instance), func, ...args);
    }

    /**
     *fixed type property setter
        *
        * @static
        * @param {Object} refObject
        * @param {...{Type}} Type
        * @memberof FixedType
        *
        * @example
        * const foo = FixedType.property({a : '1'}).expect('a',String)
        * b.a = '3'; //'3'
        * b.a = 3; //throw error
        * @return {Proxy<Any>}
        */
    static property(refObject, ...args) {
        return expect(
            'expect',
            propertyHandler(this.Instance),
            refObject,
            ...args
        );
    }
    /**
     * @param {Function} Type
     * @return {FixedTypeSpread}
     */
    static spread(Type) {
        return new FixedTypeSpread(Type);
    }

    /**
     * @param {...{Type}} Type
     * @example
     * const foo = FixedType.expect(
     *      (o)=>typeof o,
     *      FixedType.Spread(String,Number)
     * );
     * foo('a') // 'string'
     * foo(1) // 'number'
     * @return {FixedTypeOr}
     */
    static or(...Type) {
        return new FixedTypeOr(...Type);
    }
    /**
     * @return {FixedTypeAny} cached FixedTypeAny
     */
    static any() {
        return fixedTypeAny;
    }
    /**
     * @param {Function} Type
     * @return {FixedTypeArray}
     */
    static array(Type) {
        return new FixedTypeArray(Type);
    }
    /**
     * @param {Function} Type
     * @return {FixedTypeInstanceOf}
     */
    static instanceof(Type) {
        return new FixedTypeInstanceOf(Type);
    }
    /**
     * @private
     * @param {TypeTable} parent Derived from TypeListSymbol
     * @param {Type} Type the constructor for each Arguments
     * @param {Any} obj gain object
     * @return {Boolean} is middleWare success
    */
    callMiddleWare(parent, Type, obj) {
        const types = Array.from(parent.keys());
        const res = types.filter(
            (metaObj) => this.useProps.includes(justConstructor(metaObj))
        );
        let reduced = false;
        let lastIndex = -1;
        if (res.length > 0) {
            reduced = res.reduce(
                (relativeParent, v) => v.action(relativeParent, Type, obj),
                parent
            );
            lastIndex = types.indexOf(reduced);
        }
        return reduced instanceof Object
            ? reduced
            : (types.length-1 === lastIndex+1);
    }

    /**
     * @private
     * @param {Object|TypeTable} referenced
     * @param {...Any} args argument object
     * @return {undefined}
     * @throws {TypeError}
     *
     * "strict cond table" vs "instanceof like table"
    */
    search(referenced, ...args) {
        const stringArg = args.map(gainTypeName).join(',');
        const errorObj = new TypeError(`not Matching Type [in : ${stringArg}]`);
        args.reduce(
            (parent, obj) => {
                const TypeClass = justConstructor(obj);
                const filterRes = this.callMiddleWare(parent, TypeClass, obj);
                if (
                    parent.has(TypeClass)
                    || filterRes
                    // || Array.from(parent.keys()).find((v)=>obj instanceof v)
                ) {
                    return filterRes || parent.get(TypeClass);
                }
                throw errorObj;
            },
            (
                referenced instanceof TypeTable
                    ? referenced
                    : referenced[TypeListSymbol]
            )
        );
    }

    /**
     * @param {Object} referenced
     * @param {String} prop
     * @param {Any} orInitValue default value
     * @return {TypeTable<any,any>} props
     * @throws {Error} when `referenced` is not contains TypeList TypeTable
     *
     * @todo AnyType으로 변수타입을 강제추가해서 side effect를 일으키는게 옳은것인지 흠...
     */
    initProp(referenced, prop, orInitValue = fixedTypeAny) {
        const refObject = referenced[TypeListSymbol];
        if (refObject instanceof TypeTable) {
            if (refObject.has(prop)) {
                return refObject.get(prop);
            }
            return refObject.set(orInitValue) && orInitValue;
        }
        throw new Error('first argumetnt is not contained [@@TypeListSymbol]');
    }
}
export default FixedType;
export {
    FixedType,
    FixedBaseType,
    fixedTypeAny as FixedTypeAny,
    FixedTypeArray,
    FixedTypeSpread,
    FixedTypeOr
};
