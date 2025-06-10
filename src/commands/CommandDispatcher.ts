import { CustomEvents } from "@/common/CustomEvents";
import { Commands } from "./Commands";
import { BlockOperationsService } from "@/services/block-operations/BlockOperationsService";
import { ICommandEventDetail } from "./ICommandEventDetail";
import { DependencyContainer } from "@/core/DependencyContainer";
import { IBlockOperationsService } from "@/services/block-operations/IBlockOperationsService";
import { ITableOperationsService } from "@/services/table-operations/ITableOperationsService";
import { ITextOperationsService } from "@/services/text-operations/ITextOperationsService";
import { DOMUtils } from "@/utilities/DOMUtils";

/**
 * Central command dispatcher class for handling various editor commands related to text and block manipulation.
 * This class encapsulates the logic needed to execute commands such as bold, italic, underline, color changes, and structural modifications to content blocks within an editor.
 *
 * @class
 * @singleton
 * Methods in this class are triggered by event listeners that listen for custom events which dictate the type of command to be executed.
 *
 * Example usage:
 * ```javascript
 * const commandDispatcher = CommandDispatcher.getInstance();
 * commandDispatcher.listen();  // Start listening for command and selection change events.
 * ```
 */
export class CommandDispatcher {

    private static instance: CommandDispatcher | null = null;

    private blockOperationsService: IBlockOperationsService;
    private tableOperationsService: ITableOperationsService;
    private textOperationsService: ITextOperationsService;

    /**
     * Private constructor to enforce singleton pattern.
     * Throws an error if attempted to be instantiated more than once.
     */
    private constructor(
        blockOperationsService: IBlockOperationsService,
        textOperationService: ITextOperationsService,
        tableOperationsService: ITableOperationsService) {

        if (CommandDispatcher.instance) {
            throw new Error("Attempt to instantiate singleton `CommandDispatcher` more than once.");
        }

        this.blockOperationsService = blockOperationsService;
        this.textOperationsService = textOperationService;
        this.tableOperationsService = tableOperationsService;
    }

    /**
     * Retrieves or creates an instance of CommandDispatcher.
     * @returns {CommandDispatcher} The singleton instance of the CommandDispatcher.
     */
    public static getInstance(): CommandDispatcher {

        const blockOperationsService = DependencyContainer.Instance.resolve<IBlockOperationsService>("IBlockOperationsService");
        const textOperationService = DependencyContainer.Instance.resolve<ITextOperationsService>("ITextOperationsService");
        const tableOperationsService = DependencyContainer.Instance.resolve<ITableOperationsService>("ITableOperationsService");

        if (!CommandDispatcher.instance) {
            CommandDispatcher.instance = new CommandDispatcher(blockOperationsService, textOperationService, tableOperationsService);
        }
        return CommandDispatcher.instance;
    }

    /**
     * Initializes listeners for various editor-related events such as command requests and selection changes.
     */
    public listen(): void {
        document.addEventListener(CustomEvents.emittedCommand, this.handleCommandEvent as EventListener);
        // document.addEventListener(CustomEvents.focusOnFirstRequested, this.handleFocusOnFirstRequestedEvent);
        document.addEventListener(CustomEvents.pressedEnterOnTitle, () => this.blockOperationsService.createANewParagraphFromTitle());
    }

    /**
     * Handles command events dispatched from UI components or other parts of the application.
     * @param {CustomEvent<ICommandEventDetail>} event - The event object containing details about the command.
     */
    private handleCommandEvent = (event: CustomEvent<ICommandEventDetail>): void => {
        const { command, showUI, value, targetBlockType, scope } = event.detail;
        let block = event.detail.block;

        switch (command) {

            case Commands.copySelected:
                this.textOperationsService.execCopy();
                break;

            case Commands.cutSelected:
                this.textOperationsService.execCut();
                break;

            case Commands.paste:
                this.textOperationsService.execReplace();
                break;

            case Commands.linkReadyToInsert:
                if (!value) {
                    throw new Error(`${Commands.linkReadyToInsert} requires value`);
                }
                this.textOperationsService.execInsertLink(value);
                break;

            case Commands.toggleLink:
                this.textOperationsService.execToggleLink();
                break;

            case Commands.toggleBold:
                this.textOperationsService.execBold();
                break;

            case Commands.toggleInlineCode:
                this.textOperationsService.execInlineCode();
                break;

            case Commands.insertInlineFormula:
                this.textOperationsService.execInlineFormula();
                break;

            case Commands.toggleItalic:
                this.textOperationsService.execItalic();
                break;

            case Commands.toggleUnderline:
                this.textOperationsService.execUnderline();
                break;

            case Commands.toggleStrikeThrough:
                this.textOperationsService.execStrikeThrough();
                break;

            case Commands.toggleHiliteColor:
                if (!value) {
                    throw new Error(`${Commands.toggleHiliteColor} requires a color value`);
                }
                this.textOperationsService.execHiliteColor(value);
                break;

            case Commands.toggleForeColor:
                if (!value) {
                    throw new Error(`${Commands.toggleForeColor} requires a color value`);
                }
                this.textOperationsService.execForeColor(value);
                break;

            case Commands.transformBlock:
                if (!value) {
                    throw new Error(`${Commands.transformBlock} requires a value that represents the target element type.`);
                }

                // if (!block) {
                //     throw new Error(`${Commands.transformBlock} requires a block.`);
                // }
                this.blockOperationsService.transformBlock(value, block);
                break;

            case Commands.duplicateBlock:
                this.blockOperationsService.execDuplicateBlock(block);
                break;

            case Commands.deleteBlock:
                this.blockOperationsService.execDeleteBlock(block);
                break;

            case Commands.deleteBlockAndFocusOnPrevious:
                this.blockOperationsService.execDeleteFocusOnPrevious();
                break;

            case Commands.deleteBlockAndFocusOnNext:
                this.blockOperationsService.execDeleteAndFocusOnNext();
                break;

            case Commands.focusOnNextBlock:
                this.blockOperationsService.execFocusOnNext();
                break;

            case Commands.removeFormat:
                this.execRemoveFormat(command);
                break;

            case Commands.JustifyLeft:
                if (DOMUtils.isSelectionInTableCell()) {
                    this.tableOperationsService.alignSelectedCells('left');
                } else {
                    if (!block) {
                        throw new Error(`${Commands.JustifyLeft} requires a block to justify.`);
                    }
                    this.blockOperationsService.justifyLeft(block);
                }
                break;

            case Commands.JustifyCenter:
                if (DOMUtils.isSelectionInTableCell()) {
                    this.tableOperationsService.alignSelectedCells('center');
                } else {
                    if (!block) {
                        throw new Error(`${Commands.JustifyCenter} requires a block to justify.`);
                    }
                    this.blockOperationsService.justifyCenter(block);
                }
                break;

            case Commands.JustifyRight:
                if (DOMUtils.isSelectionInTableCell()) {
                    this.tableOperationsService.alignSelectedCells('right');
                } else {
                    if (!block) {
                        throw new Error(`${Commands.JustifyRight} requires a block to justify.`);
                    }
                    this.blockOperationsService.justifyRight(block);
                }
                break;

            case Commands.changeCodeBlockLanguage:
                if (!block) {
                    throw new Error(`${Commands.changeCodeBlockLanguage} requires a block to change a code block language.`);
                }

                if (!value) {
                    throw new Error(`${Commands.changeCodeBlockLanguage} requires a value to change a code block language.`);
                }
                this.blockOperationsService.changeCodeBlockLanguage(block, value)
                break;

            case Commands.createDefaultBlock:
                this.execCreateDefaultBlock(command);
                break;

            case Commands.insertNew:
                this.execInsertNew(command);
                break;

            case Commands.focusOnPreviousBlock:
                this.execFocusOnPreviousBlock(command);
                break;

            case Commands.mergeWithNextBlock:
                this.blockOperationsService.execMergeWithNextBlock();
                break;

            case Commands.mergeWithPreviousBlock:
                this.blockOperationsService.execMergeWithPreviousBlock();
                break;

            case Commands.insertTableColumnLeft:
                this.tableOperationsService.insertColumnLeft();
                break;

            case Commands.insertTableColumnRight:
                this.tableOperationsService.insertColumnRight();
                break;

            case Commands.insertTableRowAbove:
                this.tableOperationsService.insertRowAbove();
                break;

            case Commands.insertTableRowBelow:
                this.tableOperationsService.insertRowBelow();
                break;


            case Commands.changeCalloutBackgroundColor:
                if (!block) {
                    throw new Error(`${Commands.changeCalloutBackgroundColor} requires a block.`);
                }

                if (!value) {
                    throw new Error(`${Commands.changeCalloutBackgroundColor} requires a value that represents the background color.`);
                }

                this.blockOperationsService.execChangeCalloutBackground(block, value);
                break;

            case Commands.toggleBlockCaption:
                if (!block) {
                    block = DOMUtils.getCurrentActiveBlock() as HTMLElement;
                }
                this.blockOperationsService.toggleCaption(block as HTMLElement);
                break;

            case Commands.removeColumn:
                this.tableOperationsService.removeColumn();
                break;
            case Commands.removeRow:
                this.tableOperationsService.removeRow();
                break;



            // case Commands.showInsertTableColumnElement:
            //     if (!block) {
            //         throw new Error(`${Commands.insertTableColumn} requires a block with a target table inside.`);
            //     }
            //     this.tableOperationsService.showInsertColumnElement(block);
            //     break;
            // case Commands.showInsertTableRowElement:
            //     if (!block) {
            //         throw new Error(`${Commands.insertTableColumn} requires a block with a target table inside.`);
            //     }
            //     this.tableOperationsService.showInsertLineElement(block);
            //     break;
            // case Commands.hideInsertTableColumnElement:
            //     if (!block) {
            //         throw new Error(`${Commands.insertTableColumn} requires a block with a target table inside.`);
            //     }
            //     this.tableOperationsService.hideInsertColumnElement(block);
            //     break;
            // case Commands.hideInsertTableRowElement:
            //     if (!block) {
            //         throw new Error(`${Commands.insertTableColumn} requires a block with a target table inside.`);
            //     }
            //     this.tableOperationsService.hideInsertRowElement(block);
            //     break;
            default:
                console.error(`No action defined for command: ${command}`);
        }
    }

    // private execTransformBlock(targetBlockType: string): boolean {
    //     this.blockOperationsService.transformBlock(targetBlockType);
    //     return true;
    // }

    private execRemoveFormat(command: Commands): boolean {
        const format = this.blockOperationsService.execCommand(command, false);

        const content = DOMUtils.getActiveContentEditable();
        if (content) {
            content.normalize();
        }

        return format;
    }

    private execCreateDefaultBlock(command: Commands): boolean {
        return this.blockOperationsService.execCommand(command, false);
    }

    private execInsertNew(command: Commands): boolean {
        return this.blockOperationsService.createNewElementAndSplitContent();
    }

    private execFocusOnPreviousBlock(command: Commands): boolean {
        return this.blockOperationsService.execCommand(command, false);
    }

    // private handleFocusOnFirstRequestedEvent = (command: Commands): void => {
    //     // alert("focus on first");
    //     this.blockOperationsService.execCommand(command, false);
    // }
}
