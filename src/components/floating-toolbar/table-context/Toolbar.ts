import { FloatingToolbarBase } from "../base/FloatingToolbarBase";
import { IFocusStack } from "@/core/IFocusStack";
import { DependencyContainer } from "@/core/DependencyContainer";
import { ITableContextFloatingToolbar } from "./ITableContextFloatingToolbar";
import { ZIndex } from "@/common/ZIndex";
import { Directions } from "../../../common/Directions";
import { DefaultJSEvents } from "../../../common/DefaultJSEvents";
import { DOMElements } from "../../../common/DOMElements";
import { TableUtils } from "@/utilities/TableUtils";
import { KeyboardKeys } from "@/common/KeyboardKeys";
import { Toolbar as TextContextFloatingToolbar } from "../text-context/Toolbar";
import { SelectionModes } from "./SelectionMode";
import { Colors } from "@/common/Colors";
import { DOMUtils } from "@/utilities/DOMUtils";
import { EventEmitter } from "@/commands/EventEmitter";
import { ITableOperationsService } from "@/services/table-operations/ITableOperationsService";
import { CustomUIEvents } from "@/common/CustomUIEvents";
import { IUIEventDetail } from "@/commands/IUIEventDetail";
import { Utils } from "@/utilities/Utils";

export class Toolbar extends FloatingToolbarBase implements ITableContextFloatingToolbar {

    private static id: string = "tableFloatingToolbar";
    private static instance: Toolbar;

    focusStack: IFocusStack;
    selectedCells: HTMLTableCellElement[] = [];
    actualFocusedCell: HTMLTableCellElement | null = null;

    tableOperationsService: ITableOperationsService;
    controller: AbortController;

    selectionMode: SelectionModes = SelectionModes.Text;
    selectionFlag: boolean = false;
    selectedText: string = "";

    private constructor(focusStack: IFocusStack, tableOperationsService: ITableOperationsService) {

        if (Toolbar.instance) {
            throw new Error("Use TableContextFloatingToolbar.getInstance() to get instance.");
        }

        super(Toolbar.id);
        this.clearAndHide = this.clearAndHide.bind(this);
        this.htmlElement.style.zIndex = ZIndex.ModeratelyImportant;
        this.controller = new AbortController();
        this.focusStack = focusStack;
        this.tableOperationsService = tableOperationsService;

        this.attachEvents();
    }

    attachEvents(): void {
        document.addEventListener(DefaultJSEvents.Mousedown, this.handleMouseDown.bind(this));
        document.addEventListener(DefaultJSEvents.Mousemove, this.handleMouseMove.bind(this));
        document.addEventListener(DefaultJSEvents.Mouseup, this.handleMouseUp.bind(this));

        document.addEventListener(DefaultJSEvents.Keydown, this.handleStartSelectionInCellKeyDown.bind(this));
        document.addEventListener(DefaultJSEvents.Keydown, this.handleCellSelectionContinuationOnKeyDown.bind(this));
        document.addEventListener(DefaultJSEvents.Keydown, this.handleKeyDown.bind(this));
        document.addEventListener(DefaultJSEvents.Keyup, this.handleKeyUp.bind(this));

        this.attachUIEvent();

        super.attachEvents();
    }

    private handleMouseDown(event: MouseEvent) {

        const target = event.target as HTMLElement;
        const cell = target.closest(DOMElements.TD) as HTMLTableCellElement;

        if (cell && !cell.matches('.figure-embed-container td')) {

            event.stopImmediatePropagation();

            this.controller.abort();

            if (cell != this.actualFocusedCell) {
                this.hide();
            }

            this.clearAll();
            this.addSelectedCell(cell);
            this.selectionFlag = true;
            this.selectionMode = SelectionModes.Text;
        }
    }

    private handleMouseMove(event: MouseEvent) {
        if (this.selectionFlag) {

            const target = event.target as HTMLElement;
            const cell = target.closest(DOMElements.TD) as HTMLTableCellElement;

            if (cell) {
                this.updateSelectionModeByMouseEvent(event);
                if (this.selectionMode == SelectionModes.Cell) {

                    event.stopImmediatePropagation();
                    event.preventDefault();

                    if (this.canHide) {
                        this.hide();
                    }

                    this.addSelectedCell(cell);
                    document.getSelection()?.removeAllRanges();
                }
            }
        }
    }

    private handleMouseUp(event: MouseEvent) {
        if (this.selectedCells.length > 0 && this.selectionFlag) {

            if (!Utils.isEventFromContentWrapper(event)) {
                return;
            }

            this.resetSelectionState();
            this.show();
        }
    }

    private handleKeyDown(event: KeyboardEvent) {

        if (event.key !== KeyboardKeys.Enter && event.key !== KeyboardKeys.Escape) {
            return;
        }

        if(!Utils.isEventFromContentWrapper(event)){
            return;
        }

        const target = event.target as HTMLElement;
        const currentCell = target.closest(DOMElements.TD) as HTMLTableCellElement;

        if (currentCell && !currentCell.matches('.gist td')) {

            if (event.key == KeyboardKeys.Enter && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.stopImmediatePropagation();
                // alert("jump to next line");
            } else if (event.key == KeyboardKeys.Escape && this.canHide && !TextContextFloatingToolbar.getInstance().isVisible) {

                setTimeout(() => {
                    if (this.canHide) {
                        event.stopImmediatePropagation();
                        this.clearAll();
                        this.hide();
                    }
                }, 10);
            }
        }
    }

    private handleStartSelectionInCellKeyDown(event: KeyboardEvent) {

        if (event.key !== KeyboardKeys.Shift) {
            return;
        }

        if (!Utils.isEventFromContentWrapper(event)) {
            return;
        }

        const target = event.target as HTMLElement;
        const currentCell = target.closest(DOMElements.TD) as HTMLTableCellElement;

        if (currentCell && !currentCell.matches('.gist td')) {
            if (!event.repeat && event.key === KeyboardKeys.Shift) {

                event.stopImmediatePropagation();

                this.controller.abort();
                this.selectionFlag = true;
                this.selectionMode = SelectionModes.Text;
                this.addSelectedCell(currentCell);

            }
        }
    }

    private handleCellSelectionContinuationOnKeyDown(event: KeyboardEvent) {

        if (!event.shiftKey && !event.key.startsWith('Arrow')) {
            return;
        }

        if (!Utils.isEventFromContentWrapper(event)) {
            return;
        }

        if (this.selectionFlag) {
            const target = event.target as HTMLElement;
            const currentCell = target.closest(DOMElements.TD) as HTMLTableCellElement;

            if (currentCell && !currentCell.matches('.gist td')) {
                if (this.selectionMode == SelectionModes.Cell && event.shiftKey && event.key.startsWith('Arrow') && !event.repeat) {

                    event.stopImmediatePropagation();
                    event.preventDefault();

                    const table = currentCell.closest(DOMElements.TABLE)!;
                    const nextCell = TableUtils.getNeighborCell(table, currentCell, event.key as Directions);

                    this.addSelectedCell(currentCell);

                    if (nextCell) {
                        this.addSelectedCell(nextCell);
                    }
                }
            }
        }
    }

    normalizeText(text: string) {
        return text
            .replace(/\s+/g, ' ')
            .trim();
    }

    private updateTheSelectionModeByCurrentSelectionState(event: KeyboardEvent): void {
        if (this.selectionFlag) {
            const selection = document.getSelection();
            if (selection) {
                const actualSelection = this.normalizeText(selection.toString().trim());
                const target = event.target as HTMLElement;
                const currentCell = target.closest(DOMElements.TD) as HTMLTableCellElement;

                if (currentCell.matches('.gist td')) {
                    return;
                }

                const currentCellText = this.normalizeText((currentCell.textContent || "").trim());

                const { atStart, atEnd } = DOMUtils.getSelectionTextInfo(currentCell);

                // This interaction keeps the menu visible after all text is selected, enhancing user engagement. 
                // If the user presses a directional key again beyond this point, the menu is hidden and cell selection mode is initiated, 
                // streamlining the interface and focusing on subsequent tasks.
                if (currentCellText === "" || (actualSelection === this.selectedText.trim() && (atStart || atEnd))) {
                    this.selectionMode = SelectionModes.Cell;
                    this.selectedText = "";
                    if (this.canHide) {
                        this.hide();
                    }
                } else if (actualSelection) {
                    this.selectedText = actualSelection;
                }
            }
        }
    }

    private updateSelectionModeByMouseEvent(event: MouseEvent): void {

        if (this.selectionFlag && this.actualFocusedCell) {

            const cellRect = this.actualFocusedCell.getBoundingClientRect();

            const mouseX = event.clientX;
            const mouseY = event.clientY;

            if (!(mouseX >= cellRect.left && mouseX <= cellRect.right && mouseY >= cellRect.top && mouseY <= cellRect.bottom)) {
                this.selectionMode = SelectionModes.Cell;
                if (this.canHide) {
                    this.hide();
                }
            }
        }
    }

    private handleKeyUp(event: KeyboardEvent) {

        if (event.key !== KeyboardKeys.Shift) {
            return;
        }

        if(!Utils.isEventFromContentWrapper(event)){
            return;
        }

        const target = event.target as HTMLElement;
        const currentCell = target.closest(DOMElements.TD) as HTMLTableCellElement;

        if (currentCell) {

            event.stopImmediatePropagation();

            this.updateTheSelectionModeByCurrentSelectionState(event);

            if (event.key === KeyboardKeys.Shift) {
                this.resetSelectionState();

                if (this.selectedCells.length > 0) {
                    this.show();
                }
            }
        }
    }

    private addSelectedCell(cell: HTMLTableCellElement) {
        if (this.selectedCells.length === 0) {
            this.selectedCells.push(cell);
            cell.classList.add('selected');
            this.actualFocusedCell = cell;
            cell.focus();
            return;
        } else {
            const lastSelectedCell = this.selectedCells[this.selectedCells.length - 1];
            const lastSelectedCellTable = lastSelectedCell.closest('table');
            const currentCellTable = cell.closest('table');

            if (lastSelectedCellTable === currentCellTable) {
                const index = this.selectedCells.indexOf(cell);
                if (index === -1) {
                    this.selectedCells.push(cell);
                    cell.classList.add('selected');
                    this.actualFocusedCell = cell;
                    cell.focus();
                } else {
                    this.actualFocusedCell = cell;
                    cell.focus();
                }
            }
        }

    }

    attachUIEvent() {
        document.addEventListener(CustomUIEvents.CloseElement, this.handleCloseElementEvent.bind(this));
    }

    handleCloseElementEvent(event: Event) {

        const customEvent = event as CustomEvent<IUIEventDetail>;
        const details = customEvent.detail;

        if (Toolbar.id == details.targetId!) {
            this.clearAndHide();
        }
    }

    show(): void {

        if (!this.actualFocusedCell) {
            console.error('No focused cell found');
            return;
        }

        this.resetAbortController();
        this.focusStack.push(this.actualFocusedCell);
        this.changeToolbarPositionToBeClosedTo(this.actualFocusedCell);
        this.processSelectionChangeEffects();

        const block = this.actualFocusedCell.closest(".block");
        let blockToolbar: HTMLElement | null = null;

        if (block) {
            blockToolbar = block.querySelector(".block-toolbar") as HTMLElement;
            blockToolbar.classList.add("d-none");
        }

        super.show();

        this.actualFocusedCell.addEventListener(DefaultJSEvents.Blur, () => this.clearAndHide(blockToolbar), { signal: this.controller.signal });
    }

    processSelectionChangeEffects() {

        EventEmitter.emitResetActiveButtonsElementEvent("backgroundColor");

        const backgroundColors: { [key: string]: boolean } = {};
        backgroundColors[Colors.BackgroundColorRed] = this.tableOperationsService.queryAllStateCellBackgroundColor(this.selectedCells, Colors.BackgroundColorRed);
        backgroundColors[Colors.BackgroundColorGreen] = this.tableOperationsService.queryAllStateCellBackgroundColor(this.selectedCells, Colors.BackgroundColorGreen);
        backgroundColors[Colors.BackgroundColorBlue] = this.tableOperationsService.queryAllStateCellBackgroundColor(this.selectedCells, Colors.BackgroundColorBlue);
        backgroundColors[Colors.BackgroundColorYellow] = this.tableOperationsService.queryAllStateCellBackgroundColor(this.selectedCells, Colors.BackgroundColorYellow);
        backgroundColors[Colors.BackgroundColorGrey] = this.tableOperationsService.queryAllStateCellBackgroundColor(this.selectedCells, Colors.BackgroundColorGrey);

        Object.entries(backgroundColors).forEach(([color, active]) => {
            if (active) {
                EventEmitter.emitShowHideActiveElementEvent("backgroundColor", color, "show");
            }
        });
    }

    changeToolbarPositionToBeClosedTo(element: HTMLElement): void {
        const rect = element.getBoundingClientRect();

        this.htmlElement.style.display = 'flex';

        const elementWidth = this.htmlElement.offsetWidth;
        let leftPosition = rect.left + window.scrollX + 0;

        if (leftPosition + elementWidth > window.innerWidth) {
            leftPosition = window.innerWidth - elementWidth - 20;
        }

        const elementHeight = this.htmlElement.offsetHeight;
        let topPosition = rect.top + window.scrollY - elementHeight - 10;

        if (topPosition < 0) {
            topPosition = rect.bottom + window.scrollY + 10;
        }

        this.htmlElement.style.left = `${leftPosition}px`;
        this.htmlElement.style.top = `${topPosition}px`;
    }

    resetSelectionState(): void {
        this.selectionMode = SelectionModes.Text;
        this.selectionFlag = false;
        this.selectedText = "";
    }

    clearAll(): void {
        this.actualFocusedCell = null;
        const allTableCells = document.querySelectorAll('td');
        allTableCells.forEach(cell => cell.classList.remove('selected'));
        this.selectedCells = [];
    }

    hide(): void {
        if (this.canHide) {
            super.hide();
        }
    }

    clearAndHide(blockToolbar: HTMLElement | null = null): void {

        if (blockToolbar) {
            blockToolbar.classList.remove("d-none");
        }

        this.clearAll();
        this.hide();
    }

    private resetAbortController(): void {
        this.controller = new AbortController();
    }

    static getInstance() {
        const focusStack = DependencyContainer.Instance.resolve<IFocusStack>("IFocusStack");
        const tableOperationsService = DependencyContainer.Instance.resolve<ITableOperationsService>("ITableOperationsService");
        return new Toolbar(focusStack, tableOperationsService);
    }
}