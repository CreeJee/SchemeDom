import { Component } from "../../src/Component.js";
import { State } from "../../src/State.js";
import { ObserveComponent } from "../../src/ObserveComponent.js";

export const $state = new State({path : "/"});
export class RouterComponent extends ObserveComponent{
    constructor(path){
        if(!path){
            throw new TypeError("path is must string")
        }
        setTimeout($state.set.bind($state,{path}),0)
        super($state);
    }
    isUpdated(){
        // if router was changed or other issue
        return super.isUpdated();
    }
    render(u,props,...children){
        return u("span",{text : 404},...children);
    }
    /**
     * 
     * @param {String} path 
     */
    async deliveredProps(props) {
        let path = this.$state.get("path");
        if(typeof path !== "string" || path[0] !== "/"){
           throw new Error("path contains root path"); 
        }
        else if(path === undefined){
            path = "/index";
        }
        return {$currentView : await import(`./views${path}.js`)}
    }
}