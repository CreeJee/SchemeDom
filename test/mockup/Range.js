global.Range = function Range() { };
const {JSDOM} = require('jsdom');

const createContextualFragment = (html) => {
    return JSDOM.fragment(html);
};
Range.prototype.createContextualFragment = (
    (html) => createContextualFragment(html)
);

if (global.document) {
    document.createRange = () => ({
        setStart: () => {},
        setEnd: () => {},
        getBoundingClientRect: () => {
            return {right: 0};
        },
        getClientRects: () => [],
        commonAncestorContainer: {
            nodeName: 'BODY',
            ownerDocument: document,
        },
        createContextualFragment,
    });
}
