import { QuickMenuSection } from './QuickMenuSection';
import { QuickMenuEmpty } from './QuickMenuEmpty';
import { QuickMenuItem } from './QuickMenuItem';
import { BaseUIComponent } from '../common/BaseUIComponent';
import { CircularDoublyLinkedList } from '../../common/CircularDoublyLinkedList';
import { JNode } from "../../common/JNode";
import { DependencyContainer } from '@/core/DependencyContainer';
import { IFocusStack } from '@/core/IFocusStack';
import { IQuickMenu } from './IQuickMenu';
import { ICommandEventDetail } from '@/commands/ICommandEventDetail';
import { CustomEvents } from '@/common/CustomEvents';
import { Commands } from '@/commands/Commands';
import { DOMUtils } from '@/utilities/DOMUtils';
import { ZIndex } from '@/common/ZIndex';
import { DefaultJSEvents } from '@/common/DefaultJSEvents';
import { KeyboardKeys } from '@/common/KeyboardKeys';
import { Utils } from '@/utilities/Utils';

export class QuickMenu extends BaseUIComponent implements IQuickMenu {

    static id = "quickMenu";

    private currentFocusedMenuItem: JNode<QuickMenuItem> | null;
    private menuSections: CircularDoublyLinkedList<QuickMenuSection>;
    private quickMenuEmpty: QuickMenuEmpty;
    private filterInput: string;
    private focusStack: IFocusStack;

    private static instance: QuickMenu | null;

    private constructor(focusStack: IFocusStack) {

        const quickMenuEmpty = new QuickMenuEmpty();

        super({ quickMenuEmpty: quickMenuEmpty });

        this.currentFocusedMenuItem = null;
        this.menuSections = new CircularDoublyLinkedList<QuickMenuSection>();
        this.quickMenuEmpty = quickMenuEmpty;
        this.focusStack = focusStack;

        this.attachEvents();
        this.filterInput = "";
    }

    init(): HTMLElement {

        const htmlElement = document.createElement('div');
        htmlElement.id = QuickMenu.id;
        htmlElement.style.zIndex = ZIndex.SlightlyImportant;

        htmlElement.classList.add('block-options-wrapper', 'soft-box-shadow');
        htmlElement.style.display = 'none';

        const blockOptions = document.createElement('div');
        blockOptions.classList.add('block-options');
        blockOptions.style.position = 'relative';

        blockOptions.appendChild(this.props.quickMenuEmpty.htmlElement);

        htmlElement.appendChild(blockOptions);

        return htmlElement;
    }

    append(menuItem: QuickMenuSection): void {
        this.menuSections.append(menuItem);
        this.htmlElement.querySelector('.block-options')!.appendChild(menuItem.htmlElement);
    }

    public static getInstance(): QuickMenu {

        const focusStack = DependencyContainer.Instance.resolve<IFocusStack>("IFocusStack");

        if (!QuickMenu.instance) {
            QuickMenu.instance = new QuickMenu(focusStack);
        }

        return QuickMenu.instance;
    }

    switchVisualFocus(item: JNode<QuickMenuItem>): void {

        if (this.currentFocusedMenuItem == item) {
            return;
        }

        if (this.currentFocusedMenuItem) {
            this.currentFocusedMenuItem.value.removeFocus();
        }

        this.currentFocusedMenuItem = item;
        this.currentFocusedMenuItem.value.focus();

        this.focusStack.peek()?.focus();
    }

    focusOnTheFirstVisibleItem(): void {

        const firstSectionNode: JNode<QuickMenuSection> | null = this.menuSections.getFirst();

        let currentSectionNode: JNode<QuickMenuSection> | null = firstSectionNode;

        while (currentSectionNode) {

            const itemNode: JNode<QuickMenuItem> | null = currentSectionNode.value.menuItems.findFirst(item => item.isVisible);

            if (itemNode) {
                this.switchVisualFocus(itemNode);
                return;
            }

            currentSectionNode = currentSectionNode.nextNode;

            if (currentSectionNode == firstSectionNode) {
                return;
            }
        }
    }

    focusPreviousVisibleItem(): void {

        let previousVisibleItem: JNode<QuickMenuItem> | null;

        if (this.currentFocusedMenuItem) {
            previousVisibleItem = this.currentFocusedMenuItem.getPreviousSatisfying(item => item.isVisible);
            if (!previousVisibleItem) {

                let previousVisibleSectionNode: JNode<QuickMenuSection> | null = this.menuSections.find(this.currentFocusedMenuItem.value.immediateParent)!.getPreviousSatisfying(section => section.isVisible);

                if (!previousVisibleSectionNode) {
                    return;
                }
                previousVisibleItem = previousVisibleSectionNode.value.menuItems.findLast(item => item.isVisible);
            }
        } else {
            let lastVisibleSectionNode: JNode<QuickMenuSection> | null = this.menuSections.findLast(section => section.isVisible);

            if (!lastVisibleSectionNode) {
                return;
            }
            previousVisibleItem = lastVisibleSectionNode.value.menuItems.findLast(item => item.isVisible);
        }
        this.switchVisualFocus(previousVisibleItem!);
    }

    focusNextVisibleItem(): void {

        let nextVisibleItem: JNode<QuickMenuItem> | null;

        if (this.currentFocusedMenuItem) {
            nextVisibleItem = this.currentFocusedMenuItem.getNextSatisfying(item => item.isVisible);
            if (!nextVisibleItem) {

                let nextVisibleSectionNode: JNode<QuickMenuSection> | null = this.menuSections.find(this.currentFocusedMenuItem.value.immediateParent)!.getNextSatisfying(section => section.isVisible);

                if (!nextVisibleSectionNode) {
                    return;
                }
                nextVisibleItem = nextVisibleSectionNode.value.menuItems.findFirst(item => item.isVisible);
            }

        } else {
            let firstVisibleSectionNode: null | JNode<QuickMenuSection> = this.menuSections.findFirst(section => section.isVisible);
            if (!firstVisibleSectionNode) {
                return;
            }
            nextVisibleItem = firstVisibleSectionNode.value.menuItems.findFirst(item => item.isVisible);
        }

        this.switchVisualFocus(nextVisibleItem!);
    }

    filterItems(): void {

        this.menuSections.forEach(section => {
            section.filterSection(this.filterInput);
        });

        if (!this.menuSections.any(section => section.isVisible)) {
            this.quickMenuEmpty.show();
        } else {
            this.quickMenuEmpty.hide();
        }

        this.focusOnTheFirstVisibleItem();
    }

    show() {

        setTimeout(() => {
            const activeElement = document.activeElement;

            if (!activeElement) {
                console.error("Failed to display the quickMenu: no active element found.");
                return;
            }

            this.focusStack.push(activeElement as HTMLElement);

            const selection = window.getSelection();

            if (!selection || selection.rangeCount === 0) {
                throw new Error('No selection found.');
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            this.htmlElement.style.display = 'flex';

            const elementWidth = this.htmlElement.offsetWidth;
            let leftPosition = rect.left + window.scrollX;

            if (leftPosition + elementWidth > window.innerWidth) {
                leftPosition = window.innerWidth - elementWidth - 20;
            }

            const elementHeight = this.htmlElement.offsetHeight;
            let topPosition = rect.bottom + window.scrollY + 10;

            this.htmlElement.style.left = `${leftPosition}px`;
            this.htmlElement.style.top = `${topPosition}px`;

            this.quickMenuEmpty.hide();

            super.show();

            this.focusOnTheFirstVisibleItem();
            this.focusStack.peek()?.focus();

        }, 10);

    }

    restore(): void {
        this.filterInput = "";

        this.menuSections.forEach(section => {
            section.restore();
        });
    }

    hide() {

        this.restore();
        this.focusStack.peek()?.focus();

        super.hide();
    }

    private attachEvents() {

        document.addEventListener(CustomEvents.emittedCommand, ((event: CustomEvent<ICommandEventDetail>) => {
            const { command } = event.detail;

            if (command == Commands.transformBlock) {
                this.hide();
            }

        }) as EventListener);


        document.addEventListener('input', (event) => {
            const target = event.target as HTMLElement;

            if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable)) {
                return;
            }

            if (!Utils.isEventFromContentWrapper(event)) {
                return;
            }

            let value = '';

            if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
                value = target.value;
            } else if (target.isContentEditable) {
                value = target.textContent || '';
            }

            const slashIndex = value.lastIndexOf('/');

            if (!this.isVisible && value.endsWith('/')) {

                const block =
                    DOMUtils.findClosestAncestorOfActiveElementByClass("block") ||
                    DOMUtils.findClosestAncestorOfActiveElementByClass("callout");

                if (block) {
                    const currentCell = target.closest(".ignore-quick-menu") as HTMLTableCellElement;

                    if (currentCell) {
                        return;
                    }

                    this.filterInput = '';

                    this.show();
                }

            } else if (this.isVisible) {

                if (slashIndex !== -1) {
                    this.filterInput = value.substring(slashIndex + 1);

                    this.filterItems();
                } else {
                    this.hide();
                }
            }
        });

        document.addEventListener(DefaultJSEvents.Keydown, (event: KeyboardEvent) => {
            if (event.key !== '/') {
                return;
            }

            if (!Utils.isEventFromContentWrapper(event)) {
                return;
            }

            const target = event.target as HTMLElement;
            const block =
                DOMUtils.findClosestAncestorOfActiveElementByClass("block") ||
                DOMUtils.findClosestAncestorOfActiveElementByClass("callout");

            if (block) {
                const currentCell = target.closest(".ignore-quick-menu") as HTMLTableCellElement;
                if (!currentCell && !this.isVisible) {
                    this.filterInput = '';
                    this.show();
                }
            }
        });

        document.addEventListener(DefaultJSEvents.Keydown, (event: KeyboardEvent) => {

            if (
                event.key !== KeyboardKeys.ArrowLeft &&
                event.key !== KeyboardKeys.ArrowRight &&
                event.key !== KeyboardKeys.ArrowDown &&
                event.key !== KeyboardKeys.ArrowUp &&
                event.key !== KeyboardKeys.Escape) {
                return;
            }

            if (!Utils.isEventFromContentWrapper(event)) {
                return;
            }

            const block =
                DOMUtils.findClosestAncestorOfActiveElementByClass("block") ||
                DOMUtils.findClosestAncestorOfActiveElementByClass("callout");

            if (this.isVisible && event.key === KeyboardKeys.ArrowLeft && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                event.preventDefault();
                event.stopPropagation();
            } else if (this.isVisible && event.key === KeyboardKeys.ArrowRight && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                event.preventDefault();
                event.stopPropagation();
            }
            else if (this.isVisible && event.key === KeyboardKeys.ArrowDown && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                event.preventDefault();
                this.focusNextVisibleItem();
            } else if (this.isVisible && event.key === KeyboardKeys.ArrowUp && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                event.preventDefault();
                this.focusPreviousVisibleItem();
            } else if (this.isVisible && event.key === KeyboardKeys.Escape && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                this.hide();
            }
        });

        document.addEventListener('click', (event) => {
            if (this.isVisible && !(event.target! as HTMLElement).closest(`#${this.htmlElement.id}`)) {
                this.hide();
            }
        });

        document.addEventListener(DefaultJSEvents.Keydown, (event) => {

            if (this.isVisible && event.key === KeyboardKeys.Enter && !event.ctrlKey && !event.shiftKey && !event.altKey) {

                if (!Utils.isEventFromContentWrapper(event)) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                const blockType = this.currentFocusedMenuItem?.value.blockType;

                if (blockType) {

                    this.transformHtmlFocusedElementBeforeOpenQuickMenu(blockType);
                }
            }
        }, true);

        document.addEventListener(CustomEvents.blockTypeChanged, (event) => {
            this.hide();
        });
    }


    emitCommandEvent(blockType: string): void {

        const customEvent = new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
            detail: {
                command: Commands.transformBlock,
                value: blockType
            }
        });

        document.dispatchEvent(customEvent);
    }

    transformHtmlFocusedElementBeforeOpenQuickMenu(blockType: string): void {
        if (blockType) {
            this.emitCommandEvent(blockType);
        }
    }

    private concatFilterInput(stg: string): void {
        this.filterInput += stg.toLowerCase();
    }

    private removeLastFilterInputCharacter(): void {
        if (this.filterInput.length > 0) {
            this.filterInput = this.filterInput.slice(0, -1);
        }
    }
}