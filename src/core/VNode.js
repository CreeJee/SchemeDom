import * as ENV from './Env.js';

/**
 * vNode attribute 및 bind값 처리법
 * 보기중 선택
 *
 * 1.vNode에 hook[VNodeType][innerType] = [handlerList] 로 추가 후
 * props를 observe해서 외부에서 변경시 mutation처리
 */
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
const defaultMutation = function($vNode, $oldNode) {
    const $parentVNode = $vNode.parent;
    let parentRef = $parentVNode.$ref;
    if ($oldNode === null) { //createMode
        parentRef.appendChild($vNode.$ref);
    } else { //modify
        if($parentVNode.children.includes($oldNode) && $oldNode.$ref.isConnected){
            parentRef.insertBefore($vNode.$ref, $oldNode.$ref);
        } else {
            parentRef.appendChild($vNode.$ref);
        }
        $oldNode.destory();
    }
    return $vNode.$ref;
};
const _isFunction = (v) => typeof v === 'function';
const __isSameCond = (o1, o2, k) => o1[k] === o2[k];
const __isEntryFunction = ([k, v]) => _isFunction(v);
const _isSameObject = (o1, o2, handler = __isSameCond)=>{
    if (o1 === o2) {
        return true;
    }
    const k1 = Object.keys(o1);
    const k2 = Object.keys(o2);
    return k1.length && k2.length && k1.every(handler.bind(null, o1, o2));
};
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
export function generate(mountZone, $vNode, $oldNode = null) {
    // fast ref compare vs stringify
    const isCachedMode = $oldNode !== null && $vNode.type === $oldNode.type && $oldNode.compare($vNode);
    
    const $children = $vNode.children;
    const $childLen = $children.length;
    if (isCachedMode) {
        $vNode.clone($oldNode);
    } else {
        $vNode.create();
    }
    for (let index = 0; index < $childLen; index++) {
        const $childNode = $children[index];
        const $oldChildNode = $oldNode instanceof VNode && $oldNode.children.length > index ? $oldNode.children[index] : null;
        generate($vNode.$ref, $childNode, $oldChildNode);
    }
    if($vNode.parent !== null){
        $vNode.mutation($oldNode);
    } else {
        if($oldNode !== null){
            $oldNode.destory();
        }
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
    constructor(attributes = {}, ...children) {
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
            if (i < childLen-1) {
                children[i].next = children[i+1];
            }
        }
        this.$ref = null;
        // getter와 setter를 이용하여 tree변경시 부분적으로 dom재어
    }
    /**
     *
     * @throws {String} need implements
     * @memberof VNode
     */
    create() {
        throw new Error('need implements [create]');
    }
    /**
     * 
     * @param {VNode} old 
     */
    clone(vNode) {
        this.create();
    }
    /**
     *
     * @param {VNode} old
     * @throws {String} need implements
     * @memberof VNode
     */
    compare(old) {
        throw new Error('need implements [compare]');
    }
    /**
     * @param {VNode} oldNode
     * @param {Object} config
     * @return {Element}
     * @memberof VNode
     */
    mutation(oldNode) {
        return defaultMutation.call(null, this, oldNode);
    }
    /**
     * static util
     * @readonly
     * @memberof VNode
     */
    get static() {
        return this.constructor;
    }
    /**
     * static util
     * @readonly
     * @memberof VNode
     */
    get isRoot() {
        return this.parent === null;
    }
    /**
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
     * non-safe vNode generator use private only
     * @static
     * @param {Any} args
     * @return {VNode}
     * @memberof VNode
     */
    static create(...args) {
        return new (this)(...args);
    }
    /**
     *
     * @memberof VNode
     */
    destory() {
        if(this.prev){
            this.prev.next = this.next;
        }
        if(this.next){
            this.next.prev = this.prev;
        }
        this.attributes = {};
        this.children = [];
        this.parent = null;
        this.next = null;
        this.prev = null;
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
    constructor(tagName, attributes, ...children) {
        const events = attributes.events || {};
        const entryEvent = Object.entries(events);
        const isHandler = entryEvent.every(__isEntryFunction);
        super(
            attributes,
            ...children
        );
        this.tagName = tagName;
        this.text = attributes.text;
        this.tagName = tagName;
        if (isHandler) {
            this.events = entryEvent;
        }
        
        delete attributes.text;
        delete attributes.events;
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
                    // 좀 비용비싼대 뺄까?
                    $ref.setAttribute(k, attributes[k]);
                }
            }
        }
        for (const [name, handler] of this.events) {
            $ref.addEventListener(
                name, 
                handler.bind(this), 
                ENV.supports.passive ? { capture: false, passive: true } : false
            );
        }
        if(this.text !== undefined){
            $ref.appendChild(document.createTextNode(this.text))
        }
        this.$ref = $ref;
    }
    clone(vNode){
        this.$ref = vNode.$ref.cloneNode(false);
    }
    /**
     *
     * @param {VNode} newNode
     * @memberof VNode
     * @return {Boolean}
     */
    compare(newNode) {
        return (
            this.tagName === newNode.tagName &&
            this.text === newNode.text &&
            _isSameObject(this.attributes, newNode.attributes)
        );
    }

    /**
    * type getter
    *
    * @readonly
    * @memberof Text
    */
    get type() {
        return V_NODE_ELEMENT;
    }
    /**
     *
     * @memberof VNode
     */
    destory() {
        super.destory();
        this.$ref.remove();
    }
}
export let _fragmentCount = -1;
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
        this.uid = (++_fragmentCount);
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
     * @param {VNode} newNode
     * @memberof VNode
     * @return {Boolean}
     */
    compare(newNode) {
        return false;
        // debugger;
        // return this.uid === newNode.uid;
        // return (
        //     _isSameObject(this.children) &&
        // );
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
