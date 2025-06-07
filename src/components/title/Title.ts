import { BaseUIComponent } from "../common/BaseUIComponent";
import { FloatingToolbarCssClass } from "../floating-toolbar/base/FloatingToolbarCssClass";
import { ElementFactoryService } from "../../services/element-factory/ElementFactoryService";

export class Title extends BaseUIComponent {

    constructor(value: string | undefined) {

        super({
            value: value
        });
    }

    init(): HTMLElement {

        const htmlElement = document.createElement("div");
        htmlElement.classList.add("title", FloatingToolbarCssClass.IgnoreTextContextFloatingToolbar);

        const h1 = document.createElement("h1");
        h1.setAttribute("contentEditable", "true");
        h1.setAttribute("data-placeholder", "Untitled");
        ElementFactoryService.initEditableContent(h1, this.props.value || null);


        htmlElement.appendChild(h1);

        return htmlElement;
    }

    static create(value: string | undefined): Title {
        return new Title(value);
    }
}