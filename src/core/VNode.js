import {BaseComponent} from './BaseComponent.js';
export const V_NODE_ELEMENT = Symbol("$$VNodeElement");
export const V_NODE_FRAGMENT = Symbol("$$VNodeFragment");
export const V_NODE_COMPONENT = Symbol("$$VNodeComponent");
export const V_NODE_UNKNOWN = Symbol("$$VNodeUnknown");
export class VNodeInterface{
    constructor(tag = "div",{text = "",...attributes},...children){
        this.attributes = attributes;
        this.children = children; 
        this.text = text;
        this.origin = tag;
        this.type = (
            typeof tag === 'string' ?
                V_NODE_ELEMENT :
                tag instanceof DocumentFragment ?
                    V_NODE_FRAGMENT :
                    tag instanceof BaseComponent ?
                        V_NODE_COMPONENT :
                        V_NODE_UNKNOWN
        );
        this.$ref = null;
    }
    render(){
        throw new Error("need implements");
    }
}
export class VNode extends VNodeInterface {
    constructor(tag,{text,...attributes} = {},...children){
        super(tag,{text,...attributes},...children);
    }
    static create(tag,{text,...attributes} = {},...children){
        return new VNode(tag,{text,...attributes},...children);
    }
    render(mountDom){
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
                    $ref.appendChild(document.createTextNode(text))
                }
                for(const [k,v] of Object.entries(attributes)){
                    if(v !== $ref.attributes[k]){
                        $ref.setAttribute(k,v);
                    }
                }
                mountDom = $ref;
                break;
            case V_NODE_UNKNOWN:
                console.warn("unknown V_NODE_TYPE")
            case V_NODE_FRAGMENT:
                $ref = origin;
                break;
            case V_NODE_COMPONENT:
                // (Component.render()).render()
                // (Vnode).render()
                $ref = origin.render(VNode.create,{text,...attributes},...children).render(mountDom);
                break;
        }
        this.$ref = $ref;
        if(type !== V_NODE_COMPONENT && type !== V_NODE_UNKNOWN){
            // TODO : VNode render optimize관련 최적화
            for (let k = 0; k < childLen; k++) {
                const oldNode = mountDom.children[k];
                const newVirtual = children[k];
                const newNode = newVirtual.$ref === null ? newVirtual.render($ref) : newVirtual.$ref;
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
        return $ref;
    }
    clone(){
        return new VNode(tag,{text: this.text ,...this.attributes},...this.children);
    }
}
export const _Node = VNode.create;
export const fragment = (...child)=>{
    return VNode.create(document.createDocumentFragment(),{},...child);
};