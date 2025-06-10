export interface ITextOperationsService {
    execCopy(): void;
    execCut(): void;
    execReplace(): void;
    queryHiliteColor(expectedColor: string): boolean;
    queryForeColor(expectedColor: string): boolean;
    execToggleLink(): void;
    execInsertLink(url: string): void;
    execBold(): void;
    execItalic(): void;
    execStrikeThrough(): void;
    execInlineCode(): void;
    execInlineFormula(): void;
    execUnderline(): void
    execHiliteColor(value: string): void;
    execForeColor(value: string): void;
    queryCommandState(command: string, value?: string | null): boolean;
    lastDropdownColorChangeTime : number;
}