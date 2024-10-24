import { SVGIcon } from "../../common/SVGIcon";
import { BaseUIComponent } from "../../common/BaseUIComponent";
import { CustomEvents } from "@/common/CustomEvents";
import { ICommandEventDetail } from "@/commands/ICommandEventDetail";
import { Commands } from "@/commands/Commands";
import { CustomUIEvents } from "@/common/CustomUIEvents";
import { IUIEventDetail } from "@/commands/IUIEventDetail";
import { ChangeColor } from "@/commands/UIActions/ChangeColor";
import { DOMUtils } from "@/utilities/DOMUtils";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { Colors } from "@/common/Colors";

export class ButtonGroupItem extends BaseUIComponent {

    private readonly command: string;
    private readonly showUI: boolean;
    private readonly icon: SVGIcon;

    constructor(command: string, title: string, icon: SVGIcon) {

        super({
            title: title,
            icon: icon
        });

        this.command = command;
        this.showUI = command == Commands.toggleLink;
        this.icon = icon;

        this.attachEvents();
    }

    init(): HTMLElement {

        const htmlElement = document.createElement("button");

        htmlElement.classList.add("entry", "button-reset", "text-formatting-operation", "option-hover");
        htmlElement.title = this.props.title;
        htmlElement.tabIndex = 1;

        htmlElement.appendChild(this.props.icon.htmlElement);

        return htmlElement;
    }

    attachEvents(): void {

        this.htmlElement.addEventListener(DefaultJSEvents.Click, async (event) => {

            const block = DOMUtils.findClickedElementOrAncestorByClass(event, "block");

            document.dispatchEvent(new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                detail: {
                    command: this.command,
                    showUI: this.showUI,
                    block: block
                }
            }));
        });

        document.addEventListener(CustomUIEvents.ColorChangeRequest, (event: Event) => {

            const customEvent = event as CustomEvent<IUIEventDetail>;
            const details = customEvent.detail;

            if (this.id == details.targetId) {

                if((details.action as ChangeColor).color == Colors.IconActiveBlue){
                    this.icon.changeColorImportant((details.action as ChangeColor).color);
                }else{
                    this.icon.changeColor((details.action as ChangeColor).color);
                }
            }
        });
    }

    static create(command: string, title: string, icon: SVGIcon): ButtonGroupItem {
        return new ButtonGroupItem(command, title, icon);
    }
}