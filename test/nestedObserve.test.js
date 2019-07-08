import ObserveComponent from '../src/ObserveComponent.js';
import Component from '../src/Component.js';
import State from '../src/State.js';
/**
 * o;
 */
class ComponentMock extends Component {
    /**
     * mock render
     * @param {elementGeneractor} u
     * @return {HTMLElement|DocumentFragment}
     */
    render(u) {
        return u('span', {});
    }
}
/**
 * mock observeClass
 */
class ObserveMock extends ObserveComponent {
    /**
     * @param {State} $state
     */
    constructor($state) {
        super($state);
    }
    /**
     * mock observe render
     * @param {elementGeneractor} u
     * @return {HTMLElement|DocumentFragment}
     */
    render(u) {
        return u('span', {text: this.$state.text});
    }
}
/**
 * class
 */
class ChildrenMock extends Component {
    /**
     * @param {elementGeneractor} u
     * @return {HTMLElement}
     */
    render(u) {
        return u('ul', {},
            u('li', {})
        );
    }
}
/**
 * test 4
 */
class observeChildMock extends ObserveComponent {
    /**
     * @param {State} $state
     */
    constructor($state) {
        super($state);
    }
    /**
     * mock observe render
     * @param {elementGeneractor} u
     * @return {HTMLElement|DocumentFragment}
     */
    render(u) {
        return u('span', {text: this.$state.text});
    }
}
const $mockState = new State();
test('element render', () => {
    const o = new ComponentMock();
    Component.mount(document.body, o);
    expect(document.body.innerHTML).toEqual('<span></span>');
    document.body.innerHTML = '';
});

test('nested observe render', (done) => {
    const o = new ObserveMock($mockState);
    Component.mount(document.body, o);
    $mockState.set({text: 'yellow'});

    setTimeout(()=>{
        expect(document.body.innerHTML).toEqual('<span>yellow</span>');
        document.body.innerHTML = '';
        done();
    }, 1000);
});
test('children render', ()=>{
    const o = new ChildrenMock();
    Component.mount(document.body, o);
    expect(document.body.innerHTML).toEqual('<ul><li></li></ul>');
    document.body.innerHTML = '';
});
