import { ElementFactoryService } from "@/services/element-factory/ElementFactoryService";
import { BaseUIComponent } from "../common/BaseUIComponent";
import { CustomEvents } from "@/common/CustomEvents";
import { Commands } from "@/commands/Commands";
import { ICommandEventDetail } from "@/commands/ICommandEventDetail";
import { DependencyContainer } from "@/core/DependencyContainer";
import { IQuickMenu } from "../quick-menu/IQuickMenu";
import { IShortcutListeners } from "@/core/IShortcutListeners";
import { ITableListeners } from "@/core/listeners/ITableListeners";
import { ITableContextFloatingToolbar } from "../floating-toolbar/ITableContextFloatingToolbar";
import { DOMUtils } from "@/utilities/DOMUtils";
import { TableUtils } from "@/utilities/TableUtils";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { KeyboardKeys } from "@/common/KeyboardKeys";
import { Utils } from "@/utilities/Utils";

export class Content extends BaseUIComponent {


    quickMenu: IQuickMenu;
    tableToolbar: ITableContextFloatingToolbar;
    contentWrapper: HTMLElement | null = null;

    constructor() {

        super({});

        this.quickMenu = DependencyContainer.Instance.resolve<IQuickMenu>("IQuickMenu");
        this.tableToolbar = DependencyContainer.Instance.resolve<ITableContextFloatingToolbar>("ITableContextFloatingToolbar");

        this.attachEvent();
    }

    init(): HTMLElement {

        const htmlElement = document.createElement("div");
        htmlElement.classList.add("content");

        htmlElement.style.marginTop = "1.3rem";

        if (window.editorConfig?.includeFirstParagraph || true) {
            htmlElement.append(ElementFactoryService.blockParagraph());
        }

        return htmlElement;
    }

    clearSelectionOnDrag() {
        document.addEventListener(DefaultJSEvents.Mousedown, (event) => {
            const element = event.target as HTMLElement;
            let parent: Element | null;

            if (element) {
                if (element.nodeType == Node.TEXT_NODE) {
                    parent = element.parentElement;
                } else {
                    parent = element;
                }

                if (parent && parent.closest(".drag-handler")) {
                    window.getSelection()?.removeAllRanges();
                }
            }
        });
    }

    // Allow multi-block selection 
    handleSelectionChange = () => {
        if (!this.contentWrapper) {
            this.contentWrapper = document.querySelector("#johannesEditor .content-wrapper");
        }

        const selection = document.getSelection();

        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            if (this.contentWrapper && this.contentWrapper.getAttribute("contenteditable") !== "true") {
                const anchorNode = selection.anchorNode;
                const anchorOffset = selection.anchorOffset;
                const focusNode = selection.focusNode;
                const focusOffset = selection.focusOffset;

                this.contentWrapper.setAttribute("contenteditable", "true");

                setTimeout(() => {
                    const newSelection = document.getSelection();
                    if (newSelection) {
                        newSelection.removeAllRanges();
                        newSelection.setBaseAndExtent(anchorNode!, anchorOffset, focusNode!, focusOffset);
                    }
                }, 0);
            }
        } else {
            if (this.contentWrapper && this.contentWrapper.getAttribute("contenteditable") === "true") {
                this.contentWrapper.removeAttribute("contenteditable");
            }
        }
    };

    attachEvent(): void {

        this.clearSelectionOnDrag();
        this.reRenderPlaceholder();

        document.addEventListener('click', (event) => {
            const target = event.target as HTMLInputElement;

            if (target && target.type === 'checkbox' && target.closest('.list-item-checkable')) {
                const listItem = target.closest('.list-item-checkable');
                const contentDiv = listItem?.querySelector('.editable') as HTMLDivElement;

                if (target.checked) {
                    contentDiv?.classList.add('checked');
                    target.classList.add('checked');
                } else {
                    contentDiv?.classList.remove('checked');
                    target.classList.remove('checked');
                }
            }
        });

        document.addEventListener(DefaultJSEvents.SelectionChange, this.handleSelectionChange, true);

        document.addEventListener(DefaultJSEvents.Click, (event: MouseEvent) => {
            const previousSelected = document.querySelectorAll('.separator-selected');

            previousSelected.forEach(selected => {
                selected.classList.remove('separator-selected');
                selected.removeAttribute('tabindex');
            });

            let currentElement = event.target as HTMLElement;

            if (currentElement && currentElement.closest(".separator-wrapper")) {

                event.stopImmediatePropagation();
                event.preventDefault();

                let parentBlock = currentElement.closest('.separator-wrapper') as HTMLElement;
                if (parentBlock) {
                    parentBlock.classList.add('separator-selected');
                    parentBlock.setAttribute('tabindex', '-1');

                    setTimeout(() => {
                        parentBlock.focus();
                    }, 50);
                }
            }

        });

        document.addEventListener(DefaultJSEvents.Blur, (event: FocusEvent) => {
            const target = event.target as Node;

            if (target instanceof HTMLElement && target.closest('.separator-selected')) {

                event.stopImmediatePropagation();
                const separator = target.closest('.separator-selected')!;

                separator.classList.remove('separator-selected');
                separator.removeAttribute('tabindex');
            }
        }, true);

        document.addEventListener("copiedText", () => {
            const copyElementItem = document.querySelector("#copyOption .text-option span") as HTMLSpanElement;
            if (copyElementItem) {

                copyElementItem.textContent = "Copied!";

                setTimeout(() => {
                    copyElementItem.textContent = "Copy";
                }, 1500);
            }
        });

        window.addEventListener("load", () => {
            const editor = document.querySelector('.johannes-editor');

            if (editor) {
                let blocks = editor.querySelectorAll('.block');

                if (blocks.length == 1) {

                    const p = blocks[0].querySelector('.johannes-content-element') as HTMLElement;
                    if (p.innerText == '') {
                        p.focus();
                    }
                }
            }
        });

        document.addEventListener(DefaultJSEvents.Keydown, (event: KeyboardEvent) => {
            if (event.key !== KeyboardKeys.Enter) {
                return;
            }

            if (event.key === KeyboardKeys.Enter && !event.shiftKey && DOMUtils.isEventTargetDescendantOf(event, "#johannesEditor .content-wrapper .title")) {
                event.preventDefault();
                document.dispatchEvent(new CustomEvent(CustomEvents.pressedEnterOnTitle, {}));
            }
        }, true);

        document.addEventListener(DefaultJSEvents.Keydown, async (event) => {

            if (
                event.key !== KeyboardKeys.Enter &&
                event.key !== KeyboardKeys.Backspace &&
                event.key !== KeyboardKeys.Delete &&
                event.key !== KeyboardKeys.Tab
            ) {
                return;
            }

            if (DOMUtils.isEventTargetDescendantOf(event, ".ignore-events") && event.key !== 'Tab') {
                return;
            }

            if (event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            if (event.key === KeyboardKeys.Enter && !event.shiftKey && !this.quickMenu.isVisible && !this.tableToolbar.isVisible) {

                event.preventDefault();

                const tableController = (event.target as Element).closest(".table-controller");
                if (tableController) {
                    const activeCell = (event.target as Element).closest("td, th") as HTMLTableCellElement;
                    const table = tableController.querySelector("table") as HTMLTableElement;
                    if (activeCell) {

                        const focusedBelow = TableUtils.moveFocusToBelowCell(table, activeCell);
                        if (!focusedBelow) {

                            document.dispatchEvent(new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                                detail: {
                                    command: Commands.focusOnNextBlock,
                                }
                            }));
                        }
                    }

                    return;
                }

                if ((event.target as Element).closest(".johannes-code")) {
                    return;
                }

                // Create a default block when press Enter
                event.preventDefault();
                event.stopImmediatePropagation();

                document.dispatchEvent(new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                    detail: {
                        command: Commands.insertNew,
                    }
                }));

            } else if (event.key === KeyboardKeys.Backspace) {
                const target = event.target as HTMLElement;

                if (target.classList.contains('separator-wrapper')) {

                    event.stopImmediatePropagation();

                    document.dispatchEvent(new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                        detail: {
                            command: Commands.deleteBlockAndFocusOnPrevious,
                        }
                    }));
                } else if (target.closest(".johannes-content-element") && target.textContent?.trim() === '') {

                    event.stopImmediatePropagation();

                    document.dispatchEvent(new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                        detail: {
                            command: Commands.deleteBlockAndFocusOnPrevious,
                        }
                    }));

                } else if (target.closest('.johannes-content-element') && target.textContent?.trim() !== '') {

                    const { atStart, atEnd } = DOMUtils.getSelectionTextInfo(target);
                    const selectedContent = document.getSelection()?.toString();

                    if (atStart && selectedContent?.length == 0) {

                        event.preventDefault();
                        event.stopImmediatePropagation();

                        document.dispatchEvent(new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                            detail: {
                                command: Commands.mergeWithPreviousBlock,
                            }
                        }));
                    }
                }

            } else if (event.key === KeyboardKeys.Delete) {
                const target = event.target as HTMLElement;

                if (target.classList.contains('separator-wrapper')) {

                    event.stopImmediatePropagation();

                    document.dispatchEvent(new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                        detail: {
                            command: Commands.deleteBlockAndFocusOnNext,
                        }
                    }));
                } else if (target.classList.contains('johannes-content-element') && target.textContent?.trim() === '') {
                    event.stopImmediatePropagation();

                    document.dispatchEvent(new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                        detail: {
                            command: Commands.deleteBlockAndFocusOnNext,
                        }
                    }));
                } else if (target.closest('.johannes-content-element') && target.textContent?.trim() !== '') {

                    const { atStart, atEnd } = DOMUtils.getSelectionTextInfo(target);
                    const selectedContent = document.getSelection()?.toString();

                    if (atEnd && selectedContent?.length == 0) {

                        event.preventDefault();
                        event.stopImmediatePropagation();

                        document.dispatchEvent(new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                            detail: {
                                command: Commands.mergeWithNextBlock,
                            }
                        }));
                    }
                }
            } else if (event.key === KeyboardKeys.Tab) {

                if (DOMUtils.isEventTargetDescendantOf(event, ".johannes-code")) {
                    event.preventDefault();
                    const tabCharacter = '\u00a0\u00a0\u00a0\u00a0';

                    const selection = document.getSelection();
                    if (!selection) return;

                    // Remove current selection
                    if (!selection.isCollapsed) {
                        selection.deleteFromDocument();
                    }

                    const range = selection.getRangeAt(0);
                    const textNode = document.createTextNode(tabCharacter);
                    range.insertNode(textNode);

                    // Move o cursor após o texto inserido
                    range.setStartAfter(textNode);
                    range.setEndAfter(textNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        });

        document.addEventListener(DefaultJSEvents.Blur, (event: Event) => this.sanitizeElementEventHandler(event), true)
    }

    sanitizeElementEventHandler(event: Event): void {
        const target = event.target as HTMLElement;

        if (target instanceof HTMLElement && target.contentEditable === "true") {
            DOMUtils.sanitizeContentEditable(target);
        }
    }

    reRenderPlaceholder() {
        document.addEventListener(DefaultJSEvents.Input, function (event: Event) {
            if (event.target instanceof HTMLElement) {
                const editableElement = event.target;

                if (!Utils.isEventFromContentWrapper(event)) {
                    return;
                }

                if (editableElement.isContentEditable) {
                    if (editableElement.hasAttribute('data-placeholder')) {
                        const customPlaceholder = editableElement.getAttribute('data-placeholder');

                        if (editableElement.textContent?.trim() === '') {
                            editableElement.setAttribute('data-placeholder', customPlaceholder || '');
                            editableElement.textContent = '';
                        }
                    }
                }
            }
        });
    }

    static isCursorAtEnd(target: HTMLElement): boolean {
        const focusableParent = target.closest('.focusable');
        if (!focusableParent) return false;

        const selection = window.getSelection()!;
        if (!selection.rangeCount) return false;

        const range = selection.getRangeAt(0);
        let endNode: Node | null = range.endContainer;
        if (endNode.nodeType === Node.TEXT_NODE) {
            endNode = endNode.parentNode;
        }
        return range.collapsed && endNode === focusableParent && range.endOffset === (range.endContainer.textContent || '').length;
    }

    static isCursorAtStart(target: HTMLElement): boolean {
        const focusableParent = target.closest('.focusable');
        if (!focusableParent) return false;

        const selection = window.getSelection()!;
        if (!selection.rangeCount) return false;

        const range = selection.getRangeAt(0);

        let startNode: Node | null = range.startContainer;
        if (startNode.nodeType === Node.TEXT_NODE) {
            startNode = startNode.parentNode;
        }
        return range.collapsed && startNode === focusableParent && range.startOffset === 0;
    }

    static isAtFirstVisibleLine(element: HTMLElement) {
        const selection = window.getSelection()!;
        if (!selection.rangeCount) return false;
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(true);
        range.setStart(element, 0);
        const rangeTop = range.getBoundingClientRect().top;
        const elementTop = element.getBoundingClientRect().top;

        return rangeTop === elementTop;
    }

    static isAtLastVisibleLine(element: HTMLElement) {
        const selection = window.getSelection()!;
        if (!selection.rangeCount) return false;
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(false);
        range.setEnd(element, element.childNodes.length);
        const rangeBottom = range.getBoundingClientRect().bottom;
        const elementBottom = element.getBoundingClientRect().bottom;

        return rangeBottom === elementBottom;
    }

    static didCursorMove(event: KeyboardEvent): Promise<boolean> {
        const selection = window.getSelection()!;
        if (!selection.rangeCount) return Promise.resolve(false);

        const originalRange = selection.getRangeAt(0).cloneRange();
        const originalRect = originalRange.getBoundingClientRect();

        return new Promise<boolean>(resolve => {
            setTimeout(() => {
                const newRange = selection.getRangeAt(0).cloneRange();
                const newRect = newRange.getBoundingClientRect();

                const didMove = !(originalRect.top === newRect.top && originalRect.left === newRect.left);
                if (!didMove) {
                    event.preventDefault();
                }
                resolve(didMove);
            }, 0);
        });
    }

    static isCursorOnFirstLine(): boolean {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return false;

        const range = selection.getRangeAt(0);

        return range.startOffset === 0 && range.startContainer === range.commonAncestorContainer;
    }

    static isCursorOnLastLine(): boolean {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return false;

        const range = selection.getRangeAt(0);

        return range.endOffset === range.endContainer.textContent?.length && range.endContainer === range.commonAncestorContainer;
    }

    static getInstance(): Content {

        const shortcutListener = DependencyContainer.Instance.resolve<IShortcutListeners>("IShortcutListeners");
        const tableListeners = DependencyContainer.Instance.resolve<ITableListeners>("ITableListeners");
        return new Content();
    }
}