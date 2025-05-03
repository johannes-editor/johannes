import { SVGIcon } from "../../../common/SVGIcon";
import { BaseUIComponent } from "../../../common/BaseUIComponent";
import { DropdownMenuList } from "./DropdownMenuList";
import { Sizes } from "@/common/Sizes";
import { CustomUIEvents } from "@/common/CustomUIEvents";
import { IUIEventDetail } from "@/commands/IUIEventDetail";
import { ChangeBlockToolbarLanguage } from "@/commands/UIActions/ChangeBlockToolbarLanguage";
import { Utils } from "@/utilities/Utils";
import { BlockToolbox } from "@/components/block-toolbox/BlockToolbox";

export class DropdownMenuButton extends BaseUIComponent {

    dropdownList: DropdownMenuList;
    svgIcon?: SVGIcon;

    constructor(id: string, title: string | HTMLElement, dropdownList: DropdownMenuList, includeChevronIcon: boolean = true) {

        const svgIcon = new SVGIcon("icon-wordpress-chevron-down", Sizes.medium);

        super({
            id: id,
            title: title,
            dropdownList: dropdownList,
            svgIcon: includeChevronIcon ? svgIcon : null
        });

        this.dropdownList = dropdownList;
        this.svgIcon = svgIcon;

        this.attachEvents();

        dropdownList.setParentDropdownMenuButton(this);
    }

    init(): HTMLElement {

        const htmlElement: HTMLButtonElement = document.createElement('button');
        htmlElement.id = this.props.id;
        // htmlElement.title = this.props.title
        htmlElement.role = "button";
        htmlElement.classList.add("button-reset", "text-formatting-select-button", "text-formatting-operation", "option-hover", "pointer");
        htmlElement.tabIndex = 1;
        htmlElement.style.position = "relative";
        htmlElement.setAttribute("aria-controls", this.props.dropdownList.htmlElement.id);

        if (typeof this.props.title === "string") {
            const span = document.createElement('span');
            span.classList.add("no-selection");
            span.textContent = this.props.title;
            htmlElement.appendChild(span);
        } else {
            htmlElement.appendChild(this.props.title);
        }

        if (this.props.svgIcon) {
            htmlElement.appendChild(this.props.svgIcon.htmlElement);
        }

        return htmlElement;
    }

    attachEvents(): void {

        this.htmlElement.addEventListener("click", () => {
            if (!this.dropdownList.isVisible) {
                this.dropdownList.show();
            }else{
                this.dropdownList.hide();
            }
        });

        document.addEventListener(CustomUIEvents.ChangeBlockToolbarLanguage, this.handleChangeBlockToolbarLanguageEvent.bind(this));
    }

    handleChangeBlockToolbarLanguageEvent(event: Event) {
        const customEvent = event as CustomEvent<IUIEventDetail>;
        const details = customEvent.detail;

        if (details.targetClass && this.classList.includes(details.targetClass)) {

            const eventValues = (details.action as ChangeBlockToolbarLanguage);

            const block = this.htmlElement.closest(`#${eventValues.blockId}`);

            if(block){
               this.changeTitle(BlockToolbox.languageMap[eventValues.language]);
               this.dropdownList.hide();
            }
        }
    }


    get display(): string {
        return 'block';
    }

    changeTitle(value: string){
        const span = this.htmlElement.querySelector("span");
        if(span){
            span.textContent = value;
        }
    }

    static create(prefixId: string, title: string | HTMLElement, list: DropdownMenuList, includeChevronIcon?: boolean, classesKey: string[] = []): DropdownMenuButton {
        const instance = new DropdownMenuButton(prefixId + Utils.generateUniqueId(), title, list, includeChevronIcon);
        instance.addCssClass(...classesKey);

        return instance;
    }
}