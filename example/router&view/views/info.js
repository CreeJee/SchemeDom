
import {Component} from '../../../src/Component.js';
/**
 * Info page Component
 */
export default class Info extends Component {
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
            <h1>info</h1>
        `;
    }
}
