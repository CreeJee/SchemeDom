// @ts-check
'use-strict';
import {Effect} from './Effect.js';
import {Cell} from './Cell.js';
import {error} from './Log.js';
import {_extractFragment, _cloneTemplateStrings} from './Util.js';
import {toReactive, addListener} from './Reactive.js';
// utils
export const __slotAttributeName = 'slot-uid';

const __isTagEndRegex = />+\s{0,}$/g;
const __compressBlinkRegex = /\x20{2,}|[\n\v\f\r]{1,}/g;
const __markedSlotRegex = new RegExp(`${__slotAttributeName}="([0-9]+)"`, 'g');

const __markSlotAttr = (prefix, nth) => {
    const startPos = prefix.lastIndexOf('>');
    return `${prefix.slice(0, startPos)} ${__slotAttributeName}="${nth}"${prefix.slice(startPos)}`;
};
const __getMarkedSlot = (prefix) => {
    const result = __markedSlotRegex.exec(prefix);
    return !result ? null : result[1];
};
// logic utils

const attributeEffect = (attributes, attributeName) => (value, oldValue, effect) => {
    const attribute = attributes[attributeName];
    oldValue = oldValue ? oldValue : Effect.mark(effect.uid);
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
const _invokeAttach = (uid, findEffect) => {
    if (!isNaN(uid)) {
        const effect = Effect.get(uid);
        const attachFunctor = findEffect(effect);
        attachFunctor(effect.value, undefined, effect);
        effect.attach(attachFunctor);
    }
};
const bindWalker = (_walker, element, boundFunctor) => {
    let _nextNode = null;
    while (_nextNode = _walker.nextNode()) {
        boundFunctor(_walker, _nextNode, element);
    }
};
const attributeBound = (_walker, _nextNode, element) => {
    // 지금은 attribute를 전체스캔, 차후최적화예정
    // nextNode가 self인것이 필요할경우 그경우는 어떻게 해야할지 고민이 필요할듯
    // ㅅㅂ
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
                uid,
                () => {
                    return attributeEffect(attributes, name);
                }
            );
        }
    }
};
const textBound = (_walker, _nextNode, element) => {
    let expr = _nextNode.nodeValue.replace(/[\r\n\s]+/g, '');
    const group = Effect.unMarkGroup(expr);
    for (const uid of group) {
        expr = expr.replace(Effect.mark(uid), '');
        _nextNode.nodeValue = expr;
        _invokeAttach(
            uid,
            (effect) => {
                return unsafeTextFragmentEffect(_nextNode.parentNode);
            }
        );
    }
};
/**
 * @param {Array<String>} templates
 * @param  {TemplateStringsArray} mutationVariable //template liternals
 * @return {Cell}
 */
export const create = (templates, ...mutationVariable) => {
    const templateGroup = _cloneTemplateStrings(templates);
    const mutationSize = mutationVariable.length;
    const cell = new Cell();
    let prefixAccr = '';
    for (let nth = 0; nth < mutationSize; nth++) {
        let prefix = templateGroup[nth].replace(__compressBlinkRegex, '');
        let variable = mutationVariable[nth];
        let currentPrefix = '';
        let markedPrefix = '';

        if (Array.isArray(variable) ? variable.every(Cell[Symbol.hasInstance].bind(Cell)) : variable instanceof Cell) {
            variable = [].concat(variable);
            currentPrefix = prefixAccr.concat(prefix);
            if (currentPrefix.match(__isTagEndRegex)) {
                markedPrefix = __getMarkedSlot(currentPrefix);
                if (markedPrefix === null) {
                    templateGroup.raw[nth] = __markSlotAttr(prefix, nth);
                    prefix = templateGroup[nth] = __markSlotAttr(prefix, nth);
                    markedPrefix = nth;
                }
                cell.slots[markedPrefix] = (Array.isArray(cell.slots[markedPrefix]) ? cell.slots[markedPrefix] : []).concat(variable);
                variable = '';
            } else {
                throw error(`attribute in Dom Node is not support [near : ${prefixAccr}]`);
            }
        } else {
            const effect = Effect.generate(variable);
            cell.effects.push(effect);
            variable = effect;
        }
        mutationVariable[nth] = variable;

        prefixAccr += ''.concat(prefix, variable);
    }
    cell.templateProps = [templateGroup, mutationVariable];
    return cell;
};
export const bind = (element) => {
    const wrappedFragment = document.createDocumentFragment();
    wrappedFragment.appendChild(element);
    const attributeWalker = document.createTreeWalker(
        wrappedFragment,
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
    bindWalker(textWalker, element, textBound);
    bindWalker(attributeWalker, element, attributeBound);
    // element.group.push(...mutationGroup);
    // element.fragment.push(...element.childNodes);
    return element;
};
// TODO : rename update to 'createUpdater'
export const update = (createdNode) => (unusedGroup, ...mutationGroup) => {
    // maybe legacy mutation model is not need :)


    // const prevGroup = createdNode.group;
    // const createdSize = prevGroup.length;
    // if (createdSize !== mutationGroup.length) {
    //     throw error('Non accessable mutation dected');
    // }
    // for (let index = 0; index < createdSize; index++) {
    //     Effect.get(prevGroup[index]).notify(mutationGroup[index]);
    // }
};
export const remove = (createdNode) => {
    createdNode.remove();
};
export const bound = (templateGroup, ...mutationVariable) => {
    return bind(create(templateGroup, ...mutationVariable));
};
export const generate = (obj, renderCall) => {
    obj = toReactive(obj);
    // gc 에 대한 대책필요
    addListener(
        obj,
        () => requestAnimationFrame(() => renderCall(update(obj.$ref)))
    );
    return (obj.$ref = renderCall(create));
};
/**
 * @param {HTMLElement} zone
 * @param {Cell} cell
 */
export const mount = (zone, cell) => {
    zone.appendChild(cell.$ref);
};
