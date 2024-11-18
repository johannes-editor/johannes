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
import { Commands } from "@/commands/Commands";

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

        document.addEventListener('paste', (event: ClipboardEvent) => {
            const target = event.target as HTMLElement;

            if (target.getAttribute('contenteditable') === 'true') {
                event.preventDefault();

                const clipboardData = event.clipboardData;
                if (clipboardData) {
                    const text = clipboardData.getData('text/plain');
                    const paragraphs = text.split('\n\n').filter(line => line.trim() !== '');

                    if (paragraphs.length > 0) {
                        Editor.insertTextAtCursor(paragraphs[0]);

                        paragraphs.slice(1).forEach(p => {
                            this.blockOperationsService.createDefaultBlock(null, p);
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
}