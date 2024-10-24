import { Colors } from "@/common/Colors";
import { TableScopes } from "@/services/table-operations/TableScopes";
import { ICommandEventDetail } from "./ICommandEventDetail";
import { CustomEvents } from "@/common/CustomEvents";
import { Commands } from "./Commands";
import { IUIEventDetail } from "./IUIEventDetail";
import { ChangeColor } from "./UIActions/ChangeColor";
import { CustomUIEvents } from "@/common/CustomUIEvents";
import { ShowHideActiveButton } from "./UIActions/ShowHideActiveButton";
import { ResetActiveButtons } from "./UIActions/ResetActiveButtons";
import { CloseElement } from "./UIActions/CloseElement";
import { ShowElement } from "./UIActions/ShowElement";
import { ChangeBlockToolbarLanguage } from "./UIActions/ChangeBlockToolbarLanguage";
import { ChangeTextTemporarily } from "./UIActions/ChangeTextTemporarily";

export class EventEmitter {

    static emitCodeBlockLanguageChangedEvent(targetClass: string, blockId: string, language: string) {

        const customEvent = new CustomEvent<IUIEventDetail>(CustomUIEvents.ChangeBlockToolbarLanguage, {
            detail: {
                targetClass: targetClass,
                action: new ChangeBlockToolbarLanguage(blockId, language)
            }
        });

        document.dispatchEvent(customEvent);
    }

    static emitShowElementEvent(targetId: string) {

        const customEvent = new CustomEvent<IUIEventDetail>(CustomUIEvents.ShowElement, {
            detail: {
                targetId: targetId,
                action: new ShowElement
            }
        });

        document.dispatchEvent(customEvent);
    }

    static emitCloseElementEvent(targetId: string) {

        const customEvent = new CustomEvent<IUIEventDetail>(CustomUIEvents.CloseElement, {
            detail: {
                targetId: targetId,
                action: new CloseElement
            }
        });

        document.dispatchEvent(customEvent);
    }

    static emitChangeTextTemporarilyEvent(targetId: string, text: string) {

        const customEvent = new CustomEvent<IUIEventDetail>(CustomUIEvents.ChangeTextTemporarily, {
            detail: {
                targetId: targetId,
                action: new ChangeTextTemporarily(text)
            }
        });

        document.dispatchEvent(customEvent);
    }

    static emitChangeComponentColorEvent(targetId: string, color: Colors) {

        const customEvent = new CustomEvent<IUIEventDetail>(CustomUIEvents.ColorChangeRequest, {
            detail: {
                targetId: targetId,
                action: new ChangeColor(color)
            }
        });

        document.dispatchEvent(customEvent);
    }

    static emitDocChangedEvent() {

        const docChangedEvent = new CustomEvent(CustomEvents.documentChanged, {
            bubbles: true,
            cancelable: true,
            detail: { message: "A block was deleted from the document." }
        });
        document.dispatchEvent(docChangedEvent);
    }

    static emitShowHideActiveElementEvent(targetClass: "hiliteColor" | "foreColor" | "backgroundColor", value: string, intension: "show" | "hide") {

        if (targetClass == "hiliteColor" && value == Colors.HiliteColorNone) {
            intension = "hide";
        }

        if (targetClass == "foreColor" && value == Colors.ForeColorInitial) {
            intension = "hide";
        }

        if (targetClass == "backgroundColor" && value == Colors.BackgroundColorNone) {
            intension = "hide";
        }

        const customEvent = new CustomEvent<IUIEventDetail>(CustomUIEvents.ShowHideActiveButton, {

            detail: {
                targetClass: targetClass,
                action: new ShowHideActiveButton(targetClass, value, intension)
            }
        });

        document.dispatchEvent(customEvent);
    }

    static emitResetActiveButtonsElementEvent(targetClass: "hiliteColor" | "foreColor" | "backgroundColor") {

        const customEvent = new CustomEvent<IUIEventDetail>(CustomUIEvents.ResetActiveButtons, {

            detail: {
                targetClass: targetClass,
                action: new ResetActiveButtons(targetClass)
            }
        });

        document.dispatchEvent(customEvent);
    }

    static emitChangeTableBorderColorEvent(scope: TableScopes, color: Colors): void {

        const customEvent = new CustomEvent<ICommandEventDetail>(CustomEvents.emittedCommand, {
            detail: {
                command: Commands.changeTableBorderColor,
                value: color,
                scope: scope
            }
        });

        document.dispatchEvent(customEvent);
    }
}