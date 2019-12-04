
export const _extractFragment = (content) => {
    // return document.createRange().createContextualFragment(content);
    const o = document.createElement('template');
    o.innerHTML= content;
    return o.content;
};
export const _cloneTemplateStrings = (strings) => {
    const o = [...strings];
    Object.defineProperty(o, 'raw', {
        writable: false,
        enumerable: false,
        configurable: false,
        // that solutions not looks so good
        // use only read
        value: [...strings.raw],
    });
    return o;
};
export const _clearDom = (mountDom) => {
    const range = document.createRange();
    range.selectNodeContents(mountDom);
    range.deleteContents();
};
export const _propertySwap = (now, next) => {
    // now instanceof next.constructor 
    // next instanceof now.constructor

    // 어떤걸 골라야할지 알아맞추어 보세요
    if (now.constructor === next.constructor) {
        for (const key in now) {
            if (now.hasOwnProperty(key)) {
                [now[key], next[key]] = [next[key], now[key]];
            }
        }
    }
}