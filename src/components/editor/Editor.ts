import { ElementFactoryService } from "../../services/element-factory/ElementFactoryService";
import { BaseUIComponent } from "../common/BaseUIComponent";
import { IElementFactoryService } from "../../services/element-factory/IElementFactoryService";
import { Content } from "../content/Content";
import { Title } from "../title/Title";
import { IBlockOperationsService } from "@/services/block-operations/IBlockOperationsService";
import { AddBlockWrapper } from "../add-block/AddBlockWrapper";
import { QuickMenu } from "../quick-menu/QuickMenu";
import { TableContextFloatingToolbar } from "../floating-toolbar/TableContextFloatingToolbar";
import { TextContextFloatingToolbar } from "../floating-toolbar/TextContextFloatingToolbar";
import { IMemento } from "@/core/IMemento";
import { DependencyContainer } from "@/core/DependencyContainer";
import { MediaInputter } from "../media-inputter/MediaInputter";
import { InputLinkBoxWrapper } from "../floating-toolbar/link-box/InputLinkBoxWrapper";
import { DefaultJSEvents } from '@/common/DefaultJSEvents';
import { Utils } from "@/utilities/Utils";

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
    private inputLinkBoxWrapper: InputLinkBoxWrapper;
    private blockOperationsService: IBlockOperationsService;

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

        this.attachEvents();

        Editor.instance = this;

        this.memento.saveState();
    }

    init(): HTMLElement {

        const htmlElement = document.getElementById(Editor.editorId) || document.createElement("div");

        htmlElement.classList.add("johannes-editor");

        const contentWrapper = document.createElement("div");
        contentWrapper.classList.add("content-wrapper");
        // contentWrapper.setAttribute("contenteditable", "true");

        if (window.editorConfig?.enableTitle || true) {
            contentWrapper.appendChild(this.props.title.htmlElement);
        }

        // Content is required
        contentWrapper.appendChild(this.props.content.htmlElement);

        htmlElement.appendChild(contentWrapper);

        if (window.editorConfig?.enableAddBlock || true) {
            htmlElement.appendChild(this.props.addBlock.htmlElement);
        }

        if (window.editorConfig?.enableFloatingToolbar || true) {
            htmlElement.appendChild(this.props.floatingToolbar.htmlElement);
        }

        if (window.editorConfig?.enableQuickMenu || true) {
            htmlElement.appendChild(this.props.quickMenu.htmlElement);
        }

        htmlElement.appendChild(this.props.tableToolbar.htmlElement);
        htmlElement.appendChild(this.props.mediaInputter.htmlElement);
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
        mediaInputter: MediaInputter) {

        const elementFactoryService = DependencyContainer.Instance.resolve<IElementFactoryService>("IElementFactoryService");
        const blockOperationsService = DependencyContainer.Instance.resolve<IBlockOperationsService>("IBlockOperationsService");
        const memento = DependencyContainer.Instance.resolve<IMemento>("IMemento");
        const inputLinkBoxWrapper = new InputLinkBoxWrapper();

        if (!Editor.instance) {
            Editor.instance = new Editor(elementFactoryService, blockOperationsService, memento, title, content, addBlock, textFloatingToolbar, quickMenu, tableFloatingToolbar, mediaInputter, inputLinkBoxWrapper);
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

        //Focus on the first paragraph
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
            const target = event.target as HTMLElement | null;

            if (target?.getAttribute('contenteditable') === 'true') {

                if (!Utils.isEventFromContentWrapper(event)) {
                    return;
                }

                event.preventDefault();
                event.stopImmediatePropagation();

                const clipboardData = event.clipboardData;
                if (clipboardData) {
                    const text = clipboardData.getData('text/plain');
                    const textHtml = clipboardData.getData('text/html');

                    if (textHtml !== "") {
                        const blocks = Editor.extractClipboardContent(textHtml);

                        if (blocks.length > 0) {

                            if (blocks[0].text) {
                                Editor.insertTextAtCursor(blocks[0].text);
                            }

                            blocks.slice(1).forEach(block => {

                                if (block.type == "ul" || block.type == "ol") {

                                    const first = block.items?.[0]?.text;
                                    const newBlock = this.blockOperationsService.insertBlock("block-" + block.type, first || "", null);

                                    block.items?.slice(1).forEach(item => {
                                        this.blockOperationsService.insertLiIntoListBlock(item.text || "", newBlock)
                                    });

                                } else {
                                    this.blockOperationsService.insertBlock("block-" + block.type, block.text || "", null);
                                }

                            });
                        }

                        return;
                    }

                    const paragraphs = text.split('\n\r')
                        .map(item => item = item.replace("\n", ""))
                        .filter(line => line.trim() !== '');

                    if (paragraphs.length > 0) {
                        Editor.insertTextAtCursor(paragraphs[0]);

                        paragraphs.slice(1).forEach(textContent => {
                            this.blockOperationsService.createDefaultBlock(null, textContent);
                        });
                    }
                }
            }
        }, true);

        this.attachDragHandler();
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

    // static extractClipboardContent(htmlContent: string) {
    //     const parser = new DOMParser();
    //     const doc = parser.parseFromString(htmlContent, 'text/html');

    //     interface Block {
    //         type: string;
    //         text?: string;
    //         items?: Block[];
    //     }

    //     const blocks: Block[] = [];

    //     function processNode(node: Node): Block | null {
    //         if (node.nodeType === Node.ELEMENT_NODE) {
    //             const element = node as HTMLElement;
    //             const type = element.tagName.toLowerCase();

    //             // Handle different block elements
    //             if (type === 'h1' || type === 'h2' || type === 'h3' ||
    //                 type === 'h4' || type === 'h5' || type === 'h6' ||
    //                 type === 'p' || type === 'pre' || type === 'code' ||
    //                 type === 'blockquote') {

    //                 const text = element.innerText.trim();
    //                 return { type, text };

    //             } else if (type === 'ul' || type === 'ol') {
    //                 // Handle lists
    //                 const items: Block[] = [];
    //                 element.querySelectorAll('li').forEach(li => {
    //                     const text = li.innerText.trim();
    //                     items.push({ type: 'li', text });
    //                 });
    //                 return { type, items };

    //             } else if (type === 'li') {
    //                 const text = element.innerText.trim();
    //                 return { type: 'li', text };

    //             } else if (type === 'div' || type === 'span') {
    //                 // Process child nodes
    //                 const childBlocks: Block[] = [];
    //                 element.childNodes.forEach(child => {
    //                     const block = processNode(child);
    //                     if (block) {
    //                         childBlocks.push(block);
    //                     }
    //                 });
    //                 // Flatten if only one child
    //                 if (childBlocks.length === 1) {
    //                     return childBlocks[0];
    //                 } else if (childBlocks.length > 1) {
    //                     return { type: 'group', items: childBlocks };
    //                 } else {
    //                     return null;
    //                 }

    //             } else {
    //                 // For other elements, process child nodes
    //                 const text = element.innerText.trim();
    //                 if (text) {
    //                     return { type: element.tagName.toLowerCase(), text };
    //                 } else {
    //                     return null;
    //                 }
    //             }
    //         } else if (node.nodeType === Node.TEXT_NODE) {
    //             const text = node.textContent?.trim();
    //             if (text) {
    //                 return { type: 'text', text };
    //             }
    //         }
    //         return null;
    //     }

    //     doc.body.childNodes.forEach(node => {
    //         const block = processNode(node);
    //         if (block) {
    //             blocks.push(block);
    //         }
    //     });

    //     return blocks;
    // }

    static extractClipboardContent(htmlContent: string) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        interface Block {
            type: string;
            text?: string;
            items?: Block[];
        }

        const blocks: Block[] = [];

        function processNode(node: Node): Block[] {
            let blocks: Block[] = [];

            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const type = element.tagName.toLowerCase();

                if (['style', 'script'].includes(type)) {
                    return blocks;
                }

                if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'code', 'blockquote'].includes(type)) {
                    const text = element.innerText.trim();
                    if (text) {
                        blocks.push({ type, text });
                    }
                } else if (type === 'ul' || type === 'ol') {
                    const items: Block[] = [];
                    element.querySelectorAll(':scope > li').forEach(li => {
                        const text = (li as HTMLElement).innerText.trim();
                        if (text) {
                            items.push({ type: 'li', text });
                        }
                    });
                    if (items.length > 0) {
                        blocks.push({ type, items });
                    }
                } else if (type === 'li') {
                    const text = element.innerText.trim();
                    if (text) {
                        blocks.push({ type: 'li', text });
                    }
                } else {
                    element.childNodes.forEach(child => {
                        const childBlocks = processNode(child);
                        blocks = blocks.concat(childBlocks);
                    });
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text) {
                    const parent = node.parentNode as HTMLElement;
                    const parentType = parent?.tagName.toLowerCase();

                    if (parentType && !['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'blockquote', 'li'].includes(parentType)) {
                        blocks.push({ type: 'p', text });
                    }
                }
            }
            return blocks;
        }

        doc.body.childNodes.forEach(node => {
            const nodeBlocks = processNode(node);
            blocks.push(...nodeBlocks);
        });

        return blocks;
    }

}