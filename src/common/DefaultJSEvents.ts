/**
 * Enum representing common native JavaScript DOM events.
 * Helps ensure consistency and avoid typos when using addEventListener.
 */
export enum DefaultJSEvents {
    /** Fired when a resource has finished loading. */
    Load = "load",

    /** Fired when the pointer enters the element. */
    Mouseenter = "mouseenter",

    /** Fired when the pointer leaves the element. */
    Mouseleave = "mouseleave",

    /** Fired when a pointing device button is pressed on an element. */
    Mousedown = "mousedown",

    /** Fired when the pointer is moving over an element. */
    Mousemove = "mousemove",

    /** Fired when a pointing device button is released over an element. */
    Mouseup = "mouseup",

    /** Fired when the pointer is moved onto an element or one of its children. */
    Mouseover = "mouseover",

    /** Fired when a key is released. */
    Keyup = "keyup",

    /** Fired when a key is pressed down. */
    Keydown = "keydown",

    /** Fired when an element loses focus. */
    Blur = "blur",

    /** Fired when the user starts a new text selection. */
    SelectStart = "selectstart",

    /** Fired when the text selection changes. */
    SelectionChange = "selectionchange",

    /** Fired when a pointing device button is clicked on an element. */
    Click = "click",

    /** Fired when an element is about to receive focus. */
    Focusin = "focusin",

    /** Fired when an element is about to lose focus. */
    Focusout = "focusout",

    /** Fired when the initial HTML document has been completely loaded and parsed. */
    DOMContentLoaded = "DOMContentLoaded",

    /** Fired when the value of an input, select, or textarea changes. */
    Input = "input",

    /** Fired when a pointing device button is clicked twice on an element. */
    DblClick = "dblclick", // Note: fixed from "BblClick"

    /** Fired when the user pastes content into an element. */
    Paste = "paste"
}