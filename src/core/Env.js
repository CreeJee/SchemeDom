export const supports = {
    passive: false,
};
const bootstrap = ({supports}) => {
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supports.passive = true;
            }
        });
        window.addEventListener("__testPassive__", null, opts);
        window.removeEventListener("__testPassive__", null, opts);
    } catch (e) {}
}
bootstrap({supports});