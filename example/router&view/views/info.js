
import {Component} from '../../../src/Component.js';
/**
 * Info page Component
 */
export default class Info extends Component {
    /**
     * @param {Component.elementGenerator} u
     * @return {HTMLElement|DocumentFragment}
     */
    render(u) {
        return Component.fragment(
            u('nav', {},
                u('ul', {},
                    u('li', {},
                        u('a', {text: 'main', href: './a'})
                    )
                )
            ),
            u('h1', {text: 'test'})
        );
    }
}
