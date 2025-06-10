import { ITableOperationsService } from "./ITableOperationsService";
import { ElementFactoryService } from "../element-factory/ElementFactoryService";
import { DOMUtils } from "@/utilities/DOMUtils";

export class TableOperationsService implements ITableOperationsService {
    private static instance: TableOperationsService;
    private lastSelected: HTMLTableCellElement | null = null;
    private selectedCells: HTMLTableCellElement[] = [];

    private constructor() {
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    static getInstance(): TableOperationsService {
        if (!this.instance) {
            this.instance = new TableOperationsService();
        }
        return this.instance;
    }

    createTable(rows: number, cols: number): HTMLElement {
        const wrapper = ElementFactoryService.getInstance().create(ElementFactoryService.ELEMENT_TYPES.TABLE);
        const table = wrapper.querySelector('table') as HTMLTableElement;
        const tbody = table.querySelector('tbody') as HTMLTableSectionElement;
        tbody.innerHTML = '';
        for (let i = 0; i < rows; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('td');
                this.prepareCell(cell);
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }
        return wrapper;
    }

    insertRowAbove(): void {
        const cell = this.getActiveCell();
        if (!cell) return;
        const row = cell.parentElement as HTMLTableRowElement;
        const table = row.closest('table') as HTMLTableElement;
        const newRow = table.insertRow(row.rowIndex);
        this.fillRow(newRow, row.cells.length);
    }

    insertRowBelow(): void {
        const cell = this.getActiveCell();
        if (!cell) return;
        const row = cell.parentElement as HTMLTableRowElement;
        const table = row.closest('table') as HTMLTableElement;
        const newRow = table.insertRow(row.rowIndex + 1);
        this.fillRow(newRow, row.cells.length);
    }

    insertColumnLeft(): void {
        const cell = this.getActiveCell();
        if (!cell) return;
        const table = cell.closest('table') as HTMLTableElement;
        const index = cell.cellIndex;
        Array.from(table.rows).forEach(r => {
            const c = (r as HTMLTableRowElement).insertCell(index);
            this.prepareCell(c);
        });
    }

    insertColumnRight(): void {
        const cell = this.getActiveCell();
        if (!cell) return;
        const table = cell.closest('table') as HTMLTableElement;
        const index = cell.cellIndex + 1;
        Array.from(table.rows).forEach(r => {
            const c = (r as HTMLTableRowElement).insertCell(index);
            this.prepareCell(c);
        });
    }

    removeRow(): void {
        const cell = this.getActiveCell();
        if (!cell) return;
        const row = cell.parentElement as HTMLTableRowElement;
        row.remove();
    }

    removeColumn(): void {
        const cell = this.getActiveCell();
        if (!cell) return;
        const table = cell.closest('table') as HTMLTableElement;
        const index = cell.cellIndex;
        Array.from(table.rows).forEach(r => {
            if ((r as HTMLTableRowElement).cells[index]) {
                (r as HTMLTableRowElement).deleteCell(index);
            }
        });
    }

    toggleHeader(): void {
        const cell = this.getActiveCell();
        if (!cell) return;
        const table = cell.closest('table') as HTMLTableElement;
        const tbody = table.querySelector('tbody') as HTMLTableSectionElement;
        let thead = table.querySelector('thead');
        if (thead) {
            const headerRow = thead.rows[0];
            const newRow = document.createElement('tr');
            Array.from(headerRow.cells).forEach(th => {
                const td = document.createElement('td');
                td.innerHTML = (th as HTMLElement).innerHTML;
                this.prepareCell(td);
                newRow.appendChild(td);
            });
            thead.remove();
            tbody.insertBefore(newRow, tbody.firstChild);
        } else {
            const firstRow = tbody.rows[0];
            if (!firstRow) return;
            thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            Array.from(firstRow.cells).forEach(td => {
                const th = document.createElement('th');
                th.innerHTML = (td as HTMLElement).innerHTML;
                this.prepareCell(th);
                headerRow.appendChild(th);
            });
            tbody.removeChild(firstRow);
            thead.appendChild(headerRow);
            table.insertBefore(thead, tbody);
        }
    }

    alignSelectedCells(alignment: 'left' | 'center' | 'right'): void {
        const targets = this.selectedCells.length ? this.selectedCells : [this.getActiveCell()].filter((c): c is HTMLTableCellElement => !!c);
        targets.forEach(c => (c.style.textAlign = alignment));
    }

    /* selection logic */
    private handleMouseDown(event: MouseEvent) {
        const cell = (event.target as HTMLElement).closest('td,th') as HTMLTableCellElement | null;
        if (!cell) {
            this.clearSelection();
            return;
        }
        if (event.shiftKey && this.lastSelected && this.lastSelected.closest('table') === cell.closest('table')) {
            this.selectRange(cell);
        } else {
            this.clearSelection();
            cell.classList.add('selected');
            this.selectedCells = [cell];
            this.lastSelected = cell;
        }
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (!event.key.startsWith('Arrow')) return;
        const cell = (event.target as HTMLElement).closest('td,th') as HTMLTableCellElement | null;
        if (!cell) return;
        const table = cell.closest('table') as HTMLTableElement;
        const row = cell.parentElement as HTMLTableRowElement;

        const moveFocus = (targetCell: HTMLTableCellElement | null, fallbackBlock: HTMLElement | null, placeStart: boolean) => {
            if (targetCell) {
                targetCell.focus();
                event.preventDefault();
            } else if (fallbackBlock) {
                const editable = fallbackBlock.querySelector('[contenteditable]') as HTMLElement | null;
                if (editable) {
                    editable.focus();
                    placeStart ? DOMUtils.placeCursorAtStartOfEditableElement(editable) : DOMUtils.placeCursorAtEndOfEditableElement(editable);
                    event.preventDefault();
                }
            }
        };

        switch (event.key) {
            case 'ArrowDown': {
                const nextRow = table.rows[row.rowIndex + 1];
                const nextCell = nextRow ? nextRow.cells[cell.cellIndex] as HTMLTableCellElement | undefined : undefined;
                const nextBlock = (table.closest('.block') as HTMLElement)?.nextElementSibling as HTMLElement | null;
                moveFocus(nextCell || null, nextBlock, true);
                break;
            }
            case 'ArrowUp': {
                const prevRow = table.rows[row.rowIndex - 1];
                const prevCell = prevRow ? prevRow.cells[cell.cellIndex] as HTMLTableCellElement | undefined : undefined;
                const prevBlock = (table.closest('.block') as HTMLElement)?.previousElementSibling as HTMLElement | null;
                moveFocus(prevCell || null, prevBlock, false);
                break;
            }
            case 'ArrowRight': {
                const info = DOMUtils.getSelectionTextInfo(cell);
                if (!info.atEnd) return;
                const nextCell = row.cells[cell.cellIndex + 1] as HTMLTableCellElement | undefined;
                let targetCell: HTMLTableCellElement | null = null;
                if (nextCell) {
                    targetCell = nextCell;
                } else {
                    const nextRow = table.rows[row.rowIndex + 1];
                    targetCell = nextRow ? nextRow.cells[0] as HTMLTableCellElement | undefined || null : null;
                }
                const nextBlock = !targetCell ? (table.closest('.block') as HTMLElement)?.nextElementSibling as HTMLElement | null : null;
                moveFocus(targetCell, nextBlock, true);
                break;
            }
            case 'ArrowLeft': {
                const info = DOMUtils.getSelectionTextInfo(cell);
                if (!info.atStart) return;
                const prevCell = row.cells[cell.cellIndex - 1] as HTMLTableCellElement | undefined;
                let targetCell: HTMLTableCellElement | null = null;
                if (prevCell) {
                    targetCell = prevCell;
                } else {
                    const prevRow = table.rows[row.rowIndex - 1];
                    targetCell = prevRow ? prevRow.cells[prevRow.cells.length - 1] as HTMLTableCellElement | undefined || null : null;
                }
                const prevBlock = !targetCell ? (table.closest('.block') as HTMLElement)?.previousElementSibling as HTMLElement | null : null;
                moveFocus(targetCell, prevBlock, false);
                break;
            }
        }
    }

    private selectRange(toCell: HTMLTableCellElement) {
        if (!this.lastSelected) return;
        const table = toCell.closest('table') as HTMLTableElement;
        const startRow = Math.min(
            (this.lastSelected.parentElement as HTMLTableRowElement).rowIndex,
            (toCell.parentElement as HTMLTableRowElement).rowIndex
        );
        const endRow = Math.max(
            (this.lastSelected.parentElement as HTMLTableRowElement).rowIndex,
            (toCell.parentElement as HTMLTableRowElement).rowIndex
        );
        const startCol = Math.min(this.lastSelected.cellIndex, toCell.cellIndex);
        const endCol = Math.max(this.lastSelected.cellIndex, toCell.cellIndex);
        this.clearSelection();
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startCol; j <= endCol; j++) {
                const c = table.rows[i].cells[j];
                c.classList.add('selected');
                this.selectedCells.push(c as HTMLTableCellElement);
            }
        }
    }

    private clearSelection() {
        this.selectedCells.forEach(c => c.classList.remove('selected'));
        this.selectedCells = [];
    }

    private fillRow(row: HTMLTableRowElement, cols: number) {
        for (let i = 0; i < cols; i++) {
            const cell = row.insertCell();
            this.prepareCell(cell);
        }
    }

    private prepareCell(cell: HTMLTableCellElement) {
        cell.contentEditable = 'true';
        cell.classList.add('editable');
        cell.setAttribute('data-placeholder', 'cell');
        cell.innerHTML = '<br>';
    }

    private getActiveCell(): HTMLTableCellElement | null {
        const active = document.activeElement as HTMLElement | null;
        return active?.closest('td,th') as HTMLTableCellElement | null;
    }
}
