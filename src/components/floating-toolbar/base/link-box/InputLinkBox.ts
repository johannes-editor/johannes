import { BaseUIComponent } from "../../../common/BaseUIComponent";
import { InputLinkBoxWrapper } from "./InputLinkBoxWrapper";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";

export class InputLinkBox extends BaseUIComponent {

    parentWrapper?: InputLinkBoxWrapper;

    constructor() {
        super({});

    }

    init(): HTMLElement {

        const htmlElement = document.createElement("input");

        htmlElement.id = "linkBoxInput";
        htmlElement.type = "url";
        htmlElement.placeholder = "Paste or type a link...";

        htmlElement.style.position = "relative";

        return htmlElement;
    }

    setParentWrapper(parentWrapper: InputLinkBoxWrapper): void {
        this.parentWrapper = parentWrapper;
    }
}