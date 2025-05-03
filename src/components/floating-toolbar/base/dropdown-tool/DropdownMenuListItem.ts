import { BaseUIComponent } from "../../../common/BaseUIComponent";
import { DropdownMenuList } from "./DropdownMenuList";
import { SVGIcon } from "@/components/common/SVGIcon";
import { IDropdownMenuItem } from "./IDropdownMenuItem";
import { JNode } from "@/common/JNode";
import { Sizes } from "@/common/Sizes";
import { ICommandEventDetail } from "@/commands/ICommandEventDetail";
import { CustomEvents } from "@/common/CustomEvents";
import { CustomUIEvents } from "@/common/CustomUIEvents";
import { IUIEventDetail } from "@/commands/IUIEventDetail";
import { ShowHideActiveButton } from "@/commands/UIActions/ShowHideActiveButton";
import { DOMUtils } from "@/utilities/DOMUtils";
import { ChangeBlockToolbarLanguage } from "@/commands/UIActions/ChangeBlockToolbarLanguage";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { ChangeTextTemporarily } from "@/commands/UIActions/ChangeTextTemporarily";

export class DropdownMenuListItem extends BaseUIComponent implements IDropdownMenuItem {

    id: string;
    private readonly command: string;
    readonly value: string | null;
    readonly activeIcon?: SVGIcon;
    private leftIcon?: SVGElement | HTMLElement | null;
    readonly title: string;

    private onFocusFunctionList: (() => void)[] = [];
    private onLoseFocusFunctionList: (() => void)[] = [];

    parentDropdownMenuList: DropdownMenuList;

    constructor(
        id: string,
        parentDropdownMenuList: DropdownMenuList,
        command: string,
        value: string | null,
        leftIcon: HTMLElement | SVGElement | null,
        title: string,
        shortcut: string | null = null) {

        const classList = ["list-item", "option", "option-hover", "block-operation", "no-list-style", "no-selection"];

        const icon = new SVGIcon("icon-material-small-check", Sizes.medium);
        icon.htmlElement.style.visibility = "hidden";

        if (value && leftIcon) {
            leftIcon.style.color = value;
        }

        super({
            id: id,
            classList: classList,
            leftIcon: leftIcon,
            title: title,
            icon: icon,
            shortcut: shortcut
        });

        this.id = id;
        this.classList = classList;
        this.leftIcon = leftIcon;
        this.command = command;
        this.value = value;
        this.title = title;
        this.parentDropdownMenuList = parentDropdownMenuList;
        this.activeIcon = icon;

        this.attachEvents();
    }

    addClass(classKey: string) {
        this.classList.push(classKey);
        this.htmlElement.classList.add(classKey);
    }

    attachOnFocus<T extends any[]>(func: (...args: T) => void, ...args: T): void {
        this.onFocusFunctionList.push(() => func(...args));
    }

    attachOnLoseFocus<T extends any[]>(func: (...args: T) => void, ...args: T): void {
        this.onLoseFocusFunctionList.push(() => func(...args));
    }

    get display(): string {
        return 'flex';
    }

    focus(): void {
        this.htmlElement.classList.add('option-focused');
        this.onFocusFunctionList.forEach(func => func());
    }

    removeFocus(): void {
        this.htmlElement.classList.remove('option-focused');
        this.onLoseFocusFunctionList.forEach(func => func());
    }

    init(): HTMLElement {

        const htmlElement = document.createElement('li');
        htmlElement.id = this.props.id;
        const classList = this.props.classList as string[];
        htmlElement.classList.add("pointer", ...classList);
        htmlElement.tabIndex = 2;

        htmlElement.style.color = "#37352F";

        const textOption = document.createElement('div');
        textOption.classList.add('text-option');

        if (this.props.leftIcon) {
            textOption.appendChild(this.props.leftIcon);
        }


        const span = document.createElement('span');
        span.innerText = this.props.title;

        textOption.appendChild(span);

        htmlElement.appendChild(textOption);
        htmlElement.appendChild(this.props.icon.htmlElement);

        if (this.props.shortcut) {
            const shortCut = document.createElement("span");
            shortCut.innerText = this.props.shortcut;
            shortCut.style.color = "rgba(55, 53, 47, 0.5)"

            htmlElement.appendChild(shortCut);
        }

        return htmlElement;
    }

    emitCommandEvent(event: Event): void {

        const block = DOMUtils.getParentTargetBySelector(event as MouseEvent, ".block") || DOMUtils.getParentFromSelection(".block");

        const customEvent = new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {

            detail: {
                command: this.command,
                value: this.value,
                block: (block) as HTMLHtmlElement
            }
        });

        document.dispatchEvent(customEvent);
    }

    attachEvents(): void {

        this.attachUIEvent();

        // Prevent focus change when clicking on this element
        this.htmlElement.addEventListener(DefaultJSEvents.Mousedown, (event) => {
            event.preventDefault();
        });

        this.htmlElement.addEventListener(DefaultJSEvents.Mousemove, async () => {

            const node: JNode<IDropdownMenuItem> = this.parentDropdownMenuList.dropdownItems.find(this)!;

            this.parentDropdownMenuList.switchVisualFocus(node!);
        });

        this.htmlElement.addEventListener(DefaultJSEvents.Click, (event) => {

            event.preventDefault();
            event.stopImmediatePropagation();
            this.emitCommandEvent(event);
        });

        document.addEventListener(CustomUIEvents.ChangeBlockToolbarLanguage, this.handleChangeBlockToolbarLanguageEvent.bind(this));
    }

    handleChangeBlockToolbarLanguageEvent(event: Event) {
        const customEvent = event as CustomEvent<IUIEventDetail>;
        const details = customEvent.detail;

        if (details.targetClass && details.targetClass.includes("code-block-language-menu")) {

            const eventValues = (details.action as ChangeBlockToolbarLanguage);

            const block = this.htmlElement.closest(`#${eventValues.blockId}`);

            if (block) {

                if (this.value == eventValues.language) {
                    this.activeIcon?.changeVisibilityToVisible();
                } else {
                    this.activeIcon?.changeVisibilityToHidden();
                }
            }
        }
    }

    attachUIEvent() {
        document.addEventListener(CustomUIEvents.ShowHideActiveButton, this.handleShowHideActiveButtonEvent.bind(this));
        document.addEventListener(CustomUIEvents.ResetActiveButtons, this.handleResetActiveButtonsEvent.bind(this));
        document.addEventListener(CustomUIEvents.ChangeTextTemporarily, this.handleChangeTextTemporarilyEvent.bind(this));
    }

    handleShowHideActiveButtonEvent(event: Event) {
        const customEvent = event as CustomEvent<IUIEventDetail>;
        const details = customEvent.detail;

        if (this.classList?.includes(details.targetClass!)) {
            const eventValues = (details.action as ShowHideActiveButton);
            const eventColor = eventValues.value;

            if (this.value?.toLowerCase() == eventColor.toLowerCase()) {
                event.stopImmediatePropagation();
                event.preventDefault();
                this.activeIcon?.toggleVisibility();
            }
        }
    }

    handleResetActiveButtonsEvent(event: Event) {
        const customEvent = event as CustomEvent<IUIEventDetail>;
        const details = customEvent.detail;

        if (this.classList?.includes(details.targetClass!)) {
            this.activeIcon?.changeVisibilityToHidden();
        }
    }

    handleChangeTextTemporarilyEvent(event: Event) {
        const customEvent = event as CustomEvent<IUIEventDetail>;
        const details = customEvent.detail;

        if (details.targetId == this.id) {
            event.stopImmediatePropagation();

            const temporarilyText = (details.action as ChangeTextTemporarily).temporarilyText;
            const element = this.htmlElement.querySelector(".text-option > span");

            if (element && element.textContent) {
                if (!element.hasAttribute('data-original-text')) {
                    element.setAttribute('data-original-text', element.textContent);
                }

                element.textContent = temporarilyText;

                setTimeout(() => {
                    const originalText = element.getAttribute('data-original-text');
                    if (originalText !== null) {
                        element.textContent = originalText;
                    }
                }, 2000);
            }
        }
    }
}