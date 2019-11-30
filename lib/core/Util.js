
export const _extractFragment = (content) => {
    return document.createRange().createContextualFragment(content);
};
export const _cloneTemplateStrings = (strings) => {
    const o = [...strings];
    Object.defineProperty(o, "raw", {
        writable: false, 
        enumerable: false, 
        configurable: false,
        // that solutions not looks so good
        // use only read
        value: [...strings.raw],
    })
    return o;
}
export const _clearDom = (mountDom) => {
    const range = document.createRange();
    range.selectNodeContents(mountDom);
    range.deleteContents();
};