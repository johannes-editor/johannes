import { QuickMenu } from './QuickMenu';
import { QuickMenuItem } from "./QuickMenuItem";
import { DoublyLinkedList } from '../../common/DoublyLinkedList';
import { BaseUIComponent } from '../common/BaseUIComponent';

export class QuickMenuSection extends BaseUIComponent {

    immediateParent: QuickMenu;

    menuItems = new DoublyLinkedList<QuickMenuItem>();

    constructor(options: QuickMenuSectionOptions) {

        super({
            title: options.title,
            classList: options.classList
        });

        this.immediateParent = options.quickMenuInstance;
    }

    init(): HTMLElement {

        const htmlElement = document.createElement('section');
        htmlElement.classList.add(this.props.classList);

        const heading = document.createElement('h2');
        heading.textContent = this.props.title;
        heading.classList.add("no-selection");

        htmlElement.appendChild(heading);

        return htmlElement;
    }

    appendQuickMenuItems(menuItems: QuickMenuItem[]): void {

        menuItems.forEach(item => {

            this.appendQuickMenuItem(item)
        });
    }

    appendQuickMenuItem(menuItem: QuickMenuItem): void {

        this.menuItems.append(menuItem);
        this.htmlElement.appendChild(menuItem.htmlElement);
    }

    filterSection(text: string): void {

        this.restore();

        if (text !== "") {
            const loweredText = text.toLowerCase();

            this.menuItems.forEach(menuItem => {
                if (!menuItem.filterValue.toLocaleLowerCase().includes(loweredText)) {
                    menuItem.hide();
                }
            });

            const atLeastOneItem = this.menuItems.any(item => item.filterValue.toLocaleLowerCase().includes(loweredText));

            if (!atLeastOneItem) {
                this.hide();
            }
        }
    }

    restore() {
        this.show();

        this.menuItems.forEach(menuItem => {
            menuItem.show();
        });
    }
}

export interface QuickMenuSectionOptions {
    quickMenuInstance: QuickMenu;
    title: string;
    classList: string;
}