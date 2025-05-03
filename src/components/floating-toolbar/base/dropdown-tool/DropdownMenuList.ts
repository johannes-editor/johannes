import { BaseUIComponent } from "../../../common/BaseUIComponent";
import { CircularDoublyLinkedList } from "../../../../common/CircularDoublyLinkedList";
import { DropdownMenuListItem } from "./DropdownMenuListItem";
import { IDropdownMenuItem } from "./IDropdownMenuItem";
import { JNode } from "@/common/JNode";
import { DropdownMenuButton } from "./DropdownMenuButton";
import { Utils } from "@/utilities/Utils";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { KeyboardKeys } from "@/common/KeyboardKeys";
import { ZIndex } from "@/common/ZIndex";
import { CustomEvents } from "@/common/CustomEvents";

export class DropdownMenuList extends BaseUIComponent {

    private parentDropdownParentButton?: DropdownMenuButton;

    dropdownItems: CircularDoublyLinkedList<IDropdownMenuItem>;
    currentFocusedMenuItem: JNode<IDropdownMenuItem> | null;
    filter: string = "";

    constructor(id: string) {

        super({
            id: id
        });

        this.id = id;
        this.dropdownItems = new CircularDoublyLinkedList<DropdownMenuListItem>();
        this.currentFocusedMenuItem = null;

        this.attachEvents();
    }

    get display(): string {
        return 'flex';
    }

    init(): HTMLElement {

        const htmlElement: HTMLUListElement = document.createElement('ul');
        htmlElement.id = this.props.id;
        htmlElement.setAttribute('name', 'block-type');
        htmlElement.style.display = 'none';
        htmlElement.classList.add('soft-box-shadow', 'dependent-box', 'checkable-items');
        htmlElement.style.position = "absolute";
        htmlElement.style.maxHeight = "25vmax";
        htmlElement.style.overflowY = "auto";
        htmlElement.style.zIndex = ZIndex.ExtremelyImportant;

        return htmlElement;
    }

    append(dropdownItem: IDropdownMenuItem): void {

        this.dropdownItems.append(dropdownItem);
        this.htmlElement.appendChild(dropdownItem.htmlElement)
    }

    setParentDropdownMenuButton(dropdownParentButton: DropdownMenuButton): void {
        this.parentDropdownParentButton = dropdownParentButton;
    }



    attachEvents(): void {

        // Set `true` to capture the event during the registration phase, giving this function priority over others.
        // This prevents the event from being handled by earlier `Content` component listeners.
        document.addEventListener(DefaultJSEvents.Keydown, (event) => {

            if (event.key !== KeyboardKeys.Enter) return;

            if (!Utils.isEventFromContentWrapper(event)) {
                return;
            }

            if (this.isVisible && this.currentFocusedMenuItem && event.key === KeyboardKeys.Enter) {
                event.stopImmediatePropagation();
                event.preventDefault();

                this.currentFocusedMenuItem.value.emitCommandEvent(event);
            }
        }, true);

        document.addEventListener(DefaultJSEvents.Click, (event) => {
            if (this.clickedOutsideTheDropdownWhileDropdownIsVisible(event)) {
                this.hide();
            }
        });

        document.addEventListener(DefaultJSEvents.Keydown, (event) => {

            if (
                event.key !== KeyboardKeys.ArrowDown &&
                event.key !== KeyboardKeys.ArrowUp &&
                event.key !== KeyboardKeys.Escape) {
                return;
            }

            if(!Utils.isEventFromContentWrapper(event)){
                return;
            }

            if (this.keyPressedOutsideTheDropdownWhileDropdownIsVisible(event)) {

                if (event.key == KeyboardKeys.ArrowDown) {
                    event.preventDefault();

                    this.focusNextVisibleItem();
                }

                if (event.key == KeyboardKeys.ArrowUp) {
                    event.preventDefault();
                    this.focusPreviousVisibleItem();
                }

                // When using a FloatingToolbar with a DropdownList, this handler should be ignored for smoother UI control. 
                // However, for components like BlockToolbox, where there's no risk of the parent element disappearing after pressing Escape (if the cursor is within the block),
                // this handler is used to close the dropdown list when the user presses Escape.
                if (event.key == KeyboardKeys.Escape && !this.htmlElement.closest(".floating-toolbar")) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    this.hide();
                }
            }
        });

        document.addEventListener(DefaultJSEvents.Keydown, this.handlerKeyDownEvent.bind(this));

        document.addEventListener(CustomEvents.blockCloned, () => {
            this.hide();
        });


        this.attachUIEvent();
    }

    handlerKeyDownEvent(event: KeyboardEvent) {
        if (this.isVisible && /^[a-zA-Z]$/.test(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
            event.preventDefault();
            this.filter += event.key;
            this.applyFilter();
        } else if (this.isVisible && event.key === KeyboardKeys.Backspace) {
            this.filter = this.filter.slice(0, -1);
            this.applyFilter();
        }
    }

    applyFilter() {
        this.dropdownItems.forEach(item => {
            if (item.value == "" || item.value?.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase()) || item.title?.toLocaleLowerCase().includes(this.filter.toLocaleLowerCase())) {
                item.show();
            } else {
                item.hide();
            }
        });
    }

    show(): void {

        this.filter = "";

        this.htmlElement.style.left = "0";
        this.htmlElement.style.right = "auto";

        if (this.doesElementOverflowScreen) {
            this.htmlElement.style.left = "auto";
            this.htmlElement.style.right = "0";
        }

        this.parentDropdownParentButton?.svgIcon?.setUseTo("icon-wordpress-chevron-up");

        this.applyFilter();
        super.show();

    }

    hide(): void {
        this.parentDropdownParentButton?.svgIcon?.setUseTo("icon-wordpress-chevron-down");
        this.currentFocusedMenuItem?.value.removeFocus();
        this.currentFocusedMenuItem = null;
        super.hide();
    }

    switchVisualFocus(item: JNode<IDropdownMenuItem>): void {

        if (this.currentFocusedMenuItem == item) {
            return;
        }

        if (this.currentFocusedMenuItem) {
            this.currentFocusedMenuItem.value.removeFocus();
        }

        this.currentFocusedMenuItem = item;
        this.currentFocusedMenuItem.value.focus();
    }

    private focusNextVisibleItem(): void {

        let nextVisibleItem: JNode<IDropdownMenuItem> | null;

        if (this.currentFocusedMenuItem) {
            nextVisibleItem = this.currentFocusedMenuItem.getNextSatisfying(item => {
                return item instanceof DropdownMenuListItem && item.isVisible;
            });
        } else {
            nextVisibleItem = this.dropdownItems.findFirst(item => item instanceof DropdownMenuListItem);
        }

        this.switchVisualFocus(nextVisibleItem!);
        nextVisibleItem?.value.ensureVisible();
    }

    focusPreviousVisibleItem(): void {

        let previousVisibleItem: JNode<IDropdownMenuItem> | null;

        if (this.currentFocusedMenuItem) {
            previousVisibleItem = this.currentFocusedMenuItem.getPreviousSatisfying(item => {
                return item instanceof DropdownMenuListItem && item.isVisible;
            });
        } else {
            previousVisibleItem = this.dropdownItems.findFirst(item => item instanceof DropdownMenuListItem);
        }

        this.switchVisualFocus(previousVisibleItem!);
        previousVisibleItem?.value.ensureVisible();
    }

    private clickedOutsideTheDropdownWhileDropdownIsVisible(event: MouseEvent): boolean {
        return this.canHide
            && !(event.target! as HTMLElement).closest(`#${this.htmlElement.id}`)
            && !(event.target! as HTMLElement).closest(`#${this.parentDropdownParentButton?.htmlElement.id}`);
    }

    private keyPressedOutsideTheDropdownWhileDropdownIsVisible(event: KeyboardEvent): boolean {
        return this.canHide
            && !(event.target! as HTMLElement).closest(`#${this.htmlElement.id}`)
        //&& !(event.target! as HTMLElement).closest(`#${this.parentDropdownParentButton?.htmlElement.id}`);
    }


    static create(prefixId: string, classesKey: string[] = []): DropdownMenuList {
        const instance = new DropdownMenuList(prefixId + Utils.generateUniqueId());
        instance.addCssClass(...classesKey);

        return instance;
    }
}