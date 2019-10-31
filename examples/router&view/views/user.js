import {Component} from '../../../lib/Component.js';
/**
 * User page Component
 */
export default class User extends Component {
    /**
     * @param {VNode.create} u
     * @return {DocumentFragment}
     */
    render(u) {
        return u`
            <nav>
                <ul>
                    <li><a href="./a">main</a></li>
                </ul>   
            </nav>
            <h1>user</h1>
        `;
    }
}
