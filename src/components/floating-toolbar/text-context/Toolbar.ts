import { DOMUtils } from "@/utilities/DOMUtils";
import { FloatingToolbarBase } from "../base/FloatingToolbarBase";
import { ZIndex } from "@/common/ZIndex";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { EventEmitter } from "@/commands/EventEmitter";
import { ITextOperationsService } from "@/services/text-operations/ITextOperationsService";
import { DependencyContainer } from "@/core/DependencyContainer";
import { Colors } from "@/common/Colors";
import { ButtonIDs } from "@/core/ButtonIDs";
import { KeyboardKeys } from "@/common/KeyboardKeys";
import { Utils } from "@/utilities/Utils";
import { FloatingToolbarCssClass } from "../base/FloatingToolbarCssClass";
import { CommonClasses } from "@/common/CommonClasses";

/**
 * Floating toolbar component for text context operations.
 * 
 * This singleton toolbar appears near selected text and provides
 * formatting options like bold, italic, underline, color changes, etc.
 * 
 * It is context-aware and hides/shows itself based on selection state.
 * 
 * Use `Toolbar.getInstance()` to access the instance.
 */
export class Toolbar extends FloatingToolbarBase {

    private static id: string = "textFloatingToolbar";
    private static instance: Toolbar;
    private textOperationsService: ITextOperationsService;
    private initialRect: DOMRect | null = null;

    private moreTextOptions: HTMLElement | null = null;
    private turnIntoOptions: HTMLElement | null = null;
    private turnIntoSeparator: HTMLElement | null = null;
    private inlineCodeButton: HTMLElement | null = null;
    private inlineFormulaButton: HTMLElement | null = null;
    private linkButton: HTMLElement | null = null;
    private textOperationsSeparator: HTMLElement | null = null;

    private lockedHide = false;
    debounceTimer: any = null;

    private constructor(textOperationsService: ITextOperationsService) {

        if (Toolbar.instance) {
            throw new Error("Use TextContextFloatingToolbar.getInstance() to get instance.");
        }

        super(Toolbar.id);

        this.htmlElement.style.zIndex = ZIndex.VeryImportant;
        this.textOperationsService = textOperationsService;

        this.attachEvents();
    }

    /**
    * Returns the singleton instance of the `Toolbar`.
    * 
    * @returns {Toolbar} The singleton instance.
    */
    static getInstance(): Toolbar {

        const textOperationsService = DependencyContainer.Instance.resolve<ITextOperationsService>("ITextOperationsService");;

        if (!Toolbar.instance) {
            Toolbar.instance = new Toolbar(textOperationsService);
        }

        return Toolbar.instance;
    }

    /**
    * Updates toolbar buttons' active states based on the current text selection.
    */
    processSelectionChangeEffects() {

        this.checkMultipleBlocksSelection();

        EventEmitter.emitResetActiveButtonsElementEvent("hiliteColor");
        EventEmitter.emitResetActiveButtonsElementEvent("foreColor");

        const isLink: boolean = this.textOperationsService.queryCommandState('createLink');
        const isBold: boolean = this.textOperationsService.queryCommandState('bold');
        const isItalic: boolean = this.textOperationsService.queryCommandState('italic');
        const isUnderline: boolean = this.textOperationsService.queryCommandState('underline');
        const isInlineCode: boolean = this.textOperationsService.queryCommandState("inlineCode");
        const isStrikeThrough: boolean = this.textOperationsService.queryCommandState('strikeThrough');

        const hiliteColors: { [key: string]: boolean } = {};
        hiliteColors[Colors.HiliteColorRed] = this.textOperationsService.queryHiliteColor(Colors.HiliteColorRed);
        hiliteColors[Colors.HiliteColorGreen] = this.textOperationsService.queryHiliteColor(Colors.HiliteColorGreen);
        hiliteColors[Colors.HiliteColorBlue] = this.textOperationsService.queryHiliteColor(Colors.HiliteColorBlue);
        hiliteColors[Colors.HiliteColorYellow] = this.textOperationsService.queryHiliteColor(Colors.HiliteColorYellow);
        hiliteColors[Colors.HiliteColorGrey] = this.textOperationsService.queryHiliteColor(Colors.HiliteColorGrey);

        const foreColors: { [key: string]: boolean } = {};
        foreColors[Colors.ForeColorRed] = this.textOperationsService.queryForeColor(Colors.ForeColorRed);
        foreColors[Colors.ForeColorGreen] = this.textOperationsService.queryForeColor(Colors.ForeColorGreen);
        foreColors[Colors.ForeColorBlue] = this.textOperationsService.queryForeColor(Colors.ForeColorBlue);
        foreColors[Colors.ForeColorYellow] = this.textOperationsService.queryForeColor(Colors.ForeColorYellow);
        foreColors[Colors.ForeColorGrey] = this.textOperationsService.queryForeColor(Colors.ForeColorGrey);

        Object.entries(hiliteColors).forEach(([color, active]) => {
            if (active) {
                EventEmitter.emitShowHideActiveElementEvent("hiliteColor", color, "show");
            }
        });

        Object.entries(foreColors).forEach(([color, active]) => {
            if (active) {
                EventEmitter.emitShowHideActiveElementEvent("foreColor", color, "show");
            }
        });

        this.emitChangeComponentColorEvent(isLink, ButtonIDs.Link);
        this.emitChangeComponentColorEvent(isBold, ButtonIDs.Bold);
        this.emitChangeComponentColorEvent(isItalic, ButtonIDs.Italic);
        this.emitChangeComponentColorEvent(isInlineCode, ButtonIDs.InlineCode);
        this.emitChangeComponentColorEvent(isUnderline, ButtonIDs.Underline);
        this.emitChangeComponentColorEvent(isStrikeThrough, ButtonIDs.Strikethrough);
    }

    /**
    * Checks if the current selection includes multiple `.block` elements
    * and hides or shows UI parts accordingly.
    */
    private checkMultipleBlocksSelection() {
        const selection = window.getSelection();

        if (!selection) {
            return null;
        }

        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const blockElements = range.cloneContents().querySelectorAll(".".concat(CommonClasses.Block ));

        if (!this.moreTextOptions) {
            this.moreTextOptions = document.querySelector("#moreTextOptionButton");
        }

        if (!this.turnIntoOptions) {
            this.turnIntoOptions = document.querySelector("#turnIntoButton");
        }

        if (!this.inlineCodeButton) {
            this.inlineCodeButton = document.querySelector("#inlineCodeButton");
        }

        if (!this.inlineFormulaButton) {
            this.inlineFormulaButton = document.querySelector("#inlineFormulaButton");
        }

        if (!this.linkButton) {
            this.linkButton = document.querySelector("#linkButton");
        }        

        if (!this.turnIntoSeparator) {
            this.turnIntoSeparator = document.querySelector("#turnIntoSeparator");
        }    

        if (!this.textOperationsSeparator) {
            this.textOperationsSeparator = document.querySelector("#textOperationsSeparator");
        }

        if (blockElements.length > 1) {

            this.moreTextOptions!.style.display = "none";
            this.linkButton!.style.display = "none";
            this.turnIntoOptions!.style.display = "none";
            this.turnIntoSeparator!.style.display = "none";
            this.inlineCodeButton!.style.display = "none";
            this.inlineFormulaButton!.style.display = "none";
            this.textOperationsSeparator!.style.display = "none";

        } else {
            this.moreTextOptions!.style.display = "flex";
            this.linkButton!.style.display = "flex";
            this.turnIntoOptions!.style.display = "flex";
            this.turnIntoSeparator!.style.display = "flex";
            this.inlineCodeButton!.style.display = "flex";
            this.inlineFormulaButton!.style.display = "flex";
            this.textOperationsSeparator!.style.display = "flex";
        }
    }

    private emitChangeComponentColorEvent(active: boolean, targetId: string) {
        if (active) {
            EventEmitter.emitChangeComponentColorEvent(targetId, Colors.IconActiveBlue);
        } else {
            EventEmitter.emitChangeComponentColorEvent(targetId, Colors.IconDefaultBlack);
        }
    }

    processAfterChange(event: Event): void {
        const selection = document.getSelection();
        if (selection && !selection.isCollapsed) {
            const now = Date.now();
            if (now - this.textOperationsService.lastDropdownColorChangeTime > 900) {
                this.processSelectionChangeEffects();
            }
        }
    }

    attachEvents(): void {

        let debouncedProcessAfterChange = this.debounce(this.processAfterChange.bind(this), 20);

        let isSelecting = false;
        let debounceTimer: any;

        this.htmlElement.addEventListener(DefaultJSEvents.Mouseup, (event) => { event.preventDefault(); });

        document.addEventListener(DefaultJSEvents.Mouseup, debouncedProcessAfterChange);
        document.addEventListener(DefaultJSEvents.DblClick, debouncedProcessAfterChange);
        document.addEventListener(DefaultJSEvents.SelectionChange, debouncedProcessAfterChange);

        document.addEventListener(DefaultJSEvents.Keydown, (event) => {

            if (!Utils.isEventFromContentWrapper(event)) {
                return;
            }

            if (event.shiftKey) {
                isSelecting = true;
            }
        });

        document.addEventListener(DefaultJSEvents.Keyup, (event) => {

            if (!Utils.isEventFromContentWrapper(event)) {
                return;
            }

            if (event.key === KeyboardKeys.Shift) {
                isSelecting = false;
                this.showHide(event, isSelecting);
            }
        });

        document.addEventListener(DefaultJSEvents.Mousedown, () => {
            isSelecting = true;
        });

        document.addEventListener(DefaultJSEvents.Mouseup, (event) => {
            
            isSelecting = false;
            this.showHide(event, isSelecting);

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                isSelecting = false;
                this.showHide(event, isSelecting);
            }, 100);
        });

        document.addEventListener(DefaultJSEvents.SelectionChange, (event) => {
            this.showHide(event, isSelecting);
        });


        document.addEventListener(DefaultJSEvents.Keydown, (event) => {
            if (event.key !== KeyboardKeys.Escape) return;

            if (!Utils.isEventFromContentWrapper(event)) {
                return;
            }

            setTimeout(() => {
                if (this.canHide && (event.key === KeyboardKeys.Escape) && !this.lockedHide) {
                    if (this.anyDropdownVisible()) {
                        this.hideAllDropdownVisible();
                    } else {
                        this.hide();
                    }
                }
            }, 10);
        });

        super.attachEvents();
    }

    debounce(func: Function, wait: number) {
        let timeout: number | null = null;
        return (...args: any[]) => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = window.setTimeout(() => {
                timeout = null; // Reset the timeout
                func.apply(this, args);
            }, wait);
        };
    }

    shouldUpdatePosition(): boolean {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return false;

        const currentRect = selection.getRangeAt(0).getBoundingClientRect();
        if (!this.initialRect) return true;

        const positionChanged = Math.abs(currentRect.left - this.initialRect.left) > 10 || Math.abs(currentRect.top - this.initialRect.top) > 10;
        return positionChanged;
    }

    showHide(event: Event, isSelecting: boolean) {

        //This block checks for an active selection and whether it contains any content.
        // In Firefox, the `selectionchange` event may be fired even while typing,
        // which is not the intended trigger since we only want to react to actual changes in selection.
        // If the selection is empty or null, the function returns early, effectively ignoring
        // these unwanted `selectionchange` events during typing.

        const hasContent = this.hasSelection();

        if (!hasContent) {

            if (this.lockedHide) {
                return;
            }

            this.hide();
            this.initialRect = null;
            return;
        } else if (hasContent && !isSelecting) {
            if (!this.isVisible) {

                if (!this.canShowFloatingToolbar()) {
                    return;
                }
                this.show();
            } else if (this.shouldUpdatePosition()) {

                if (!this.canShowFloatingToolbar()) {
                    return;
                }
            }
        }
    }

    private canShowFloatingToolbar(): boolean {
        const hasContent = this.hasSelection();
    
        if (!hasContent) return false;
    
        const inIgnoredContext =
            DOMUtils.isSelectedTextDescendantOf(".".concat(FloatingToolbarCssClass.IgnoreTextContextFloatingToolbar)) ||
            DOMUtils.isSelectedTextDescendantOf(".".concat(FloatingToolbarCssClass.Gist))
    
        return !inIgnoredContext;
    }

    hasSelection(): boolean {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const selectedText = selection.toString().trim();
            if (selectedText !== '') {
                const range = selection.getRangeAt(0);
                let container: Node | null = range.commonAncestorContainer;
                if (container.nodeType !== Node.ELEMENT_NODE) {
                    container = container.parentNode;
                }

                return this.isDescendant(document.getElementById('johannesEditor'), container as Node);
            }
        }
        return false;
    }

    isDescendant(parent: Element | null, child: Node): boolean {
        if (!parent) return false;
        let node = child.parentNode;
        while (node != null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    changeToolbarPositionToBeClosedToSelection(): void {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            console.error('No selection found');
            return;
        }

        this.currentSelectionRange = selection.getRangeAt(0);
        const rects = this.currentSelectionRange.getClientRects();

        if (rects.length === 0) {
            // console.error('No rects found');
            return;
        }

        const firstRect = rects[0];

        const c_firstRectLeft = firstRect.left;
        const c_firstRectTop = firstRect.top;
        const c_firstRectBottom = firstRect.bottom;

        this.htmlElement.style.display = 'flex';

        const elementWidth = this.htmlElement.offsetWidth;
        let leftPosition = c_firstRectLeft + window.scrollX - 50;

        if (leftPosition + elementWidth > window.innerWidth) {
            leftPosition = window.innerWidth - elementWidth - 20;
        }

        const elementHeight = this.htmlElement.offsetHeight;
        let topPosition = c_firstRectTop + window.scrollY - elementHeight - 10;

        if (topPosition < 0) {
            topPosition = c_firstRectBottom + window.scrollY + 10;
        }

        this.htmlElement.style.left = `${leftPosition}px`;
        this.htmlElement.style.top = `${topPosition}px`;
    }

    /**
    * Shows the toolbar near the current text selection.
    */
    show(): void {

        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            console.error('No selection found');
            return;
        }

        if (DOMUtils.findClosestAncestorOfActiveElementByClass(CommonClasses.IgnoreTextFloatingToolbar)) {
            return;
        };

        this.changeToolbarPositionToBeClosedToSelection();
        this.hideTurnInto();
        this.hideMoreOptions();

    }

    /**
    * Hides the toolbar if it's allowed to hide.
    */
    hideTurnInto(): void {
        const shouldHide = this.isSelectionWithinElementWithClass("hide-turninto");

        this.dropdowns.forEach(dropdown => {
            if (dropdown.id === "turnIntoMenu") {
                dropdown.htmlElement.style.display = shouldHide ? "none" : "flex";
            }
        });

        this.separators.forEach(separator => {
            if (separator.id === "turnIntoSeparator") {
                separator.htmlElement.style.display = shouldHide ? "none" : "flex";
            }
        });
    }

    hideMoreOptions(): void {
        const shouldHide = this.isSelectionWithinElementWithClass("hide-moreoptions");

        this.dropdowns.forEach(dropdown => {
            if (dropdown.id === "moreTextOptionsMenu") {
                dropdown.htmlElement.style.display = shouldHide ? "none" : this.display;
            }
        });

        this.separators.forEach(separator => {
            if (separator.id === "textOperationsSeparator") {
                separator.htmlElement.style.display = shouldHide ? "none" : this.display;
            }
        });
    }

    isSelectionWithinElementWithClass(className: string): boolean {
        const selection = window.getSelection();
        if (selection?.rangeCount === 0) return false;

        let node: null | Node | undefined = selection?.getRangeAt(0).commonAncestorContainer;
        if (node && node.nodeType !== Node.ELEMENT_NODE) {
            node = node.parentNode;
        }

        while (node != null) {
            if (node instanceof HTMLElement && node.classList.contains(className)) {
                return true;
            }
            node = node.parentNode;
        }

        return false;
    }

    updatePosition(): void {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            this.setPosition(rect);
        }
    }

    setPosition(rect: DOMRect) {
        const elementWidth = this.htmlElement.offsetWidth;
        let leftPosition = rect.left + window.scrollX - 50;

        if (leftPosition + elementWidth > window.innerWidth) {
            leftPosition = window.innerWidth - elementWidth - 20;
        }

        const elementHeight = this.htmlElement.offsetHeight;
        let topPosition = rect.top + window.scrollY - elementHeight - 10;

        if (topPosition < 0) {
            topPosition = rect.bottom + window.scrollY + 10;
        }

        this.htmlElement.style.left = `${leftPosition}px`;
        this.htmlElement.style.top = `${topPosition}px`;
    }

    hide(): void {
        if (this.canHide) {
            this.currentSelectionRange = null;
            super.hide();
        }
    }

    lockHide(): void {
        this.lockedHide = true;
    }

    unlockHide(): void {
        this.lockedHide = false;
    }
}