import { BaseUIComponent } from "@/components/common/BaseUIComponent";
import { SVGIcon } from "@/components/common/SVGIcon";

export interface IDropdownMenuItem extends BaseUIComponent {

    activeIcon?: SVGIcon;
    focus(): void;
    removeFocus(): void;
    emitCommandEvent(event?: Event): void;
    attachOnFocus(func: () => void): void;
    attachOnLoseFocus(func: () => void): void;
    value: string | null;
    readonly title: string;
    // resetActiveIcon(): void;
    // getLeftIconBackgroundColor(): string | null;
    // changeActiveIconToVisible(): void; 
}