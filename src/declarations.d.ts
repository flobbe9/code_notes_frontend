/**
 * Fix typescript error "Cannot find module declarations for side-effect import .css"
 */
declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}

declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}