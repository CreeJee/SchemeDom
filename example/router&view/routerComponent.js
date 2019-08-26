import {State} from '../../src/State.js';
import {ObserveComponent} from '../../src/ObserveComponent.js';
import Component from '../../src/Component.js';
// TODO: route match;
export const $state = new State({path: '/', routes: []});

/**
 * Router Class
 */
export class RouterComponent extends ObserveComponent {
    /**
     * default route path
     * @param {String} path
     */
    constructor() {
        super($state);
    }
    /**
     * @param {Function} u Component.elementGenerator
     * @param {Object} props
     * @param  {...Any} children
     * @return {HTMLElement}
     */
    render(u, {$currentView, ...props}, ...children) {
        return ($currentView instanceof Component) ?
            $currentView.render(u, props, ...children) :
            u('span', {text: 404}, ...children);
    }
    /**
     * @param {Object} props
     */
    async deliveredProps(props) {
        let path = this.$state.path;
        if (typeof path !== 'string' || path[0] !== '/') {
            throw new Error('path contains root path');
        } else if (path === undefined) {
            path = '/index';
        }
        const ViewConstruct = (await import(`./views${path}.js`)).default;
        return {$currentView: new ViewConstruct(props)};
    }
    /**
     * router push
     *
     * @param {*} path
     * @memberof RouterComponent
     */
    push(path) {
        this.$state.set({path});
    }
    /**
     * redirect push
     *
     * @param {*} path
     * @memberof RouterComponent
     */
    redirect(path) {
        this.$state.put({path});
    }
}
