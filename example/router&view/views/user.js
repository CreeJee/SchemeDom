import Component from '../../../src/Component.js';
import fragment from '../../../src/Fragment.js';
/**
 * User page Component
 */
export default class User extends Component {
    /**
     * @param {Component.elementGenerator} u
     * @return {HTMLElement|DocumentFragment}
     */
    render(u) {
        return fragment(
            u('nav', {},
                u('ul', {},
                    u('li', {},
                        u('a', {text: 'main', href: './a'})
                    )
                )
            ),
            u('h1', {text: 'userPage'})
        );
    }
}
