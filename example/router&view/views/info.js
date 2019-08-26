
import {Component} from '../../../src/Component.js';
/**
 * User page Component
 */
export default class Info extends Component {
    /**
     * @param {Component.fragment} u
     * @return {VNode}
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
            u('h1', {text: 'info'})
        );
    }
}
