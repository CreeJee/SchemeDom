//@ts-check
import {Effect} from './Effect.js';
import {Cell} from './Cell.js'
import {error} from './Log.js';
import {toReactive, addListener} from './Reactive.js';
// utils
const __isSlotRegex = />+\s{0,}$/g;
const __compressBlinkRegex = /\s{2,}/g;


const _extractFragment = (content) => {
    return document.createRange().createContextualFragment(content);
};
// const _clearDom = (mountDom) => {
//     const range = document.createRange();
//     range.selectNodeContents(mountDom);
//     range.deleteContents();
// };
const attributeEffect = (attributes, attributeName) => (value, oldValue, effect) => {
    oldValue = oldValue ? oldValue : Effect.mark(effect.uid);
    const attribute = attributes[attributeName];
    attribute.value = attribute.value.replace(oldValue, value);
};

const unsafeTextFragmentEffect = ($ref) => (value, oldValue, effect) => {
    if (Array.isArray(oldValue)) {
        for (const node of oldValue) {
            node.remove();
        }
    }
    value = Array.isArray(value) ? value : [value];
    if (value.every((v)=> v instanceof Node)) {
        // fragmentMode
        const fragment = document.createDocumentFragment();
        for (const slot of value) {
            fragment.appendChild(slot);
        }
        value = fragment;
    } else {
        value = _extractFragment(value.join(''));
    }
    effect._forceSet(Array.from(value.childNodes));
    $ref.appendChild(value);
};
const _invokeAttach = (groupRef, uid, findEffect) => {
    if (!isNaN(uid)) {
        const effect = Effect.get(uid);
        const attachFunctor = findEffect(effect);
        attachFunctor(effect.value, undefined, effect);
        effect.attach(attachFunctor);
        groupRef.push(uid);
    }
};

const bindWalker = (_walker, mutationGroup, boundFunctor) => {
    let _nextNode = null;
    while (_nextNode = _walker.nextNode()) {
        boundFunctor(_walker, _nextNode, mutationGroup);
    }
};
const attributeBound = (_walker, _nextNode, mutationGroup) => {
    // 지금은 attribute를 전체스캔, 차후최적화예정
    const {attributes} = _nextNode;
    const attributeSize = attributes.length;
    for (let index = 0; index < attributeSize; index++) {
        const {name, value} = attributes[index];
        const group = (
            name === 'class' ?
                value.split(' ').map((value) => Effect.unMark(value)) :
                [Effect.unMark(value)]
        );
        for (const uid of group) {
            _invokeAttach(
                mutationGroup,
                uid,
                () => {
                    return attributeEffect(attributes, name);
                }
            );
        }
    }
};
const textBound = (_walker, _nextNode, mutationGroup) => {
    let expr = _nextNode.nodeValue.replace(/[\r\n\s]+/g, '');
    const group = Effect.unMarkGroup(expr);
    for (const uid of group) {
        expr = expr.replace(Effect.mark(uid), '');
        _nextNode.nodeValue = expr;
        _invokeAttach(
            mutationGroup,
            uid,
            (effect) => {
                return unsafeTextFragmentEffect(_nextNode.parentNode);
            }
        );
    }
};
export const create = (templateGroup, ...mutationVariable) => {
    const mutationSize = mutationVariable.length;
    const cell = new Cell();
    let prefixAccr = '';
    for (let nth = 0; nth < mutationSize; nth++) {
        let prefix = templateGroup[nth].replace(__compressBlinkRegex,'');
        let variable = mutationVariable[nth];
        prefixAccr += prefix;
        if (Array.isArray(variable) ? variable.every(Cell[Symbol.hasInstance]) : variable instanceof Cell) {
            variable = [].concat(variable);
            if (prefixAccr.match(__isSlotRegex)) {
                cell.slots.push({
                    position: prefixAccr.length,
                    slots: variable
                });
            } else {
                throw error(`attribute in Dom Node is not support [near : ${prefixAccr}]`);
            }
        } else {
            const effect = Effect.generate(variable);
            cell.effects.push(effect);
            variable = effect;
        }
        prefixAccr += variable;
    }
    cell.templateProps = [templateGroup, mutationVariable];
    return cell;
};
export const bind = (node) => {
    const element = node.$ref;
    const mutationGroup = [];
    const attributeWalker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
    );
    const textWalker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    requestAnimationFrame(()=>{
        bindWalker(textWalker, mutationGroup, textBound);
        bindWalker(attributeWalker, mutationGroup, attributeBound);
    });
    element.group.push(...mutationGroup);
    element.fragment.push(...element.childNodes);
    return element;
};
// TODO : rename update to 'createUpdater'
export const update = (createdNode) => (unusedGroup, ...mutationGroup) => {
    const prevGroup = createdNode.group;
    const createdSize = prevGroup.length;
    if (createdSize !== mutationGroup.length) {
        throw error('Non accessable mutation dected');
    }
    for (let index = 0; index < createdSize; index++) {
        Effect.get(prevGroup[index]).notify(mutationGroup[index]);
    }
};
export const remove = (createdNode) => {
    const {group, fragment} = createdNode;
    let len = -1;
    if (!Array.isArray(group)) {
        throw error('first argument is not View');
    }
    len = group.length;
    for (let index = 0; index < len; index++) {
        Effect.get(group[index]).remove();
    }
    for (const node of fragment) {
        node.remove();
    }
    createdNode.remove();
};
export const bound = (templateGroup, ...mutationVariable) => {
    return bind(create(templateGroup, ...mutationVariable));
};
export const generate = (obj, renderCall) => {
    let $ref = null;
    // gc 에 대한 대책필요
    addListener(
        toReactive(obj),
        () => requestAnimationFrame(() => renderCall(update($ref)))
    );
    return ($ref = renderCall(create));
};
