export const Fragment = (...child)=>{
    const parent = document.createDocumentFragment();
    parent.appendChild(...child);
    return parent;
}
export default Fragment;