import { SVGIcon } from "@/components/common/SVGIcon";
import { BaseUIComponent } from "../../../common/BaseUIComponent";
import { DropdownMenuList } from "./DropdownMenuList";
import { IDropdownMenuItem } from "./IDropdownMenuItem";

export class DropdownMenuListItemTitle extends BaseUIComponent implements IDropdownMenuItem {


    parentDropdownMenuList: DropdownMenuList;

    constructor(parentDropdownMenuList: DropdownMenuList, title: string) {

        super({
            title: title
        });

        this.parentDropdownMenuList = parentDropdownMenuList;
    }

    title: string = "";
    activeIcon?: SVGIcon | undefined;

    value: string | null = "";
    
    changeActiveIconToVisible(): void {
        return;
    }
    getLeftIconBackgroundColor(): string | null {
        return null;
    }

    resetActiveIcon(): void {
        return;
    }
    
    attachOnLoseFocus(func: () => void): void {
        throw new Error("Method not implemented.");
    }
    
    attachOnFocus(func: () => void): void {
        throw new Error("Method not implemented.");
    }

    emitCommandEvent(): void {
        throw new Error("Method not implemented.");
    }

    removeFocus(): void {
        throw new Error("Method not implemented.");
    }

    focus(): void {
        throw new Error("Method not implemented.");
    }

    init(): HTMLElement {

        const htmlElement = document.createElement('li');
        htmlElement.classList.add("no-list-style");

        const title = document.createElement('h3');
        title.innerText = this.props.title;
        title.classList.add("no-selection");

        htmlElement.appendChild(title);

        return htmlElement;
    }
}