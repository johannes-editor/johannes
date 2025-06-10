export interface ITableOperationsService {
    /** Creates a table wrapper with the given size */
    createTable(rows: number, cols: number): HTMLElement;

    /** Row operations */
    insertRowAbove(): void;
    insertRowBelow(): void;
    removeRow(): void;

    /** Column operations */
    insertColumnLeft(): void;
    insertColumnRight(): void;
    removeColumn(): void;

    /** Other utilities */
    toggleHeader(): void;
    alignSelectedCells(alignment: 'left' | 'center' | 'right'): void;
}