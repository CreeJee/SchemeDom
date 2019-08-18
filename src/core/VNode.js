import { BaseComponent } from "./BaseComponent.js";
const DomCache = class DomCache{
    static get Instance(){
        return this._instance === undefined ? this._instance = new DomCache() : this._instance;
    }
    constructor(){
        this.cacheTable = new Map();
    }
    get(tagName){
        if(!this.cacheTable.has(tagName)){
            this.cacheTable.set(tagName,document.createElement(tagName));
        }
        return this.cacheTable.get(tagName).cloneNode(false)
    }
    
}

export const domCache = DomCache.Instance;
export const V_NODE_TEXT = Symbol("$$VNodeText");
export const V_NODE_ELEMENT = Symbol("$$VNodeElement");
export const V_NODE_FRAGMENT = Symbol("$$VNodeFragment");
export const V_NODE_COMPONENT = Symbol("$$VNodeComponent");
export const V_NODE_UNKNOWN = Symbol("$$VNodeUnknown");
const defaultMutation = function(parentNode,nth,created){
    const oldNode = parentNode.children[nth];
    const parentRef = parentNode.$ref;
    const selfRef = this.$ref;
    if(created){
        parentRef.appendChild(selfRef);
    }
    else if(this.type !== oldNode.type || !this.compare(oldNode,this)){
        let oldRef = parentRef.childNodes[nth];
        parentRef.insertBefore(selfRef,oldRef);
        oldRef.remove();
    }
    return this.$ref;
}
const _isCreateMode = ($vNode)=>$vNode.$ref === null;
export function generate(mountZone,$vNode){
    const isCreateMode = _isCreateMode($vNode);
    if(isCreateMode){
        $vNode.create(mountZone);
    }
    for(const [index,$childNode] of $vNode.children.entries()){
        generate($vNode.$ref,$childNode);
        //child가 createMode인것이 필요한건지 parent가 createMode인것이 필요한건지 불충분
        $childNode.mutation($vNode,index,isCreateMode);
    }
    if($vNode.parent === null){
        mountZone.appendChild($vNode.$ref);
    }
}
export class VNode{
    constructor({...attributes},...children){
        const childLen = children.length;
        this.attributes = attributes;
        this.children = children;
        this.parent = null;
        this.next = null;
        this.prev = null;
        for (let i = 0; i < childLen; i++) {
            children[i].parent = this;
            if(i > 0){
                children[i].prev = children[i-1];
            }
            if(i <= childLen-1){
                children[i].next = children[i+1];
            }
        }
        this.$ref = null;
        // getter와 setter를 이용하여 tree변경시 부분적으로 dom재어
    }
    create(parent){
        throw new Error("need implements [create]");
    }
    compare(old,val){
        throw new Error("need implements [compare]");
    }
    mutation(parent,nth,created){
        return defaultMutation.call(this,parent,nth,created);
    }
    //util
    get static(){
        return this.constructor;
    }
    get isRoot(){
        return this.parent === null;
    }
    get sliblings(){
        if(this.isRoot){
            return [this];
        }
        return this.parent.children;
    }
    //generic things
    static create(...args){
        return new (this)(...args);
    }
}
export class Text extends VNode {
    constructor(text = ""){
        super({});
        this._data = text;
    }
    create(){
        return this.$ref = (window.document.createTextNode(this.data));
    }
    compare(old,val){
        return (old.data === val.data);
    }
    get data(){
        return this._data;
    }
    set data(value){
        if(!this.static.compare(this._data,value)){
            this._data = value;
            this.$ref.data = value;
        }
    }
    get type(){
        return V_NODE_TEXT;
    }
}
export class Element extends VNode {
    constructor(tagName,{text,...attributes},...children){
        super(
            attributes,
            ...children.concat(new Text(text))
        );
        this.tagName = tagName;
    }
    create(){
        const {tagName,attributes} = this;
        const $ref = domCache.get(tagName);
        for(let k in attributes){
            // todo: 아에 attribute-set을 건너뛰는것도 방법이다 이말이야
            $ref.setAttribute(k,attributes[k]);
        }
        this.$ref = $ref;
    }
    compare(oldNode,newNode){
        return oldNode === newNode;
    }
    get type(){
        return V_NODE_TEXT;
    }
}
export class Fragment extends VNode {
    constructor(...children){
        super(
            {},
            ...children
        );
    }
    create(){
        this.$ref = new DocumentFragment();
    } 
    compare(old,val){
        return true;
    }
    get type(){
        return V_NODE_FRAGMENT;
    }
}
export class Component extends VNode {
    constructor(){
        
    }
    static render(){

    } 
    static compare(){
        return true;
    }
    get type(){
        return V_NODE_COMPONENT;
    }
}
export const _Custom = ({create,compare}) =>{
    return class extends VNode{ 
        constructor({...attributes},...children){
            super(attributes,...children)
        }
        create(...args){
            return create(...args);
        }
        comapre(...args){
            return compare(...args);
        }
    }
}