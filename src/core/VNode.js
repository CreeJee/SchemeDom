const DomCache = class DomCache {
    /**
     *
     * DomCache Instance
     * @readonly
     * @static
     */
    static get Instance() {
        return (
            this._instance === undefined ?
                this._instance = new DomCache() :
                this._instance
        );
    }
    /**
     *Creates an instance of DomCache.
     */
    constructor() {
        this.cacheTable = new Map();
    }
    /**
     *
     *
     * @param {String} tagName
     * @return {Element}
     */
    get(tagName) {
        if (!this.cacheTable.has(tagName)) {
            this.cacheTable.set(tagName, document.createElement(tagName));
        }
        return this.cacheTable.get(tagName).cloneNode(false);
    }
};
const defaultMutation = function(vNode, parentNode, nth, created) {
    const oldNode = parentNode.children[nth];
    const parentRef = parentNode.$ref;
    const selfRef = vNode.$ref;
    if (created) {
        parentRef.appendChild(selfRef);
    } else if (vNode.type !== oldNode.type || !vNode.compare(oldNode, vNode)) {
        const oldRef = parentRef.childNodes[nth];
        parentRef.insertBefore(selfRef, oldRef);
        oldRef.remove();
    }
    return vNode.$ref;
};
const _isCreateMode = ($vNode)=>$vNode.$ref === null;
const _isFunction = (v) => typeof v === 'function';
export const domCache = DomCache.Instance;
export const V_NODE_TEXT = Symbol('$$VNodeText');
export const V_NODE_ELEMENT = Symbol('$$VNodeElement');
export const V_NODE_FRAGMENT = Symbol('$$VNodeFragment');
export const V_NODE_COMPONENT = Symbol('$$VNodeComponent');
export const V_NODE_UNKNOWN = Symbol('$$VNodeUnknown');

/**
 *
 * @export
 * @param {Element} mountZone
 * @param {VNode} $vNode
 */
export function generate(mountZone, $vNode) {
    const isCreateMode = _isCreateMode($vNode);
    if (isCreateMode) {
        $vNode.create(mountZone);
    }
    for (const [index, $childNode] of $vNode.children.entries()) {
        generate($vNode.$ref, $childNode);
        // child가 createMode인것이 필요한건지 parent가 createMode인것이 필요한건지 불충분
        $childNode.mutation($vNode, index, isCreateMode);
    }
    if ($vNode.parent === null) {
        mountZone.appendChild($vNode.$ref);
    }
}
/**
 *
 * @export
 * @class VNode
 */
export class VNode {
    /**
     *Creates an instance of VNode.
     * @param {*} {...attributes}
     * @param {*} children
     * @memberof VNode
     */
    constructor({...attributes}, ...children) {
        const childLen = children.length;
        this.attributes = attributes;
        this.children = children;
        this.parent = null;
        this.next = null;
        this.prev = null;
        for (let i = 0; i < childLen; i++) {
            children[i].parent = this;
            if (i > 0) {
                children[i].prev = children[i-1];
            }
            if (i <= childLen-1) {
                children[i].next = children[i+1];
            }
        }
        this.$ref = null;
        // getter와 setter를 이용하여 tree변경시 부분적으로 dom재어
    }
    /**
     *
     * @param {VNode} parent
     * @throws {String} need implements
     * @memberof VNode
     */
    create(parent) {
        throw new Error('need implements [create]');
    }
    /**
     *
     * @param {VNode} old
     * @param {VNode} val
     * @throws {String} need implements
     * @memberof VNode
     */
    compare(old, val) {
        throw new Error('need implements [compare]');
    }
    /**
     *
     *
     * @param {VNode} parent
     * @param {Number} nth
     * @param {Boolean} created
     * @return {Element}
     * @memberof VNode
     */
    mutation(parent, nth, created) {
        return defaultMutation.call(null, this, parent, nth, created);
    }
    /**
     *
     * static util
     * @readonly
     * @memberof VNode
     */
    get static() {
        return this.constructor;
    }
    /**
     *
     * static util
     * @readonly
     * @memberof VNode
     */
    get isRoot() {
        return this.parent === null;
    }
    /**
     *
     * static util
     * @readonly
     * @memberof VNode
     */
    get sliblings() {
        if (this.isRoot) {
            return [this];
        }
        return this.parent.children;
    }
    /**
     *
     * non-safe vNode generator use private only
     * @static
     * @param {Any} args
     * @return {VNode}
     * @memberof VNode
     */
    static create(...args) {
        return new (this)(...args);
    }
}
/**
 *
 *
 * @export
 * @class Text
 * @extends {VNode}
 */
export class Text extends VNode {
    /**
     *Creates an instance of Text.
     * @param {string} [text='']
     * @memberof Text
     */
    constructor(text = '') {
        super({});
        this._data = text;
    }
    /**
     *
     * create Text Vnode Generate
     * @return {Text} dom pure text, not this class
     * @memberof Text
     */
    create() {
        return this.$ref = (window.document.createTextNode(this.data));
    }
    /**
     *
     * @param {VNode} old
     * @param {VNode} val
     * @memberof VNode
     * @return {Boolean}
     */
    compare(old, val) {
        return (old.data === val.data);
    }
    /**
     *
     *
     * @memberof Text
     */
    get data() {
        return this._data;
    }
    /**
     *
     * @param {String} value
     * @memberof Text
     */
    set data(value) {
        if (!this.static.compare(this._data, value)) {
            this._data = value;
            this.$ref.data = value;
        }
    }
    /**
     *type getter
     *
     * @readonly
     * @memberof Text
     */
    get type() {
        return V_NODE_TEXT;
    }
}
/**
 *
 *
 * @export
 * @class Element
 * @extends {VNode}
 */
export class Element extends VNode {
    /**
     *Creates an instance of Element.
     * @param {String} tagName
     * @param {...{String,Object}} {{text,...attributes}}
     * @param {VNode} children
     * @memberof Element
     */
    constructor(tagName, {text, events = {}, ...attributes}, ...children) {
        const entryEvent = Object.entries(events);
        const isHandler = entryEvent.every(([name, f]) => _isFunction(f));
        super(
            attributes,
            ...children.concat(new Text(text))
        );
        this.tagName = tagName;
        if (isHandler) {
            this.events = entryEvent;
        }
        // @TODO : proxy and mutatable handle
    }
    /**
     *
     *
     * @memberof Element
     */
    create() {
        const {tagName, attributes} = this;
        const $ref = domCache.get(tagName);
        for (const k in attributes) {
            // todo: 아에 attribute-set을 건너뛰는것도 방법이다 이말이야
            if (
                attributes.hasOwnProperty(k) &&
                $ref[k] !== attributes[k]
            ) {
                if (k in $ref) {
                    $ref[k] = attributes[k];
                } else {
                    $ref.setAttribute(k, attributes[k]);
                }
            }
        }
        for (const [name, handler] of this.events) {
            $ref.addEventListener(name, handler.bind(this));
        }
        this.$ref = $ref;
    }
    /**
     *
     * @param {VNode} oldNode
     * @param {VNode} newNode
     * @memberof VNode
     * @return {Boolean}
     */
    compare(oldNode, newNode) {
        return oldNode === newNode;
    }

    /**
     *type getter
    *
    * @readonly
    * @memberof Text
    */
    get type() {
        return V_NODE_TEXT;
    }
}
/**
 *
 *
 * @export
 * @class Fragment
 * @extends {VNode}
 */
export class Fragment extends VNode {
    /**
     *Creates an instance of Fragment.
     * @param {...VNode} children
     * @memberof Fragment
     */
    constructor(...children) {
        super(
            {},
            ...children
        );
    }
    /**
     *
     *
     * @memberof Fragment
     */
    create() {
        this.$ref = new DocumentFragment();
    }
    /**
     *
     *
     * @param {VNode} old
     * @param {VNode} val
     * @return {Boolean}
     * @memberof Fragment
     */
    compare(old, val) {
        return true;
    }
    /**
     *
     *
     * @readonly
     * @memberof Fragment
     */
    get type() {
        return V_NODE_FRAGMENT;
    }
}
