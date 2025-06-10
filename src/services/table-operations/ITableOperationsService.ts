export interface ITableOperationsService {
    insertRowAbove(): void;
    insertRowBelow(): void;
    insertColumnLeft(): void;
    insertColumnRight(): void;
    removeColumn(): void;
    removeRow(): void;
}