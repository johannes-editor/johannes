import { Utils } from "@/utilities/Utils";
import { BaseUIComponent } from "../../../common/BaseUIComponent";
import { DropdownMenuButton } from "./DropdownMenuButton";
import { DropdownMenuList } from "./DropdownMenuList";

export class DropdownMenu extends BaseUIComponent {

    readonly id: string;
    dropdownButton: DropdownMenuButton;
    dropdownList: DropdownMenuList;

    constructor(id: string, button: DropdownMenuButton, dropdownList: DropdownMenuList) {

        super({
            id: id
        });
        this.id = id;
        this.dropdownButton = button;
        this.dropdownList = dropdownList;


        button.appendTo(this);
        dropdownList.appendTo(this);
    }

    init(): HTMLElement {

        const htmlElement = document.createElement("div");
        htmlElement.id = this.props.id;
        htmlElement.classList.add("select-wrapper");

        return htmlElement;
    }


    get display(): string {
        return 'block';
    }


    static create(prefixId: string, button: DropdownMenuButton, list: DropdownMenuList, classesKey: string[] = []): DropdownMenu {
        const instance = new DropdownMenu(prefixId + Utils.generateUniqueId(), button, list);
        instance.addCssClass(...classesKey);

        return instance;
    }
}