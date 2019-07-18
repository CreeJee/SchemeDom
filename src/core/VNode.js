import {BaseComponent} from './BaseComponent.js';
export const V_NODE_ELEMENT = Symbol("$$VNodeElement");
export const V_NODE_FRAGMENT = Symbol("$$VNodeFragment");
export const V_NODE_COMPONENT = Symbol("$$VNodeComponent");
export const V_NODE_UNKNOWN = Symbol("$$VNodeUnknown");
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
            typeof tag === 'string' ?
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
    render(mountDom,index = 0){
        const {origin,attributes,text,children,type} = this;
        const childLen = children.length;
        let {$ref} = this;
        let spliceLen = mountDom.childElementCount - childLen;
        spliceLen = spliceLen >= 0 ? spliceLen : 0;
        switch(type){
            case V_NODE_ELEMENT:        
                $ref = typeof origin === 'string' ? document.createElement(origin) : origin;
                if(this.text !== $ref.textContent){
                    this.text = text;
                    $ref.textContent = text;
                }
                if(typeof attributes === 'object' && attributes !== null && attributes !== {}){
                    for(const [k,v] of Object.entries(attributes)){
                        if(v !== $ref.attributes[k]){
                            $ref.setAttribute(k,v);
                        }
                    }
                }
                mountDom = $ref;
                break;
            case V_NODE_UNKNOWN:
                console.warn("unknown V_NODE_TYPE");
                ref = origin;
                break;
            case V_NODE_FRAGMENT:
                $ref = $ref === null ? origin : fragment(...children).render(mountDom,index);
                break;
            case V_NODE_COMPONENT:
                // (Component.render()).render()
                // (Vnode).render()
                $ref = origin.render(VNode.create,{text,...attributes},...children).render(mountDom,index);
                break;
        }
        if(type === V_NODE_FRAGMENT){
            // 이경우 quque task 하나를 만들고서 root까지 도달후 부분적으로 나머지를 이어버리는걸로 처리
            mountDom.appendChild($ref);
        }
        else if(type !== V_NODE_COMPONENT && type !== V_NODE_UNKNOWN && childLen > 0){
            // TODO : VNode render optimize관련 최적화
            for (let k = 0; k < childLen; k++) {
                const oldNode = mountDom.children[k];
                const newVirtual = children[k];
                const newNode = (
                    newVirtual.$ref === null ? newVirtual.render($ref,k) : newVirtual.$ref
                );
                if(oldNode === newNode){
                    continue;
                }
                if(!!oldNode && oldNode !== newNode){
                    mountDom.insertBefore(newNode,oldNode);
                    oldNode.remove();
                }
                else{
                    mountDom.appendChild(newNode);
                }
            }
        }
        return (this.$ref = $ref);
    }
}
export const _Node = VNode.create;
export const fragment = (...child)=>{
    const o = document.createDocumentFragment();
    const childSize = child.length;
    for (let index = 0; index < childSize; index++) {
        o.appendChild(child[index].render(o));
    }    
    return VNode.create(o,{},...child);
};