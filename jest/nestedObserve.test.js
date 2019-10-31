import State from '../lib/State.js';
import {VNode} from '../index.js';
const {create, bind, update, remove, Effect} = VNode;


const $zone = document.body;
let result = '';
test('create render', () => {
    $zone.append(create`<span></span>`);
    result = $zone.innerHTML;
    $zone.innerHTML = '';
    expect(result).toEqual('<span></span>');
});
test('update render', (done) => {
    const $ref = bind(create`<span>${''}</span>`);
    const $$updater = update($ref);
    $zone.appendChild($ref);
    $$updater`<span>${'yellow'}</span>`;
    result = $zone.innerHTML;
    $zone.innerHTML = '';
    expect(result).toEqual('<span>yellow</span>');
    done();
});
test('children render', (done) => {
    const $ref = bind(create`<ul><li></li></ul>`);
    $zone.appendChild($ref);
    result = $zone.innerHTML;
    $zone.innerHTML = '';
    expect(result).toEqual('<ul><li></li></ul>');
    done();
});
test('nested child observe render', (done) => {
    const $ref = bind(create`<ul>${[]}</ul>`);
    const mockState = new State({list: []});
    const $$updater = update($ref);
    $zone.appendChild($ref);
    mockState.set({list: [1, 2, 3, 4]});
    $$updater`<ul>${mockState.list.map((v)=>bind(create`<li>${v}</li>`))}</ul>`;
    result = $zone.innerHTML;
    $zone.innerHTML = '';
    expect(result).toEqual('<ul><li>1</li><li>2</li><li>3</li><li>4</li></ul>');
    done();
});
test('nested child observe double render', (done) => {
    const $ref = bind(create`<ul>${[]}</ul>`);
    const mockState = new State({list: []});
    const $$updater = update($ref);
    $zone.appendChild($ref);
    mockState.set({list: [1, 2, 3, 4]});
    $$updater`<ul>${mockState.list.map((v)=>bind(create`<li>${v}</li>`))}</ul>`;
    mockState.set({list: [1, 2]});
    $$updater`<ul>${mockState.list.map((v)=>bind(create`<li>${v}</li>`))}</ul>`;
    mockState.set({list: [1]});
    $$updater`<ul>${mockState.list.map((v)=>bind(create`<li>${v}</li>`))}</ul>`;
    result = $zone.innerHTML;
    $zone.innerHTML = '';
    expect(result).toEqual('<ul><li>1</li></ul>');
    done();
});
test('nested coponent on effect', (done) => {
    const $$createChild = (k)=>bind(create`<span>${k}</span>`);
    const $ref = bind(create`
        <p>
            ${[1, 2].map($$createChild)}
            ${[3, 4].map($$createChild)}
        </p>
    `);
    $zone.appendChild($ref);
    result = $zone.innerHTML;
    $zone.innerHTML = '';
    expect(result.replace(/[\n\r\s]/g, ''))
        .toEqual(
            `<p><span>1</span><span>2</span><span>3</span><span>4</span></p>`
        );
    done();
});
test('created node remove', () => {
    const $ref = bind(create`<span></span>`);
    $zone.append($ref);
    remove($ref);
    result = $zone.innerHTML;
    expect(result).toEqual('');
});
test('low level observe on Effect', () => {
    const $ref = bind(create`<p>${1}</p>`);
    $zone.append($ref);
    Effect.get(Effect.watch.length-1).notify(100);
    result = $zone.innerHTML;
    expect(result).toEqual('<p>100</p>');
});
