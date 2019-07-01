export const Fragment = (...child)=>{
    const parent = document.createDocumentFragment();
    child.forEach((n) => parent.append(n));
    return parent;
};
export default Fragment;
