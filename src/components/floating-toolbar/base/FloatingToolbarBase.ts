import { BaseUIComponent } from '../../common/BaseUIComponent';
import { DropdownMenu } from './dropdown-tool/DropdownMenu';
import { FloatingToolbarSeparator } from './separator/FloatingToolbarSeparator';
import { ButtonGroup } from './button-group/ButtonGroup';
import { CustomEvents } from '@/common/CustomEvents';
import { DefaultJSEvents } from '@/common/DefaultJSEvents';
import { ZIndex } from '@/common/ZIndex';

export abstract class FloatingToolbarBase extends BaseUIComponent {

    dropdowns: DropdownMenu[];
    separators: FloatingToolbarSeparator[];
    currentSelectionRange: Range | null;
    htmlFocusedElementBeforeOpenQuickMenu: HTMLElement | null;

    constructor(id: string) {

        super({
            id: id
        });

        this.dropdowns = [];
        this.separators = [];
        this.currentSelectionRange = null;
        this.htmlFocusedElementBeforeOpenQuickMenu = null;
    }

    init(): HTMLElement {

        const htmlElement = document.createElement("div");

        htmlElement.id = this.props.id;
        htmlElement.style.display = "none";
        htmlElement.classList.add("floating-toolbar", "select-wrapper", "soft-box-shadow");
        htmlElement.style.zIndex = ZIndex.SlightlyImportant;

        const selectWrapper = document.createElement("div");

        htmlElement.appendChild(selectWrapper);

        return htmlElement;
    }

    get display(): string {
        return 'flex';
    }

    hide(): void {
        if (this.canHide) {
            if (this.anyDropdownVisible()) {
                this.hideAllDropdownVisible();
            }

            this.currentSelectionRange = null;
            super.hide();
        }
    }

    appendDropdown(dropdown: DropdownMenu): void {
        this.dropdowns.push(dropdown)
        this.htmlElement.appendChild(dropdown.htmlElement);
    }

    appendButtonGroup(buttonGroup: ButtonGroup): void {
        this.htmlElement.appendChild(buttonGroup.htmlElement);
    }

    appendSeparator(separator: FloatingToolbarSeparator): void {
        this.separators.push(separator);
        this.htmlElement.appendChild(separator.htmlElement);
    }

    appendTextToolbar(button: ButtonGroup): void {
        this.htmlElement.appendChild(button.htmlElement);
    }

    anyDropdownVisible(): boolean {
        for (const dropdown of this.dropdowns) {
            if (dropdown.dropdownList.isVisible) {
                return true;
            }
        }

        return false;
    }

    hideAllDropdownVisible(): boolean {
        for (const dropdown of this.dropdowns) {
            if (dropdown.dropdownList.canHide) {
                dropdown.dropdownList.hide();
            }
        }

        return false;
    }

    attachEvents() {

        // Prevent focus change when click on this element
        this.htmlElement.addEventListener(DefaultJSEvents.Click, (event) => {
            event.preventDefault();
        });

        // Prevent focus change when click on this element
        this.htmlElement.addEventListener(DefaultJSEvents.Mousedown, (event) => {
            event.preventDefault();
        });

        document.addEventListener(CustomEvents.blockDeleted, () => {
            this.hide();
        });

        document.addEventListener(CustomEvents.blockTypeChanged, () => {
            this.hide();
        });
    }

    isSelectionEmpty() {
        const selection = document.getSelection();
        return !selection || selection.rangeCount === 0 || selection.toString().trim() === '';
    }

    restoreRangeSelection(): void {
        document.getSelection()?.removeAllRanges();
        document.getSelection()?.addRange(this.currentSelectionRange!);
    }
}