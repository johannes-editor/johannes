import { ITableOperationsService } from "./ITableOperationsService";

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
        if (event.key === 'ArrowDown') {
            const nextRow = table.rows[row.rowIndex + 1];
            if (nextRow && nextRow.cells[cell.cellIndex]) {
                (nextRow.cells[cell.cellIndex] as HTMLElement).focus();
                event.preventDefault();
            } else {
                const nextBlock = (table.closest('.block') as HTMLElement)?.nextElementSibling as HTMLElement | null;
                const target = nextBlock?.querySelector('[contenteditable]') as HTMLElement | null;
                if (target) {
                    target.focus();
                    event.preventDefault();
                }
            }
        } else if (event.key === 'ArrowUp') {
            const prevRow = table.rows[row.rowIndex - 1];
            if (prevRow && prevRow.cells[cell.cellIndex]) {
                (prevRow.cells[cell.cellIndex] as HTMLElement).focus();
                event.preventDefault();
            } else {
                const prevBlock = (table.closest('.block') as HTMLElement)?.previousElementSibling as HTMLElement | null;
                const target = prevBlock?.querySelector('[contenteditable]') as HTMLElement | null;
                if (target) {
                    target.focus();
                    event.preventDefault();
                }
            }
        }
    }

    private selectRange(toCell: HTMLTableCellElement) {
        if (!this.lastSelected) return;
        const table = toCell.closest('table') as HTMLTableElement;
        const startRow = Math.min(this.lastSelected.parentElement!.rowIndex, toCell.parentElement!.rowIndex);
        const endRow = Math.max(this.lastSelected.parentElement!.rowIndex, toCell.parentElement!.rowIndex);
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
