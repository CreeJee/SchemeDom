import {FixedType} from './FixedType.js';

const isElementOrComponent = (v)=>(
    v instanceof HTMLElement ||
    v instanceof BaseComponent
);
const componentToDom = (o,mountZone) => {
    let el = o.render(
        elementGenerator.bind(o),
        o.$props,
        ...o.$slots
    )
    if(mountZone instanceof HTMLElement){
        o.$zone = mountZone;
    }
    o.$ref = el instanceof BaseComponent ? componentToDom(el,mountZone) : el ;
    return o.$ref;
}
const clearDom = (mountDom)=>mountDom.innerHTML = "";
const renderDom = (mountDom,el)=>{
    let isComponent = el instanceof BaseComponent;
    if(isComponent){
        el.$zone = mountDom;
        el.$ref = componentToDom(el,mountDom);
    }
    mountDom.appendChild(isComponent ? el.$ref : el);
}
const elementGenerator = (tag, attributes, ...children) => {
    const isBaseCond = attributes instanceof Object && children.every(isElementOrComponent);
    if (typeof tag === 'string' && isBaseCond) {
        const el = document.createElement(tag);
        const {text,...attr} = attributes;
        const entryAttr = Object.entries(attr);
        if(text !== undefined){
            el.textContent = text;
        }
        for (let index = 0; index < entryAttr.length; index++) {
            const [k,v] = entryAttr[index];
            el.setAttribute(k,v);
        }
        for (let index = 0; index < children.length; index++) {
            renderDom(el,children[index]);
        }
        return el;
    } else if(tag instanceof BaseComponent && isBaseCond) {
        tag.$props = attributes;
        tag.$slots = children;
        return componentToDom(tag);
        if(children.every(v=>v instanceof BaseComponent)){
            debugger;
        }
    } else {
        throw new Error(
            'arguments must [[String|BaseComponent],Object,...[HTMLElement|BaseComponent]'
        );
    }
};


const BaseComponent = class baseComponent {
    /**
     * Base Component
     */
    constructor({...props} = {}) {
        this.$ref = null;
        this.$zone = null;
        this.$props = props;
        this.$children = [];
        this.$slots = [];
    }
    /**
     * render
     * @param {elementGenerator} h
     * @param {State} props
     * @param {Element} slots
     * @throws {Error} need implements
     */
    render(h = elementGenerator.bind(this), props = this.$props, slots = this.$slots) {
        throw new Error(`"need implements ${this.constructor.name}.action`);
    }

    /**
     * @description if mutation is not defined just re render
     * @param {State} props
     * @param {Element} slots
     * @return {Element}
     */
    mutation(props, slots) {
        clearDom(this.$zone);
        return renderDom(this.$zone,this);
    }
};
/**
* @param {Function} Parent
* @return {Element}
*/
class Component extends BaseComponent {
    /**
     * Element constructor
     * @description on init default tag generate
     */
    constructor(props) {
        super(props);
    }
    /**
     * @param {HTMLElement} mountDom
     * @param {Component} component
     */
    static async mount(mountDom, component) {
        // render ref logic
        clearDom(mountDom);
        renderDom(mountDom,component);
        return this;
    }
}
Component.mount = FixedType.expect(
    Component.mount,
    FixedType.instanceof(HTMLElement),
    FixedType.instanceof(BaseComponent)
);

export default Component;
export {
    Component,
    BaseComponent
};
