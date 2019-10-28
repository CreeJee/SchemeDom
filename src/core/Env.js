export const supports = {
    passive: false,
};
const bootstrap = ({supports}) => {
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get: () => {
                return supports.passive = true;
            },
        });
        window.addEventListener('__testPassive__', null, opts);
        window.removeEventListener('__testPassive__', null, opts);
    // eslint-disable-next-line no-empty
    } catch (e) {}
};
bootstrap({supports});
