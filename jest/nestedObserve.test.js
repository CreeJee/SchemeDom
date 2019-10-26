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
        return u`<span></span>`;
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
        return u`<span>${this.$state.text}</span>`;
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
        return u`<ul><li></li></ul>`;
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
        return u`<ul>${childState.map((i)=>`<li>${i}</li>`)}</ul>`;
        // return u('ul', {},
        //     ...childState.map((i)=>u('li', {text: i}))
        // );
    }
}
test('element render', () => {
    const o = new ComponentMock();
    Component.mount(document.body, o);
    expect(document.body.innerHTML).toEqual('<span></span>');
    document.body.innerHTML = '';
});

test('nested observe render', (done) => {
    const $mockState = new State();
    const o = new ObserveMock($mockState);
    Component.mount(document.body, o);
    $mockState.set({text: 'yellow'});
    expect(document.body.innerHTML).toEqual('<span>yellow</span>');
    document.body.innerHTML = '';
    done();
});
test('children render', ()=>{
    const o = new ChildrenMock();
    Component.mount(document.body, o);
    expect(document.body.innerHTML).toEqual('<ul><li></li></ul>');
    document.body.innerHTML = '';
});

test('nested child observe render', (done) => {
    const $mockState = new State({list: []});
    const o = new ObserveChildMock($mockState);
    Component.mount(document.body, o);
    $mockState.set({list: [1, 2, 3, 4]});
    expect(document.body.innerHTML)
        .toEqual('<ul><li>1</li><li>2</li><li>3</li><li>4</li></ul>');
    document.body.innerHTML = '';
    done();
});
test('nested child observe double render', (done) => {
    const $mockState = new State({list: []});
    const o = new ObserveChildMock($mockState);
    Component.mount(document.body, o);
    $mockState.set({list: [1, 2, 3, 4]});
    $mockState.set({list: [1, 2]});
    expect(document.body.innerHTML)
        .toEqual('<ul><li>1</li><li>2</li></ul>');
    document.body.innerHTML = '';
    done();
});
