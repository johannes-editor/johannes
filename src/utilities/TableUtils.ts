import { Directions } from "@/common/Directions";
import { TableScopes } from "@/services/table-operations/TableScopes";
import { ElementFactoryService } from "@/services/element-factory/ElementFactoryService";

export class TableUtils {

    static addRow(table: HTMLTableElement, position: number | null = null): void {
        const insertPosition = (position !== null && position >= 0 && position <= table.rows.length) ? position : table.rows.length;
        const newRow = table.insertRow(insertPosition);

        const numColumns = Array.from(table.rows).reduce((max, row) => Math.max(max, row.cells.length), 0);
        let affectedCells = [];

        for (let i = 0; i < numColumns; i++) {
            const cell = newRow.insertCell();
            cell.contentEditable = "true";
            cell.setAttribute("data-placeholder", "Enter text");
            cell.classList.add("editable");
            ElementFactoryService.initEditableContent(cell, null);
            affectedCells.push(cell);
        }

        setTimeout(() => {
            affectedCells.forEach(cell => cell.classList.remove("temporary-shadow"));
        }, 700);
    }

    static addColumn(table: HTMLTableElement, position: number | null = null): void {
        const insertPosition = position !== null ? position : undefined;
        let affectedCells = [];

        for (let i = 0; i < table.rows.length; i++) {
            const cell = table.rows[i].insertCell(insertPosition);
            cell.contentEditable = "true";
            cell.setAttribute("data-placeholder", "cell");
            cell.classList.add("editable");
            ElementFactoryService.initEditableContent(cell, null);
            affectedCells.push(cell);
        }

        setTimeout(() => {
            affectedCells.forEach(cell => cell.classList.remove("temporary-shadow"));
        }, 700);
    }


    static isLastColumn(table: HTMLTableElement, cell: HTMLTableCellElement): boolean {
        if (!table.contains(cell)) {
            return false;
        }

        const cellRow = cell.parentElement as HTMLTableRowElement;
        const lastCellInRow = cellRow.cells[cellRow.cells.length - 1];
        return cell === lastCellInRow;
    }

    static isLastRow(table: HTMLTableElement, cell: HTMLTableCellElement): boolean {
        if (!table.contains(cell)) {
            return false;
        }

        const cellRow = cell.parentElement as HTMLTableRowElement;
        const lastRowInTable = table.rows[table.rows.length - 1];
        return cellRow === lastRowInTable;
    }

    static removeColumnByCell(cell: HTMLTableCellElement): void {
        if (cell.tagName.toLowerCase() !== "td" && cell.tagName.toLowerCase() !== "th") {
            throw new Error("The provided element is not a table cell.");
        }

        const row = cell.parentElement as HTMLTableRowElement;
        const table = row.parentElement as HTMLTableElement;
        const columnIndex = cell.cellIndex;

        for (let i = 0; i < table.rows.length; i++) {
            if (columnIndex < table.rows[i].cells.length) {
                table.rows[i].deleteCell(columnIndex);
            }
        }
    }

    static removeRowByCell(cell: HTMLTableCellElement): void {
        if (cell.tagName.toLowerCase() !== "td" && cell.tagName.toLowerCase() !== "th") {
            throw new Error("The provided element is not a table cell.");
        }

        const row = cell.parentElement as HTMLTableRowElement;
        const table = row.parentElement as HTMLTableElement;

        table.deleteRow(row.rowIndex);
    }

    static getActiveTableCell(): HTMLTableCellElement | null {
        const activeElement = document.activeElement;

        if (activeElement?.tagName.toLowerCase() === 'td') {
            return activeElement as HTMLTableCellElement;
        }

        return activeElement?.closest('td') as HTMLTableCellElement || null;
    }

    static getLastTableCell(table: HTMLTableElement): HTMLElement | null {
        for (let i = table.rows.length - 1; i >= 0; i--) {
            const row = table.rows[i];
            for (let j = row.cells.length - 1; j >= 0; j--) {
                const cell = row.cells[j];
                if (cell.isContentEditable) return cell;
            }
        }
        return null;
    }

    static getFirstTableCell(table: HTMLTableElement): HTMLElement | null {
        for (let i = 0; i < table.rows.length; i++) {
            const row = table.rows[i];
            for (let j = 0; j < row.cells.length; j++) {
                const cell = row.cells[j];
                if (cell.isContentEditable) return cell;
            }
        }
        return null;
    }

    static getNeighborCell(table: HTMLTableElement, cell: HTMLTableCellElement, direction: Directions): HTMLTableCellElement | null {

        if (!cell.parentElement) {
            return null;
        }

        const rowIndex = (cell.parentElement as HTMLTableRowElement).rowIndex;
        const cellIndex = cell.cellIndex;

        switch (direction) {
            case Directions.ArrowRight:
                return (cell.parentElement as HTMLTableRowElement).cells[cellIndex + 1] ?? null;
            case Directions.ArrowLeft:
                return (cell.parentElement as HTMLTableRowElement).cells[cellIndex - 1] ?? null;
            case Directions.ArrowUp:
                return table.rows[rowIndex - 1]?.cells[cellIndex] ?? null;
            case Directions.ArrowDown:
                return table.rows[rowIndex + 1]?.cells[cellIndex] ?? null;
        }

        return null;
    }

    static changeCellBorderColor(
        table: HTMLTableElement,
        scope: TableScopes,
        color: string
    ) {
        let cellsToChange: NodeListOf<HTMLTableCellElement> | HTMLCollectionOf<HTMLTableCellElement> | null = null;

        switch (scope) {
            case TableScopes.Column:
                const columnIndex = (table.querySelector("td.selected") as HTMLTableCellElement)?.cellIndex;
                if (columnIndex !== undefined) {
                    cellsToChange = table.querySelectorAll(`td:nth-child(${columnIndex + 1})`);
                }
                break;
            case TableScopes.Row:
                const selectedCell = table.querySelector("td.selected") as HTMLTableCellElement;
                if (selectedCell) {
                    const row = selectedCell.parentElement as HTMLTableRowElement;
                    cellsToChange = row.cells;
                }
                break;
            case TableScopes.Cell:
                cellsToChange = table.querySelectorAll("td.selected") as NodeListOf<HTMLTableCellElement>;
                break;
            case TableScopes.SelectedCells:
                cellsToChange = table.querySelectorAll("td.selected") as NodeListOf<HTMLTableCellElement>;
                break;
            default:
                throw new Error("Invalid scope.");
        }

        if (cellsToChange) {
            Array.from(cellsToChange).forEach((cell) => {
                cell.style.border = `1px double ${color}`;
            });
        }
    }

    static moveFocusToBelowCell(table: HTMLTableElement, cell: HTMLTableCellElement): boolean {
        const nextRow = cell.parentElement?.nextElementSibling as HTMLTableRowElement | null;
        if (!nextRow) {
            return false;
        }

        const cellIndex = cell.cellIndex;
        const belowCell = nextRow.cells[cellIndex];
        if (!belowCell || !belowCell.isContentEditable) {
            return false;
        }

        belowCell.focus();
        return true;
    }
}