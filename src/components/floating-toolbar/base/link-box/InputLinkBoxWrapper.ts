import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { BaseUIComponent } from "../../../common/BaseUIComponent";
import { Toolbar } from "../../text-context/Toolbar";
import { InputLinkBox } from "./InputLinkBox";
import { KeyboardKeys } from "@/common/KeyboardKeys";
import { ICommandEventDetail } from "@/commands/ICommandEventDetail";
import { CustomEvents } from "@/common/CustomEvents";
import { Commands } from "@/commands/Commands";
import { IUIEventDetail } from "@/commands/IUIEventDetail";
import { Utils } from "@/utilities/Utils";

export class InputLinkBoxWrapper extends BaseUIComponent {

    inputLinkBox: InputLinkBox;
    highlights: HTMLDivElement[] = [];
    button: HTMLButtonElement;

    private savedSelectionRange: Range | null = null;

    textContextFloatingToolbar: Toolbar;

    constructor() {
        const inputLinkBox = new InputLinkBox();
        const button = document.createElement("button");

        super({
            inputLinkBox: inputLinkBox,
            button: button
        });

        this.id = "linkBox";
        this.inputLinkBox = inputLinkBox;
        this.button = button;
        inputLinkBox.setParentWrapper(this);

        this.textContextFloatingToolbar = Toolbar.getInstance();

        this.attachEvent();
    }

    init(): HTMLElement {
        const htmlElement = document.createElement("div");

        htmlElement.id = "linkBox";
        htmlElement.style.display = "none";
        htmlElement.classList.add("dependent-box", "soft-box-shadow");
        htmlElement.style.position = "absolute";

        const header = document.createElement("div");
        header.classList.add("header");
        header.innerText = "Link";

        const shell = document.createElement("div");
        shell.appendChild(this.props.inputLinkBox.htmlElement);
        shell.classList.add("link-box-shell")

        // const button = document.createElement("button");

        this.props.button.classList.add("blue-button");
        this.props.button.innerHTML = "Insert";

        shell.appendChild(this.props.button);

        htmlElement.appendChild(header);
        htmlElement.appendChild(shell);

        return htmlElement;
    }

    attachEvent(): void {

        document.addEventListener(DefaultJSEvents.Keydown, (event) => {
            if(event.key !== KeyboardKeys.Escape){
                return;
            }

            if(!Utils.isEventFromContentWrapper(event)){
                return;
            }

            if (this.canHide && (event.key === KeyboardKeys.Escape)) {
                event.stopImmediatePropagation();
                this.hide();
            }
        }, true);

        // Change the cursor when the Control key is pressed and the mouse hovers over a link.
        document.addEventListener(DefaultJSEvents.Keydown, function (event) {
            if (event.key === KeyboardKeys.Control) {
                document.body.classList.add('ctrl-active');
            }
        });

        // remove change the cursor when the Control key is not pressed and the mouse hovers over a link.
        document.addEventListener(DefaultJSEvents.Keyup, function (event) {
            if (event.key === KeyboardKeys.Control) {
                document.body.classList.remove('ctrl-active');
            }
        });

        this.inputLinkBox.htmlElement.addEventListener(DefaultJSEvents.Keydown, (event: KeyboardEvent) => {
            if (event.key == KeyboardKeys.Enter) {
                this.insertLink(event);
            }
        }, true);

        document.addEventListener(DefaultJSEvents.Click, (event) => {

            if (event.ctrlKey) {
                const target = event.target as HTMLElement;

                if (target.tagName === 'A' && target.getAttribute('href')) {
                    const href = target.getAttribute('href')!;

                    window.open(href, '_blank');
                    return;
                }
            }

            if (this.canHide && !(event.target! as HTMLElement).closest('#linkBox') && !(event.target! as HTMLElement).closest("#textFloatingToolbar")) {
                this.hide();
            }

        });

        this.button.addEventListener(DefaultJSEvents.Click, this.insertLink.bind(this), true);

        super.attachUIEvent();
    }



    handleShowElementEvent(event: Event) {
        const customEvent = event as CustomEvent<IUIEventDetail>;
        const details = customEvent.detail;

        if (details.targetId == this.id && !this.isVisible) {
            event.stopImmediatePropagation();
            this.show();
        } else if (details.targetId == this.id && this.isVisible) {
            event.stopImmediatePropagation();
            this.hide();
        }
    }

    insertLink(event: Event) {

        event.preventDefault();
        event.stopImmediatePropagation();

        const url = (this.inputLinkBox.htmlElement as HTMLInputElement).value;
        const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

        const isValid = Utils.isValidUrl(urlWithProtocol);

        if (isValid) {

            // Restore the selection before executing the command
            if (this.savedSelectionRange) {
                const selection = document.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(this.savedSelectionRange);
            }

            this.hide();

            document.dispatchEvent(new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
                detail: {
                    command: Commands.linkReadyToInsert,
                    value: urlWithProtocol
                }
            }));
        } else {

            const input = this.inputLinkBox.htmlElement as HTMLInputElement;
            input.style.backgroundColor = "rgb(253, 222, 222)";
            input.classList.add("shake-animation");

            setTimeout(() => {
                input.classList.remove("shake-animation");
            }, 1000);
        }
    }

    show() {

        const input = this.inputLinkBox.htmlElement as HTMLInputElement;
        input.style.backgroundColor = "white";

        this.textContextFloatingToolbar.lockHide();

        const range = document.getSelection()?.getRangeAt(0);

        if (!range) {
            return;
        }

        this.savedSelectionRange = range.cloneRange();

        this.positionLinkComponentBelowSelection(range);
        this.highlightSelectedText(range);
        super.show();

        setTimeout(() => {
            input.focus();
        }, 100);
    }

    positionLinkComponentBelowSelection(range: Range): void {

        const rects = range.getClientRects();

        if (rects.length === 0) {
            // console.error('No rects found');
            return;
        }

        const firstRect = rects[0];

        const c_firstRectLeft = firstRect.left;
        const c_firstRectTop = firstRect.top;
        const c_firstRectBottom = firstRect.bottom;

        this.htmlElement.style.display = 'flex';

        const elementWidth = this.htmlElement.offsetWidth;
        let leftPosition = c_firstRectLeft + window.scrollX - 50;

        if (leftPosition + elementWidth > window.innerWidth) {
            leftPosition = window.innerWidth - elementWidth - 20;
        }

        const elementHeight = this.htmlElement.offsetHeight;
        let topPosition = c_firstRectTop + window.scrollY + 40;

        if (topPosition < 0) {
            topPosition = c_firstRectBottom + window.scrollY + 10;
        }

        this.htmlElement.style.left = `${leftPosition}px`;
        this.htmlElement.style.top = `${topPosition}px`;
    }


    hide(): void {

        this.textContextFloatingToolbar.unlockHide();
        super.hide();
        this.removeHighlights();
        (this.inputLinkBox.htmlElement as HTMLInputElement).value = "";

        // const range = this.textContextFloatingToolbar.currentSelectionRange;

        // if (!range) {
        //     return;
        // }

        // document.getSelection()?.removeAllRanges();
        // document.getSelection()?.addRange(range);
    }

    highlightSelectedText(range: Range) {
        const rects = range.getClientRects();

        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            const highlight = document.createElement('div');
            highlight.style.position = 'absolute';
            highlight.style.width = `${rect.width}px`;
            highlight.style.height = `${rect.height}px`;
            highlight.style.backgroundColor = '#c2c2c2';
            highlight.style.opacity = '0.3';
            document.body.appendChild(highlight);

            this.highlights.push(highlight);
            highlight.style.backgroundColor = 'rgba(0, 120, 215, 0.3)';
            highlight.style.pointerEvents = 'none';
            highlight.style.zIndex = '1000';

            highlight.style.left = `${rect.left + window.scrollX}px`;
            highlight.style.top = `${rect.top + window.scrollY}px`;

        }
    }

    removeHighlights() {
        this.highlights.forEach(highlight => {
            document.body.removeChild(highlight);
        });
        this.highlights = [];
    }


}