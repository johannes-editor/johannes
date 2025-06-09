import { ElementFactoryService } from "../../services/element-factory/ElementFactoryService";
import { BaseUIComponent } from "../common/BaseUIComponent";
import { IElementFactoryService } from "../../services/element-factory/IElementFactoryService";
import { Content } from "../content/Content";
import { Title } from "../title/Title";
import { IBlockOperationsService } from "@/services/block-operations/IBlockOperationsService";
import { AddBlockWrapper } from "../add-block/AddBlockWrapper";
import { QuickMenu } from "../quick-menu/QuickMenu";
import { Toolbar as TableContextFloatingToolbar } from "../floating-toolbar/table-context/Toolbar";
import { Toolbar as TextContextFloatingToolbar } from "../floating-toolbar/text-context/Toolbar";
import { IMemento } from "@/core/IMemento";
import { DependencyContainer } from "@/core/DependencyContainer";
import { MediaInputter } from "../media-inputter/MediaInputter";
import { MathInputter } from "../math-inputter/MathInputter";
import { InputLinkBoxWrapper } from "../floating-toolbar/base/link-box/InputLinkBoxWrapper";
import { DefaultJSEvents } from '@/common/DefaultJSEvents';
import { Utils } from "@/utilities/Utils";
import { DOMUtils } from "@/utilities/DOMUtils";
import { TitleBuilder } from "../../builders/TitleBuilder";

export class Editor extends BaseUIComponent {

    private readonly elementFactoryService: IElementFactoryService;
    private static readonly editorId: string = "johannesEditor";
    private static instance: Editor;
    private memento: IMemento;

    private title?: Title;
    private content?: Content;
    private addBlock: AddBlockWrapper;
    private textFloatingToolbar: TextContextFloatingToolbar;
    private quickMenu: QuickMenu;
    private tableContextToolbar: TableContextFloatingToolbar;
    private mediaInputter: MediaInputter;
    private mathInputter: MathInputter;
    private inputLinkBoxWrapper: InputLinkBoxWrapper;
    private blockOperationsService: IBlockOperationsService;
    private structureObserver: MutationObserver | null = null;

    private constructor(
        elementFactoryService: IElementFactoryService,
        blockOperationsService: IBlockOperationsService,
        memento: IMemento,
        title: Title,
        content: Content,
        addBlock: AddBlockWrapper,
        floatingToolbar: TextContextFloatingToolbar,
        quickMenu: QuickMenu,
        tableToolbar: TableContextFloatingToolbar,
        mediaInputter: MediaInputter,
        mathInputter: MathInputter,
        inputLinkBoxWrapper: InputLinkBoxWrapper
    ) {

        super({
            elementFactoryService: elementFactoryService,
            blockOperationsService: blockOperationsService,
            title: title,
            content: content,
            addBlock: addBlock,
            floatingToolbar: floatingToolbar,
            quickMenu: quickMenu,
            tableToolbar: tableToolbar,
            mediaInputter: mediaInputter,
            mathInputter: mathInputter,
            inputLinkBoxWrapper: inputLinkBoxWrapper
        });

        if (Editor.instance) {
            throw new Error("Use BlockOperationsService.getInstance() to get instance.");
        }

        this.inputLinkBoxWrapper = inputLinkBoxWrapper;
        this.elementFactoryService = elementFactoryService;
        this.blockOperationsService = blockOperationsService;
        this.memento = memento;
        this.addBlock = addBlock;
        this.textFloatingToolbar = floatingToolbar;
        this.quickMenu = quickMenu;
        this.tableContextToolbar = tableToolbar;
        this.mediaInputter = mediaInputter;
        this.mathInputter = mathInputter;

        this.attachEvents();
        this.monitorStructure();

        Editor.instance = this;

        this.memento.saveState();
    }

    init(): HTMLElement {

        const htmlElement = document.getElementById(Editor.editorId) || document.createElement("div");

        htmlElement.classList.add("johannes-editor");

        const contentWrapper = document.createElement("div");
        contentWrapper.classList.add("content-wrapper");

        if (window.editorConfig?.enableTitle !== false) {
            contentWrapper.appendChild(this.props.title.htmlElement);
        }

        contentWrapper.appendChild(this.props.content.htmlElement);

        htmlElement.appendChild(contentWrapper);

        if (window.editorConfig?.enableAddBlock !== false) {
            htmlElement.appendChild(this.props.addBlock.htmlElement);
        }

        if (window.editorConfig?.enableFloatingToolbar !== false) {
            htmlElement.appendChild(this.props.floatingToolbar.htmlElement);
        }

        if (window.editorConfig?.enableQuickMenu != false) {
            htmlElement.appendChild(this.props.quickMenu.htmlElement);
        }

        htmlElement.appendChild(this.props.tableToolbar.htmlElement);
        htmlElement.appendChild(this.props.mediaInputter.htmlElement);
        htmlElement.appendChild(this.props.mathInputter.htmlElement);
        htmlElement.appendChild(this.props.inputLinkBoxWrapper.htmlElement)

        return htmlElement;
    }

    static getInstance(
        title: Title,
        content: Content,
        addBlock: AddBlockWrapper,
        textFloatingToolbar: TextContextFloatingToolbar,
        quickMenu: QuickMenu,
        tableFloatingToolbar: TableContextFloatingToolbar,
        mediaInputter: MediaInputter,
        mathInputter: MathInputter) {

        const elementFactoryService = DependencyContainer.Instance.resolve<IElementFactoryService>("IElementFactoryService");
        const blockOperationsService = DependencyContainer.Instance.resolve<IBlockOperationsService>("IBlockOperationsService");
        const memento = DependencyContainer.Instance.resolve<IMemento>("IMemento");
        const inputLinkBoxWrapper = new InputLinkBoxWrapper();

        if (!Editor.instance) {
            Editor.instance = new Editor(elementFactoryService, blockOperationsService, memento, title, content, addBlock, textFloatingToolbar, quickMenu, tableFloatingToolbar, mediaInputter, mathInputter, inputLinkBoxWrapper);
        }

        return Editor.instance;
    }

    attachEvents() {

        const container = document.getElementById(Editor.editorId);

        container?.addEventListener('mouseover', (event) => {

            const target = event.target;

            if (target instanceof Node) {
                let element = target as Node;

                if (element.nodeType === Node.TEXT_NODE) {
                    element = element.parentElement as HTMLElement;
                }

                if (element instanceof Element) {
                    const blockElement = element.closest('.block');

                    if (blockElement) {
                        this.appendDragHandler(blockElement);
                    }
                } else {
                    console.error('Event target is not an HTMLElement and cannot handle HTMLElement specific methods:', element);
                }
            } else {
                console.error('Event target is not a Node:', target);
            }
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                const firstParagraph = document.querySelector("#johannesEditor > .content .block p") as HTMLElement;
                if (firstParagraph) {
                    firstParagraph.focus();
                }
            });
        } else {
            const firstParagraph = document.querySelector("#johannesEditor > .content .block p") as HTMLElement;
            if (firstParagraph) {
                firstParagraph.focus();
            }
        }

        document.addEventListener(DefaultJSEvents.Paste, (event: ClipboardEvent) => {
            Editor.handlePasteEvent(event, this.blockOperationsService);
        }, true);
        

        this.attachDragHandler();
    }

    private monitorStructure(): void {
        const wrapper = document.querySelector('#johannesEditor .content-wrapper');
        if (!wrapper) return;

        this.structureObserver = new MutationObserver(() => {
            this.ensureInitialStructure();
        });

        this.structureObserver.observe(wrapper, { childList: true, subtree: true });

        this.ensureInitialStructure();
    }

    private ensureInitialStructure(): void {
        const wrapper = document.querySelector('#johannesEditor .content-wrapper');
        if (!wrapper) return;

        let title = wrapper.querySelector('.title');
        if (!title && window.editorConfig?.enableTitle !== false) {
            title = TitleBuilder.build().htmlElement;
            wrapper.prepend(title);
        }

        let content = wrapper.querySelector('.content') as HTMLElement | null;
        if (!content) {
            content = document.createElement('div');
            content.classList.add('content');
            wrapper.appendChild(content);
        }

        // Move any stray blocks directly under the wrapper back into the content container
        wrapper.querySelectorAll(':scope > .block').forEach(block => {
            content!.appendChild(block);
        });

        if (!content.querySelector('.block')) {
            content.appendChild(ElementFactoryService.blockParagraph());
        }

        // Ensure every block has an editable content element
        content.querySelectorAll('.block').forEach(block => {
            const editable = block.querySelector('.johannes-content-element') as HTMLElement | null;
            if (editable && editable.getAttribute('contenteditable') !== 'true') {
                editable.setAttribute('contenteditable', 'true');
            }
        });

        // Remove duplicate empty blocks leaving only one
        const blocks = content.querySelectorAll('.block');
        if (blocks.length > 1) {
            const empties = Array.from(blocks).filter(b => (b.textContent || '').trim() === '');
            if (empties.length === blocks.length) {
                empties.slice(1).forEach(b => b.remove());
            }
        }
    }

    static handlePasteEvent(event: ClipboardEvent, blockOperationsService: IBlockOperationsService) {
        const target = event.target as HTMLElement | null;
    
        if (target?.getAttribute('contenteditable') !== 'true') return;
        if (!Utils.isEventFromContentWrapper(event)) return;
    
        event.preventDefault();
        event.stopImmediatePropagation();
    
        const clipboardData = event.clipboardData;
        if (!clipboardData) return;

        if (target && target.tagName === 'FIGCAPTION') {
            const plainText = clipboardData.getData('text/plain');
            if (plainText) {
                Editor.insertTextAtCursor(plainText);
            }
            return;
        }
    
        const text = clipboardData.getData('text/plain');
        const textHtml = clipboardData.getData('text/html');
    
        if (textHtml !== "") {
            const currentBlock = DOMUtils.getContentTypeFromActiveElement();
            const isParagraphOrTitle = currentBlock === 'p' || target?.tagName.toLowerCase() === 'h1';

            if (isParagraphOrTitle) {
                const blocks = Editor.extractClipboardContent(textHtml);
    
                if (blocks.length > 0) {
                    if (blocks[0].text) {
                        Editor.insertTextAtCursor(blocks[0].text);
                    }
    
                    blocks.slice(1).forEach(block => {
                        if (block.type === "ul" || block.type === "ol") {
                            const first = block.items?.[0]?.text;
                            const newBlock = blockOperationsService.insertBlock("block-" + block.type, first || "", null);
    
                            block.items?.slice(1).forEach(item => {
                                blockOperationsService.insertLiIntoListBlock(item.text || "", newBlock);
                            });
    
                        } else {
                            blockOperationsService.insertBlock("block-" + block.type, block.text || "", null);
                        }
                    });
                }
    
            } else {
                const plainText = clipboardData.getData('text/plain');
                if (plainText) {
                    Editor.insertTextAtCursor(plainText);
                }
            }
    
            return;
        }
    
        const paragraphs = text.split('\n\r')
            .map(line => line.replace("\n", ""))
            .filter(line => line.trim() !== '');
    
        if (paragraphs.length > 0) {
            Editor.insertTextAtCursor(paragraphs[0]);
    
            paragraphs.slice(1).forEach(textContent => {
                blockOperationsService.createDefaultBlock(null, textContent);
            });
        }
    }

    static insertTextAtCursor(text: string): void {
        const sel = window.getSelection();

        if (sel) {
            if (sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                range.deleteContents();

                const textNode = document.createTextNode(text);
                range.insertNode(textNode);

                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }

    appendDragHandler(element: Node): void {
        if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentNode as HTMLElement;
        }

        if (!(element instanceof HTMLElement)) {
            console.error('Provided element is not an HTMLElement:', element);
            return;
        }

        const parent = element.closest('.block');
        let dragHandler = parent?.querySelector(".drag-handler");

        if (!dragHandler && parent) {
            dragHandler = this.elementFactoryService.create(ElementFactoryService.ELEMENT_TYPES.DRAG_HANDLE_BUTTON);
            parent.prepend(dragHandler);
        }
    }

    removeDragHandler(element: Node): void {
        if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentNode as HTMLElement;
        }

        if (!(element instanceof HTMLElement)) {
            console.error('Provided element is not an HTMLElement:', element);
            return;
        }

        const parent = element.closest('.block');
        if (parent) {
            const dragHandler = parent.querySelector(".drag-handler");
            dragHandler?.remove();
        }
    }

    extractContent() {
        throw new Error("Not implemented Exception");
    }

    attachDragHandler() {
        let draggedItem: any = null;

        let dropLine = document.createElement('div');
        dropLine.classList.add('drop-line');
        dropLine.style.height = '2px';
        dropLine.style.display = 'none';

        this.htmlElement.addEventListener('dragstart', (event) => {
            if ((event.target as Element)?.classList?.contains('drag-handler')) {
                draggedItem = (event.target as Element)?.closest('.block');
                draggedItem.setAttribute('draggable', 'true');
                setTimeout(() => {
                    draggedItem.style.opacity = '0.5';
                }, 0);
            }
        });

        this.htmlElement.addEventListener('dragend', () => {
            setTimeout(() => {
                if (draggedItem) {
                    draggedItem.style.opacity = '';
                    draggedItem.removeAttribute('draggable');
                    draggedItem = null;
                }
                dropLine.remove();
            }, 0);
        });

        this.htmlElement.addEventListener('dragover', (event) => {
            event.preventDefault();
            let target = (event.target as Element)?.closest('.block');

            if (target && target !== draggedItem) {
                let bounding = target.getBoundingClientRect();
                let offset = bounding.y + bounding.height / 2;

                if ((event as MouseEvent).clientY > offset) {
                    if (target.nextElementSibling !== dropLine) {
                        target.insertAdjacentElement('afterend', dropLine);
                    }
                } else {
                    if (target.previousElementSibling !== dropLine) {
                        target.insertAdjacentElement('beforebegin', dropLine);
                    }
                }
            }

            dropLine.style.display = 'block';
        });

        this.htmlElement.addEventListener('drop', (event) => {
            event.preventDefault();
            if (draggedItem && dropLine && dropLine.parentElement) {
                dropLine.parentElement.insertBefore(draggedItem, dropLine);
                dropLine.remove();
            }
        });
    }

    static extractClipboardContent(htmlContent: string) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        interface Block {
            type: string;
            text?: string;
            items?: Block[];
        }

        const blocks: Block[] = [];

        function processNode(node: Node, currentText: string = ''): { blocks: Block[], text: string } {
            let collectedText = currentText;
            let blocks: Block[] = [];

            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const type = element.tagName.toLowerCase();

                if (['style', 'script'].includes(type)) {
                    return { blocks, text: collectedText };
                }

                if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'blockquote'].includes(type)) {
                    if (collectedText.trim()) {
                        blocks.push({ type: 'p', text: collectedText.trim() });
                        collectedText = '';
                    }

                    let text = '';
                    if (type === 'pre') {
                        text = element.textContent || '';
                    } else {
                        text = Array.from(element.childNodes)
                            .map(child => child.textContent || '')
                            .join('');
                    }

                    if (text.trim()) {
                        blocks.push({ type, text: text.trim() });
                    }

                } else if (type === 'ul' || type === 'ol') {
                    if (collectedText.trim()) {
                        blocks.push({ type: 'p', text: collectedText.trim() });
                        collectedText = '';
                    }

                    const items: Block[] = [];

                    function collectListItems(liElement: HTMLElement) {
                        const cloned = liElement.cloneNode(true) as HTMLElement;
                        cloned.querySelectorAll('ul, ol').forEach(nested => nested.remove());
                        const mainText = cloned.textContent?.trim();
                        if (mainText) {
                            items.push({ type: 'li', text: mainText });
                        }

                        liElement.querySelectorAll(':scope > ul > li, :scope > ol > li').forEach(nestedLi => {
                            collectListItems(nestedLi as HTMLElement);
                        });
                    }

                    element.querySelectorAll(':scope > li').forEach(li => {
                        collectListItems(li as HTMLElement);
                    });

                    if (items.length > 0) {
                        blocks.push({ type, items });
                    }
                } else {
                    element.childNodes.forEach(child => {
                        const result = processNode(child, collectedText);
                        blocks = blocks.concat(result.blocks);
                        collectedText = result.text;
                    });
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || '';
                collectedText += text;
            }

            return { blocks, text: collectedText };
        }

        let collectedText = '';
        doc.body.childNodes.forEach(node => {
            const result = processNode(node, collectedText);
            blocks.push(...result.blocks);
            collectedText = result.text;
        });

        if (collectedText.trim()) {
            blocks.push({ type: 'p', text: collectedText.trim() });
        }

        return blocks;
    }
}