import { ICommand } from "../../commands/ICommand";

export interface IBlockOperationsService extends ICommand {

    transformBlock(type: string, element?: HTMLElement | null): void;
    createNewElementAndSplitContent(): boolean;
    justifyLeft(block: HTMLElement): void;
    justifyCenter(block: HTMLElement): void;
    justifyRight(block: HTMLElement): void;
    changeCodeBlockLanguage(block: HTMLElement, value: string): void;
    createANewParagraphFromTitle(): void;
    execDeleteBlock(block?: HTMLElement | null | undefined): boolean;
    execDuplicateBlock(block?: HTMLElement | null | undefined): boolean;
    execDeleteFocusOnPrevious(): boolean;
    execDeleteAndFocusOnNext(): boolean;
    execFocusOnNext(): boolean;
    execMergeWithPreviousBlock(): void;
    execMergeWithNextBlock(): void;
    execChangeCalloutBackground(block: HTMLElement, color: string): void;
    toggleCaption(block: HTMLElement): void;
    createDefaultBlock(eventParagraph: Element | null, text: string | null): HTMLElement;

    
    insertBlock(type: string, content: string, previousBlock: HTMLElement | null): HTMLElement;
    insertLiIntoListBlock(content: string, block: HTMLElement): HTMLElement;

}