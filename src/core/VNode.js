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

export const V_NODE_ELEMENT = Symbol("$$VNodeElement");
export const V_NODE_FRAGMENT = Symbol("$$VNodeFragment");
export const V_NODE_COMPONENT = Symbol("$$VNodeComponent");
export const V_NODE_UNKNOWN = Symbol("$$VNodeUnknown");

export const mutation = ({mountDom,$ref,index,isFirst = false})=>{
    let $old = null;
    if(isFirst){
        mountDom.appendChild($ref);
        return;
    }
    $old = mountDom.children[index];
    if($ref !== $old){
        mountDom.insertBefore($ref,$old);
        $old.remove();
    }
}
export class VNodeInterface{
    constructor(tag = "div",{text = "",...attributes},...children){
        const childLen = children.length;
        this.attributes = attributes;
        this.children = children; 
        this.text = text;
        this.origin = tag;
        this.parent = null;
        this.next = null;
        this.prev = null;
        this.type = (
            typeof tag === 'string' || tag instanceof HTMLElement ?
                V_NODE_ELEMENT :
                tag instanceof DocumentFragment ?
                    V_NODE_FRAGMENT :
                    tag instanceof BaseComponent ?
                        V_NODE_COMPONENT :
                        V_NODE_UNKNOWN
        );
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
    render(){
        throw new Error("need implements");
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
}
export class VNode extends VNodeInterface {
    constructor(tag,{text,...attributes} = {},...children){
        super(tag,{text,...attributes},...children);
    }
    static create(tag,{text,...attributes} = {},...children){
        return new VNode(tag,{text,...attributes},...children);
    }
    /**
    * 
    * @param mountDom 
    * @param index 
    * @param _lazyTask  
    * @return {Node}
    */
    render(mountDom,index = 0,{__task = []} = {}){
        const {origin,attributes,text,children,type} = this;
        const childLen = children.length;


        let {$ref} = this;
        let firstRender = $ref === null;
        
        //1. create $ref
        if(firstRender){
            switch(type){
                case V_NODE_ELEMENT:        
                    $ref = typeof origin === 'string' ? domCache.get(origin) : origin;
                    break;
                case V_NODE_UNKNOWN:
                    console.warn("unknown V_NODE_TYPE");
                    $ref = origin;
                    break;
                case V_NODE_FRAGMENT:
                    $ref = $ref === null ? origin : $ref;
                    break;
                case V_NODE_COMPONENT:
                    // (Component.render()).render()
                    // (Vnode).render()
                    const componentVNode = origin.render(VNode.create,Object.assign({text},attributes),...children); 
                    componentVNode.parent = this;
                    $ref = componentVNode.render(mountDom,index,{__task});
                    break;
            }
        }
        //2.render child (recursive)
        if(type !== V_NODE_COMPONENT && type !== V_NODE_UNKNOWN){
            if(type === V_NODE_ELEMENT && text !== $ref.textContent){
                this.text = text;
                $ref.textContent = text;
            }
            for(const k in attributes){
                if(attributes[k] !== $ref.attributes[k]){
                    $ref.setAttribute(k,attributes[k]);
                }
            }
            // TODO : VNode render optimize관련 최적화
            for (let k = 0; k < childLen; k++) {
                this.children[k].render($ref,k,{__task});
            }
        }
        if(type === V_NODE_FRAGMENT){
            __task.push([mutation,{mountDom,$ref,index,isFirst : firstRender}]);
        }
        else{
            mutation({mountDom,$ref,index,isFirst : firstRender});
        }
        //mutation $ref
        
        //slicing child
        //TODO : ???
        if(this.isRoot){
            for (let index = 0; index < __task.length; index++) {
                const [caller,...args] = __task[index];
                caller.apply(null,args);
            }
        }
        return (this.$ref = $ref);
    }
}
export const _Node = VNode.create;
export const fragment = (...children)=>VNode.create(document.createDocumentFragment(),{},...children)