import {State} from '../../src/State.js';
import {ObserveComponent} from '../../src/ObserveComponent.js';
import Component from '../../src/Component.js';

export const $state = new State({path: '/'});
/**
 * Router Class
 */
export class RouterComponent extends ObserveComponent {
    /**
     * default route path
     * @param {String} path
     */
    constructor(path) {
        if (!path) {
            throw new TypeError('path is must string');
        }
        window.setTimeout($state.set.bind($state, {path}));
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
        return {$currentView: new ViewConstruct()};
    }
}
