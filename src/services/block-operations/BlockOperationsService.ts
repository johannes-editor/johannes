import { IBlockOperationsService } from "./IBlockOperationsService";
import { IElementFactoryService } from "../element-factory/IElementFactoryService";
import { ElementFactoryService } from "../element-factory/ElementFactoryService";
import { ContentTypes } from "@/common/ContentTypes";
import { DOMUtils } from "@/utilities/DOMUtils";
import { CustomEvents } from "@/common/CustomEvents";
import { DependencyContainer } from "@/core/DependencyContainer";
import { IFocusStack } from "@/core/IFocusStack";
import { IMemento } from "@/core/IMemento";
import { EventEmitter } from "@/commands/EventEmitter";
import { Commands } from "@/commands/Commands";
import { Utils } from "@/utilities/Utils";
import { CommonClasses } from "@/common/CommonClasses";
import { ICommandEventDetail } from "@/commands/ICommandEventDetail";
import hljs from 'highlight.js';

export class BlockOperationsService implements IBlockOperationsService {

    private static instance: BlockOperationsService;

    private elementFactoryService: IElementFactoryService;
    private memento: IMemento;
    private focusStack: IFocusStack;

    private getOrCreateContentElement(): HTMLElement {
        let contentElement = document.querySelector('#johannesEditor .content') as HTMLElement | null;
        if (!contentElement) {
            const wrapper = document.querySelector('#johannesEditor .content-wrapper');
            contentElement = document.createElement('div');
            contentElement.classList.add('content');
            wrapper?.appendChild(contentElement);
        }
        return contentElement as HTMLElement;
    }

    private constructor(
        elementFactoryService: IElementFactoryService,
        focusStack: IFocusStack,
        memento: IMemento) {

        if (BlockOperationsService.instance) {
            throw new Error("Use BlockOperationsService.getInstance() to get instance.");
        }

        this.elementFactoryService = elementFactoryService;
        this.focusStack = focusStack;
        this.memento = memento;

        BlockOperationsService.instance = this;
    }

    insertBlock(type: string, content: string, previousBlock: HTMLElement): HTMLElement {

        const block = this.elementFactoryService.create(type, content);

        if (previousBlock) {
            previousBlock.insertAdjacentElement('afterend', block);
        } else {
            this.getOrCreateContentElement().appendChild(block);
        }

        return block;
    }

    insertLiIntoListBlock(content: string, block: HTMLElement): HTMLElement {

        const li = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.LIST_ITEM, content);

        const list = block.querySelector("ul, ol");

        list!.appendChild(li);

        return li;
    }

    execCommand(command: string, showUI: boolean, value: string | null = null): boolean {

        if (command == Commands.copySelected) {

            if (document.getSelection && navigator.clipboard && navigator.clipboard.writeText) {
                const selection = document.getSelection();

                if (selection && selection.toString().length > 0) {
                    const selectedText = selection.toString();

                    navigator.clipboard.writeText(selectedText).then(() => {

                        const copiedEvent = new CustomEvent('copiedText', {
                            bubbles: true,
                            cancelable: true
                        });

                        document.dispatchEvent(copiedEvent);

                        return true;

                    }).catch((err: any) => {
                        console.error('Error when copy text', err);
                    });
                }
            }

            return false;
        }

        if (command == Commands.cutSelected) {

            if (document.getSelection && navigator.clipboard && navigator.clipboard.writeText) {
                const selection = document.getSelection();

                if (selection && selection.toString().length > 0) {
                    const selectedText = selection.toString();

                    selection.deleteFromDocument();

                    navigator.clipboard.writeText(selectedText).then(() => {

                        return true;

                    }).catch((err: any) => {
                        console.error('Error when cut text: ', err);
                    });
                }
            }

            return false;
        }

        if (command == Commands.paste) {
            if (navigator.clipboard && navigator.clipboard.readText) {
                navigator.clipboard.readText().then((pastedText: string) => {
                    const selection = document.getSelection();

                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(document.createTextNode(pastedText));

                        const selectionEvent = new CustomEvent('requestUpdateFloatingToolbar', {
                            bubbles: true,
                            cancelable: true
                        });

                        document.dispatchEvent(selectionEvent);

                        return true;
                    } else {
                        console.error('No text selected or clipboard empty.');
                    }
                }).catch((err: any) => {
                    console.error('Error when pasting text: ', err);
                });
            }

            return false;
        }

        if (command == Commands.transformBlock) {

            const block = this.getCurrentSelectedBlock() as HTMLElement;
            if (block && value) {
                this.transformBlock(value);
            }
        }

        if (command === Commands.removeFormat) {
            this.removeTextFormatting();
        }

        if (command == Commands.createDefaultBlock) {
            const element = document.activeElement || null;

            this.createDefaultBlock(element, value);
            return true;
        }

        if (command == Commands.focusOnFirstBlock) {

            const element = document.querySelector(".focusable");

            if (element) {
                (element as HTMLElement).focus();
                return true;
            }

            return false;
        }

        if (command == Commands.deleteBlockAndFocusOnPrevious) {

            throw new Error("Remove all reference to this code");
            this.execDeleteFocusOnPrevious();
            return true;
        }

        if (command == Commands.deleteBlockAndFocusOnNext) {

            throw new Error("Remove all reference to this code");
            this.execDeleteAndFocusOnNext();
            return true;
        }

        return true;
    }

    queryCommandState(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    static getInstance(): BlockOperationsService {

        const elementFactoryService = DependencyContainer.Instance.resolve<IElementFactoryService>("IElementFactoryService");
        const focusStack = DependencyContainer.Instance.resolve<IFocusStack>("IFocusStack");
        const memento = DependencyContainer.Instance.resolve<IMemento>("IMemento");

        if (!this.instance) {
            this.instance = new BlockOperationsService(elementFactoryService, focusStack, memento);
        }

        return this.instance;
    }

    static getDraggableElementFromSelection(): HTMLElement {
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let element: Node | null = range.commonAncestorContainer;

            if (element.nodeType === Node.TEXT_NODE) {
                element = element.parentNode as HTMLElement;
            }

            while (element && !(element instanceof HTMLElement)) {
                element = element.parentNode as HTMLElement | null;
            }

            if (element) {
                const draggable = element.closest('.block') as HTMLElement;
                return draggable;
            }
        }

        throw new Error();
    }

    removeTextFormatting(): boolean {
        const selection = document.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return false;
        }

        const range = selection.getRangeAt(0);
        const fragment = range.cloneContents();

        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);

        const textContent = tempDiv.textContent || '';

        try {
            range.deleteContents();
            const textNode = document.createTextNode(textContent);
            range.insertNode(textNode);

            selection.removeAllRanges();
            const newRange = document.createRange();

            if (textNode.parentNode) {
                newRange.setStart(textNode, 0);
                newRange.setEnd(textNode, textContent.length);
            }

            selection.addRange(newRange);

            EventEmitter.emitDocChangedEvent();
            return true;
        } catch (error) {
            console.error("Error removing formatting:", error);
            return false;
        }

    }

    execMergeWithPreviousBlock(): void {
        this.memento.saveState();

        const currentContentEditable = DOMUtils.getActiveContentEditable();
        if (!currentContentEditable) {
            return;
        }

        const previousContentEditable = DOMUtils.getPreviousContentEditable(currentContentEditable);
        if (!previousContentEditable) {
            return;
        }

        DOMUtils.sanitizeContentEditable(currentContentEditable);
        DOMUtils.sanitizeContentEditable(previousContentEditable);

        setTimeout(() => {
            DOMUtils.placeCursorAtEndOfEditableElement(previousContentEditable);

            setTimeout(() => {
                const caretPosition = DOMUtils.saveCaretPosition2d(previousContentEditable);

                previousContentEditable.innerHTML = previousContentEditable.innerHTML + currentContentEditable.innerHTML;

                if (currentContentEditable.closest("li")) {
                    const listItem = currentContentEditable.closest("li");
                    if (listItem) {
                        listItem.remove();
                    }
                } else {
                    const block = currentContentEditable.closest(".block");
                    if (block) {
                        block.remove();
                    }
                }

                const adjustedCaretPosition = {
                    charIndex: caretPosition.charIndex + previousContentEditable.textContent!.length,
                    horizontalPos: caretPosition.horizontalPos
                };

                DOMUtils.restoreCaretPosition2d(previousContentEditable, adjustedCaretPosition);
            }, 10);
        });
    }

    execMergeWithNextBlock(): void {
        this.memento.saveState();

        const currentContentEditable = DOMUtils.getActiveContentEditable();
        if (!currentContentEditable) {
            return;
        }

        const nextContentEditable = DOMUtils.getNextContentEditable(currentContentEditable);
        if (!nextContentEditable) {
            return;
        }

        DOMUtils.sanitizeContentEditable(currentContentEditable);
        DOMUtils.sanitizeContentEditable(nextContentEditable);

        setTimeout(() => {
            DOMUtils.placeCursorAtEndOfEditableElement(currentContentEditable);

            setTimeout(() => {
                const caretPosition = DOMUtils.saveCaretPosition2d(currentContentEditable);

                currentContentEditable.innerHTML = currentContentEditable.innerHTML + nextContentEditable.innerHTML;

                if (currentContentEditable.closest("li")) {
                    const listItem = nextContentEditable.closest("li");
                    if (listItem) {
                        listItem.remove();
                    }
                } else {
                    const block = nextContentEditable.closest(".block");
                    if (block) {
                        block.remove();
                    }
                }

                DOMUtils.restoreCaretPosition2d(currentContentEditable, caretPosition);
            }, 10);
        });
    }

    execDuplicateBlock(block?: HTMLElement): boolean {
        if (!block) {
            block = (this.getCurrentSelectedBlock() || DOMUtils.getCurrentActiveBlock()) as HTMLElement;
        }

        const clone = block.cloneNode(true) as HTMLElement;

        clone.querySelectorAll('.exclude-from-clone').forEach(el => el.remove());

        const nextElement = block.nextSibling;
        block.parentNode?.insertBefore(clone, nextElement);

        clone.id = `b-${Utils.generateUniqueId()}`;

        const hideEvent = new CustomEvent(CustomEvents.blockCloned, {
            bubbles: true,
            cancelable: true
        });

        document.dispatchEvent(hideEvent);

        EventEmitter.emitDocChangedEvent();

        return true;
    }

    execDeleteBlock(block?: HTMLElement): boolean {

        if (!block) {
            block = (this.getCurrentSelectedBlock() || DOMUtils.getCurrentActiveBlock()) as HTMLElement;
        }

        this.focusOnNext(block);
        this.deleteTheCurrentElementAndTheDraggableBlockIfEmpty(block);

        const hideEvent = new CustomEvent(CustomEvents.blockDeleted, {
            bubbles: true,
            cancelable: true
        });

        document.dispatchEvent(hideEvent);
        EventEmitter.emitDocChangedEvent();

        return true;
    }

    transformBlock(type: string, element?: HTMLElement | null) {

        let blockElement: Element | null;

        if (element) {
            blockElement = element.closest(".block");
        } else {
            blockElement = this.focusStack.peek()?.closest(".block") || null;
        }

        if(!blockElement){
            console.error("blockElement is null");
            return;
        }

        if (!element) {
            element = DOMUtils.findClosestAncestorOfActiveElementByClass(".block");
        }

        let contentElement = blockElement.querySelector('.swittable') as HTMLElement;

        this.focusStack.peek()?.focus();

        DOMUtils.removeFilterText();

        this.memento.saveState();

        let content = contentElement?.innerText;

        let focusStackToAdd: HTMLElement | null = null;


        let newContentBlock;

        switch (type) {
            case ElementFactoryService.ELEMENT_TYPES.PARAGRAPH: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.PARAGRAPH);

                const editableContent = DOMUtils.querySelectorIncludingSelf(contentElement, '[contenteditable="true"]');
                if (editableContent) {
                    newContentBlock.innerHTML = editableContent.innerHTML;
                }
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.HEADER_1: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.HEADER_1);
                if (content) {
                    newContentBlock.textContent = content;
                }
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.HEADER_2: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.HEADER_2);
                if (content) {
                    newContentBlock.textContent = content;
                }
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.HEADER_3: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.HEADER_3);
                if (content) {
                    newContentBlock.textContent = content;
                }
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.HEADER_4: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.HEADER_4);
                if (content) {
                    newContentBlock.textContent = content;
                }
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.HEADER_5: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.HEADER_5);
                if (content) {
                    newContentBlock.textContent = content;
                }
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.HEADER_6: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.HEADER_6);
                if (content) {
                    newContentBlock.textContent = content;
                }
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.CODE: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.CODE);
                const code = newContentBlock.querySelector("code");
                if (code && content) {
                    code.textContent = content;
                }
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.MATH: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.MATH);
                const input = newContentBlock.querySelector('.math-input');
                if (input) {
                    (input as HTMLElement).textContent = content || '';
                    (input as HTMLElement).dispatchEvent(new Event('input'));
                }
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.QUOTE: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.QUOTE);

                const quote = newContentBlock.querySelector("blockquote");

                if (quote && content) {
                    quote.textContent = content;
                }

                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.BULLETED_LIST: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.BULLETED_LIST, content);
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.NUMBERED_LIST: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.NUMBERED_LIST, content);
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.CHECK_LIST: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.CHECK_LIST, content);
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.SEPARATOR: {
                const separatorBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.BLOCK_SEPARATOR);
            
                const parent = blockElement!.parentElement!;
                
                parent.insertBefore(separatorBlock, blockElement);
            
                const focusable = blockElement!.querySelector('[contenteditable="true"]') as HTMLElement;
                if (focusable) {
                    focusable.focus();
                    DOMUtils.placeCursorAtEndOfEditableElement(focusable);
                }
            
                EventEmitter.emitDocChangedEvent();
                return;
            }

            case ElementFactoryService.ELEMENT_TYPES.TABLE: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.TABLE, ",,");
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.IMAGE: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.IMAGE, content);
                focusStackToAdd = newContentBlock;
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.VIDEO: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.VIDEO, content);
                focusStackToAdd = newContentBlock;
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.SPOTIFY: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.SPOTIFY, content);
                focusStackToAdd = newContentBlock;
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.GITHUB_GIST: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.GITHUB_GIST, content);
                focusStackToAdd = newContentBlock;
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.GITLAB_SNIPPET: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.GITLAB_SNIPPET, content);
                focusStackToAdd = newContentBlock;
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.CODEPEN: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.CODEPEN, content);
                focusStackToAdd = newContentBlock;
                break;
            }

            case ElementFactoryService.ELEMENT_TYPES.CALLOUT: {
                newContentBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.CALLOUT);

                const callout = newContentBlock.querySelector(".callout-text");
                const editableContent = DOMUtils.querySelectorIncludingSelf(contentElement, '[contenteditable="true"]');
                if (callout && editableContent && editableContent.innerHTML.trim() !== "") {
                    callout.innerHTML = editableContent.innerHTML;
                }
                break;
            }

            default:
                console.error('Unsupported type');
                return;
        }

        if (!newContentBlock) {
            return;
        }

        blockElement!.replaceChild(newContentBlock, contentElement);
        

        const focusable = (newContentBlock.closest('.focusable') || blockElement!.querySelector('.focusable')) as HTMLElement;
        if (focusable) {
            focusable.focus();
            DOMUtils.placeCursorAtEndOfEditableElement(focusable);
        }


        if (focusStackToAdd) {
            this.focusStack.push((focusStackToAdd as HTMLElement)!);
        }

        if (type == "image" || type == "video" || type == "spotify" || type == "github-gist" || type == "gitlab-snippet" || type == "codepen") {

            const placeholder = focusStackToAdd?.querySelector(".content-placeholder");
            if (placeholder) {
                this.focusStack.push(placeholder as HTMLElement);
            }
            EventEmitter.emitShowElementEvent("mediaInputter");
        }

        const blockToolbar = blockElement?.querySelector(".block-toolbar-wrapper");
        if (blockToolbar) {
            blockToolbar.remove();
        }

        if (type == ElementFactoryService.ELEMENT_TYPES.SEPARATOR) {
            const customEvent = new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                detail: {
                    command: Commands.createDefaultBlock
                }
            });

            document.dispatchEvent(customEvent);
        }

        EventEmitter.emitDocChangedEvent();
    }

    createNewElement(event: Event) {

        this.memento.saveState();

        const element = event.target as Element;

        const contentElement = element.closest('.johannes-content-element') as HTMLElement;

        if (contentElement && contentElement.classList.contains('list')) {
            this.createListItem(contentElement);
        } else {
            this.createDefaultBlock(contentElement, "");
        }

        EventEmitter.emitDocChangedEvent();
    }

    createListItem(element: HTMLElement): void {

        this.memento.saveState();

        let newContentElement = null;

        let activeElement = document.activeElement;
        let contentElement = element.closest('.johannes-content-element') as HTMLElement;

        if (contentElement.classList.contains('checkbox-list')) {
            newContentElement = this.elementFactoryService.create("checkboxItem", "");
        } else if (contentElement.classList.contains('list')) {
            newContentElement = this.elementFactoryService.create("listItem", "");
        } else {
            // newContentElement = createNewDraggableParagraphElement();
        }

        EventEmitter.emitDocChangedEvent();
    }

    createNewElementAndSplitContent(): boolean {

        this.memento.saveState();

        const activeElement = document.activeElement as HTMLElement | null;

        if (activeElement && (activeElement.tagName === 'FIGCAPTION' || activeElement.classList.contains('block-caption'))) {
            const caption = activeElement;
            const block = caption.closest('.block') as HTMLElement | null;

            if (block) {
                const { atEnd } = DOMUtils.getSelectionTextInfo(caption);

                if (atEnd) {
                    this.createDefaultBlock(block, "");
                } else {
                    const newParagraph = ElementFactoryService.blockParagraph();
                    DOMUtils.insertAfter(newParagraph, block);

                    const p = newParagraph.querySelector(`.${CommonClasses.ContentElement}`) as HTMLElement;
                    const [, afterRange] = DOMUtils.splitContentAtCursorSelection(caption);
                    const fragment = afterRange.cloneContents();
                    p.appendChild(fragment);
                    afterRange.deleteContents();
                    DOMUtils.trimEmptyTextAndBrElements(p);
                    DOMUtils.placeCursorAtStartOfEditableElement(p);
                }

                EventEmitter.emitDocChangedEvent();
                return true;
            }
        }

        const contentType = DOMUtils.getContentTypeFromActiveElement();

        if (contentType == ContentTypes.Image) {

            const block = DOMUtils.findClosestAncestorOfActiveElementByClass("block");
            this.createDefaultBlock(block, "");
            return false;
        } else if (contentType == ContentTypes.Table) {
            return false;
        } else if (
            contentType == ContentTypes.CheckList ||
            contentType == ContentTypes.BulletedList ||
            contentType == ContentTypes.NumberedList) {
        
            const currentItem = DOMUtils.findClosestAncestorOfActiveElementByClass("list-item");
            const parentBlock = currentItem?.closest(".block");
            const listElement = parentBlock?.querySelector("ul, ol");
            const allListItems = listElement?.querySelectorAll(".list-item");
        
            if (!currentItem || !parentBlock || !listElement || !allListItems) return false;
        
            if (DOMUtils.hasTextContent(currentItem)) {
                const clone = DOMUtils.cloneAndInsertAfter(currentItem);
                if (clone) {
                    const contentCurrent = currentItem.querySelector(".focusable") as Node;
                    const contentClone = clone.querySelector(".focusable") as Node;
        
                    DOMUtils.rearrangeContentAfterSplit(contentCurrent, contentClone);
                    DOMUtils.trimEmptyTextAndBrElements(contentCurrent);
                    DOMUtils.trimEmptyTextAndBrElements(contentClone);
                }
            } else {
                const isLastItem = currentItem === allListItems[allListItems.length - 1];
                
                if (isLastItem) {
                    const newParagraph = ElementFactoryService.blockParagraph();
                    DOMUtils.insertAfter(newParagraph, parentBlock);
                    
                    currentItem.remove();
                    if (allListItems.length === 1) {
                        parentBlock.remove();
                    }
        
                    const focusable = newParagraph.querySelector("p") as HTMLElement;
                    DOMUtils.placeCursorAtStartOfEditableElement(focusable);
                } else {
                    const newListBlock = parentBlock.cloneNode(false) as HTMLElement;
                    const newListElement = listElement.cloneNode(false) as HTMLElement;
                
                    const dragHandler = parentBlock.querySelector(".drag-handler-wrapper")?.cloneNode(true);
                    if (dragHandler) {
                        newListBlock.appendChild(dragHandler);
                    }
                
                    newListBlock.appendChild(newListElement);
                
                    const itemsAfter = Array.from(allListItems).slice(
                        Array.from(allListItems).indexOf(currentItem) + 1
                    );
                
                    itemsAfter.forEach(item => {
                        newListElement.appendChild(item);
                    });
                
                    const hasItemsAfter = newListElement.querySelectorAll(".list-item").length > 0;
                    if (hasItemsAfter) {
                        DOMUtils.insertAfter(newListBlock, parentBlock);
                    }
                
                    currentItem.remove();
                
                    const remainingItems = listElement.querySelectorAll(".list-item");
                    if (remainingItems.length === 0) {
                        parentBlock.remove();
                    }
                
                    const newListItems = newListElement.querySelectorAll(".list-item");
                    if (newListItems.length === 0 && newListBlock.isConnected) {
                        newListBlock.remove();
                    }
                
                    const firstItemInNewList = newListElement.querySelector(".list-item .focusable") as HTMLElement;
                    if (firstItemInNewList) {
                        DOMUtils.placeCursorAtStartOfEditableElement(firstItemInNewList);
                    }
                }
            }
        } else {
            const currentBlock = DOMUtils.findClosestAncestorOfActiveElementByClass("block");

            if (currentBlock) {
                const contentCurrent = currentBlock.querySelector('.focusable') as HTMLElement | null;
                const atEnd = contentCurrent ? DOMUtils.getSelectionTextInfo(contentCurrent).atEnd : false;

                if (atEnd) {
                    this.createDefaultBlock(currentBlock, "");
                } else {
                    const clonedBlock = DOMUtils.cloneAndInsertAfter(currentBlock);

                    if (clonedBlock) {
                        const contentCurrent = currentBlock.querySelector(".focusable") as Node;
                        const contentClone = clonedBlock.querySelector(".focusable") as Node;
                        DOMUtils.rearrangeContentAfterSplit(contentCurrent, contentClone);

                        DOMUtils.trimEmptyTextAndBrElements(contentCurrent);
                        DOMUtils.trimEmptyTextAndBrElements(contentClone);
                        this.transformBlock(ContentTypes.Paragraph, clonedBlock);

                        const focusable = (clonedBlock as HTMLElement).querySelector(".focusable") as HTMLElement;
                        DOMUtils.placeCursorAtStartOfEditableElement(focusable as HTMLElement);
                    }
                }
            }
        }

        EventEmitter.emitDocChangedEvent();

        return true;
    }

    createANewParagraphFromTitle(): void {

        this.memento.saveState();

        const title = document.querySelector("#johannesEditor .title h1") as HTMLElement;

        const clonedTitle = DOMUtils.cloneAndInsertAfter(title);
        if (clonedTitle) {
            DOMUtils.rearrangeContentAfterSplit(title as Node, clonedTitle as Node);
        }

        const newBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.BLOCK_PARAGRAPH, "");
        const p = newBlock.querySelector(`.${CommonClasses.ContentElement}`);
        if (p) {
            p.innerHTML = clonedTitle?.innerHTML || "";
        }

        const content = this.getOrCreateContentElement();

        if (content) {
            content.prepend(newBlock);
            const focusable = (newBlock as HTMLElement).querySelector(".focusable") as HTMLElement;

            DOMUtils.placeCursorAtStartOfEditableElement(focusable);
        }

        clonedTitle?.remove();

        EventEmitter.emitDocChangedEvent();
    }

    createDefaultBlock(eventParagraph: Element | null, text: string | null): HTMLElement {

        this.memento.saveState();
        const newBlock = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.BLOCK_PARAGRAPH, text || "");

        const contentElement = this.getOrCreateContentElement();

        if (eventParagraph && eventParagraph.closest('.block')) {
            const sibling = eventParagraph.closest('.block')!;
            sibling.insertAdjacentElement('afterend', newBlock);
        } else if (contentElement) {
            contentElement.appendChild(newBlock);
        }

        const focusable = newBlock.querySelector('.johannes-content-element') as HTMLElement;
        focusable.focus();
        this.focusStack.push(newBlock);

        EventEmitter.emitDocChangedEvent();

        return newBlock;
    }

    execFocusOnNext(): boolean {
        let currentActiveElement = this.getCurrentSelectedBlock() || DOMUtils.getCurrentActiveBlock();

        if (!currentActiveElement) {
            return false;
        }

        this.focusOnNext(currentActiveElement);

        return true;

    }

    execDeleteFocusOnPrevious(): boolean {

        this.memento.saveState();

        const currentActiveElement = document.activeElement!;

        this.focusOnPrevious(currentActiveElement);
        this.deleteTheCurrentElementAndTheDraggableBlockIfEmpty(currentActiveElement);

        EventEmitter.emitDocChangedEvent();

        return true;
    }

    execDeleteAndFocusOnNext(): boolean {

        this.memento.saveState();

        let currentActiveElement = this.getCurrentSelectedBlock() || DOMUtils.getCurrentActiveBlock();

        if (!currentActiveElement) {
            return false;
        }

        this.focusOnNext(currentActiveElement);
        this.deleteTheCurrentElementAndTheDraggableBlockIfEmpty(currentActiveElement);

        EventEmitter.emitDocChangedEvent();

        return true;
    }

    private focusOnPrevious(actualElement: Element, position: number | null = null): void {

        let tag = actualElement.tagName.toUpperCase();
        let focusedElement = null;

        if (tag === 'LI') {
            let previousElement = actualElement.previousElementSibling;

            if (!previousElement) {
                return;
            }

            if (previousElement && previousElement.classList.contains('focusable')) {
                focusedElement = previousElement as HTMLElement;
                if (position) {
                    this.applyCursorXEndPosition(focusedElement, position);
                } else {
                    DOMUtils.placeCursorAtEndOfEditableElement(focusedElement);
                }

                return;
            }
        }

        if ((actualElement.parentNode as HTMLElement).tagName.toUpperCase() === 'LI' /* focusable SPAN inside LI*/) {

            let previousElement = actualElement.closest('li')?.previousElementSibling?.querySelector('.focusable');

            if (previousElement && previousElement.classList.contains('focusable')) {
                focusedElement = previousElement as HTMLElement;
                if (position) {
                    this.applyCursorXEndPosition(focusedElement, position);
                } else {
                    DOMUtils.placeCursorAtEndOfEditableElement(focusedElement);
                }
                // return focusedElement;
                return;
            }
        }

        let parent = actualElement.closest('.block');

        if (!parent) {
            return;
        }
        let sibling = parent.previousElementSibling;

        while (sibling) {
            let focusableCandidates = sibling.querySelectorAll('.focusable');
            if (focusableCandidates.length > 0) {
                focusedElement = focusableCandidates[focusableCandidates.length - 1] as HTMLElement;
                if (position) {
                    this.applyCursorXEndPosition(focusedElement, position);
                } else {
                    DOMUtils.placeCursorAtEndOfEditableElement(focusedElement);
                }

                return;
            }

            sibling = sibling.previousElementSibling;
        }

        return;
    }

    private focusOnNext(actualElement: Element, position: number | null = null) {
        let tag = actualElement.tagName.toUpperCase();
        let focusedElement = null;

        if (tag === 'LI') {
            let nextElement = actualElement.nextElementSibling;

            if (nextElement && nextElement.classList.contains('focusable')) {
                focusedElement = nextElement as HTMLElement;

                if (position) {
                    this.applyCursorXStartPosition(focusedElement, position);
                } else {
                    DOMUtils.placeCursorAtStartOfEditableElement(focusedElement);
                }
                return focusedElement;
            }
        }

        if ((actualElement.parentNode as HTMLElement).tagName.toUpperCase() === 'LI' /* focusable SPAN inside LI*/) {
            let nextElement = actualElement.closest('li')?.nextElementSibling?.querySelector('.focusable');

            if (nextElement && nextElement.classList.contains('focusable')) {
                focusedElement = nextElement as HTMLElement;
                if (position) {
                    this.applyCursorXStartPosition(focusedElement, position);
                } else {
                    DOMUtils.placeCursorAtStartOfEditableElement(focusedElement);
                }
                return focusedElement;
            }
        }

        let parent = actualElement.closest('.block');

        if (!parent) {
            return;
        }

        let sibling = parent.nextElementSibling;

        while (sibling) {
            let focusableCandidates = sibling.querySelectorAll('.focusable');
            if (focusableCandidates.length > 0) {
                focusedElement = focusableCandidates[0] as HTMLElement;
                if (position) {
                    this.applyCursorXStartPosition(focusedElement, position);
                } else {
                    DOMUtils.placeCursorAtStartOfEditableElement(focusedElement);
                }
                return focusedElement;
            }

            sibling = sibling.nextElementSibling;
        }

        return focusedElement;
    }

    deleteTheCurrentElementAndTheDraggableBlockIfEmpty(currentElement: Element) {

        const parentBlock = currentElement.closest('.block');
        const actual = currentElement.closest('.deletable');

        actual?.remove();

        if (parentBlock &&
            parentBlock.querySelectorAll('.editable').length === 0 &&
            !parentBlock.querySelector('.johannes-content-element')) {
            parentBlock.remove();
        }
    }

    applyCursorXEndPosition(element: HTMLElement, xPosition: number) {

        const selection = window.getSelection()!;
        const range = document.createRange();

        let currentNode = element.lastChild;
        let result = null;

        while (currentNode) {
            if (currentNode.nodeType === Node.TEXT_NODE) {
                result = this.adjustCursorOffset(currentNode, xPosition);
                break;
            } else if (currentNode.nodeName.toUpperCase() === 'BR') {
                currentNode = currentNode.previousSibling;
                continue;
            }
            currentNode = currentNode.previousSibling;
        }

        if (result && result.closestNode) {
            range.setStart(result.closestNode, result.closestOffset);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            element.focus();
        } else {
            range.selectNodeContents(element);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            element.focus();
        }
    }

    applyCursorXStartPosition(element: HTMLElement, xPosition: number) {
        const selection = window.getSelection()!;
        const range = document.createRange();

        let currentNode = element.firstChild;
        let result = null;

        while (currentNode) {
            if (currentNode.nodeType === Node.TEXT_NODE) {
                result = this.adjustCursorOffset(currentNode, xPosition);
                break;
            }
            currentNode = currentNode.nextSibling;
        }

        if (result && result.closestNode) {
            range.setStart(result.closestNode, result.closestOffset);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            element.focus();
        } else {
            range.selectNodeContents(element);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            element.focus();
        }
    }

    adjustCursorOffset(node: Node, xPosition: number) {
        let range = document.createRange();
        let closestNode = node;
        let closestOffset = 0;
        let closestDiff = Infinity;

        for (let i = 0; i < node.textContent!.length; i++) {
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const rect = range.getBoundingClientRect();
            const leftDiff = Math.abs(rect.left - xPosition);
            const rightDiff = Math.abs(rect.right - xPosition);

            if (leftDiff < closestDiff || rightDiff < closestDiff) {
                closestDiff = Math.min(leftDiff, rightDiff);
                closestOffset = i + (rightDiff < leftDiff ? 1 : 0);
            }
        }

        if (xPosition > range.getBoundingClientRect().right) {
            closestOffset = node.textContent!.length;
        }

        return { closestNode, closestOffset };
    }

    getCurrentSelectedFocusable(): Element | null {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        let container: Node | null = range.commonAncestorContainer;

        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentNode;
        }

        const focusableParent = (container as HTMLElement).closest(".focusable");

        return focusableParent;
    }

    getCurrentSelectedBlock(): Element | null {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        let container: Node | null = range.commonAncestorContainer;

        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentNode;
        }

        const focusableParent = (container as HTMLElement).closest(".block");

        return focusableParent;
    }

    justifyLeft(block: HTMLElement): void {

        this.memento.saveState();

        this.removeJustify(block);
        block.classList.add("justify-left");
    }

    justifyCenter(block: HTMLElement): void {

        this.memento.saveState();

        this.removeJustify(block);
        block.classList.add("justify-center");
    }

    justifyRight(block: HTMLElement): void {

        this.memento.saveState();

        this.removeJustify(block);
        block.classList.add("justify-right");
    }

    changeCodeBlockLanguage(block: HTMLElement, value: string): void {

        this.memento.saveState();

        const code = block.querySelector("code");

        if (code) {
            DOMUtils.removeClassesWithPrefix(code as Element, "language-");
            code.classList.add(`language-${value}`);
            code.removeAttribute("data-highlighted");

            hljs.highlightElement(code);

            EventEmitter.emitCodeBlockLanguageChangedEvent("code-block-language-menu", block.id, value);
        }

        EventEmitter.emitDocChangedEvent();
    }

    private removeJustify(element: HTMLElement) {

        const classList = element.classList;

        for (let i = 0; i < classList.length; i++) {
            const className = classList[i];
            if (className.startsWith("justify-")) {
                classList.remove(className);
            }
        }

        EventEmitter.emitDocChangedEvent();
    }

    execChangeCalloutBackground(block: HTMLElement, color: string): void {

        const calloutDiv = block.querySelector(".callout > div");

        if (calloutDiv) {
            DOMUtils.removeClassesWithPrefix(calloutDiv as Element, "callout-background-");
            calloutDiv.classList.add(color);
        }

        EventEmitter.emitDocChangedEvent();
    }

    toggleCaption(block: HTMLElement): void {

        this.memento.saveState();

        const moreOptionsList = block.querySelector('.media-more-option-select') as HTMLElement | null;
        if (moreOptionsList && window.getComputedStyle(moreOptionsList).display !== 'none') {
            EventEmitter.emitCloseElementEvent(moreOptionsList.id);
        }

        const figure = block.querySelector('figure');
        if (figure) {
            if (figure.querySelector('.figure-content')) {
                const existingCaption = figure.querySelector('figcaption');
                if (existingCaption) {
                    existingCaption.remove();
                } else {
                    const caption = document.createElement('figcaption');
                    caption.setAttribute('data-placeholder', 'Type a caption');
                    caption.setAttribute('contenteditable', 'true');
                    caption.classList.add('editable', 'hide-turninto', 'hide-moreoptions', 'hide-inlineCode');
                    caption.innerHTML = '<br>';
                    DOMUtils.updatePlaceholderVisibility(caption);
                    figure.appendChild(caption);
                    DOMUtils.placeCursorAtStartOfEditableElement(caption);
                }
            } else {
                const next = figure.nextElementSibling;
                if (next && next.classList.contains('block-caption')) {
                    next.remove();
                } else {
                    const caption = document.createElement('div');
                    caption.classList.add('block-caption', 'editable', 'focusable', 'hide-turninto', 'hide-moreoptions', 'hide-inlineCode');
                    caption.setAttribute('data-placeholder', 'Type a caption');
                    caption.setAttribute('contenteditable', 'true');
                    caption.innerHTML = '<br>';
                    DOMUtils.updatePlaceholderVisibility(caption);
                    figure.insertAdjacentElement('afterend', caption);
                    DOMUtils.placeCursorAtStartOfEditableElement(caption);
                }
            }

            if (block.querySelector('.block-caption')) {
                block.classList.add('with-caption');
            } else {
                block.classList.remove('with-caption');
            }

            EventEmitter.emitDocChangedEvent();
            return;
        }

        const existing = block.querySelector('.block-caption');
        if (existing) {
            existing.remove();
        } else {
            const caption = document.createElement('div');
            caption.classList.add('block-caption', 'editable', 'focusable', 'hide-turninto', 'hide-moreoptions', 'hide-inlineCode');
            caption.setAttribute('data-placeholder', 'Type a caption');
            caption.setAttribute('contenteditable', 'true');
            caption.innerHTML = '<br>';
            DOMUtils.updatePlaceholderVisibility(caption);
            block.appendChild(caption);
            DOMUtils.placeCursorAtStartOfEditableElement(caption);
        }

        if (block.querySelector('.block-caption')) {
            block.classList.add('with-caption');
        } else {
            block.classList.remove('with-caption');
        }

        EventEmitter.emitDocChangedEvent();
    }
}