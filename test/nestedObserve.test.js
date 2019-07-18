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
class ObserveChildMock extends ObserveComponent {
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
        const childState = this.$state.list;
        if (!Array.isArray(childState)) {
            throw new Error('need $state.list');
        }
        return u('ul', {},
            ...childState.map((i)=>u('li', {text: i}))
        );
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
        console.log(o);
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

test('nested child observe render', (done) => {
    const o = new ObserveChildMock($mockState);
    $mockState.set({list: [1, 2, 3, 4]});
    Component.mount(document.body, o);
    setTimeout(()=>{
        expect(document.body.innerHTML)
            .toEqual('<ul><li>1</li><li>2</li><li>3</li><li>4</li></ul>');
        document.body.innerHTML = '';
        done();
    }, 1000);
});
test('nested child observe double render', (done) => {
    const o = new ObserveChildMock($mockState);
    $mockState.set({list: [1, 2, 3, 4]});
    Component.mount(document.body, o);
    $mockState.set({list: [1, 2]});
    setTimeout(()=>{
        expect(document.body.innerHTML)
            .toEqual('<ul><li>1</li><li>2</li></ul>');
        document.body.innerHTML = '';
        done();
    }, 1000);
});
