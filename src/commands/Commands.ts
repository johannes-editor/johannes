export enum Commands {
    /** Text operations commands */
    toggleBold = "bold",
    toggleItalic = "italic",
    toggleHiliteColor = "hiliteColor",
    changeCalloutBackgroundColor = "changeCalloutBackgroundColor",
    toggleForeColor = "foreColor",
    toggleInlineCode = "inlineCode",
    insertInlineFormula = "inlineFormula",
    toggleLink = "createLink",
    linkReadyToInsert = "linkReadyToInsert",
    toggleUnderline = "underline",
    toggleStrikeThrough = "strikeThrough",
    removeFormat = "removeFormat",
    copySelected = "copySelected",
    cutSelected = "cutSelected",
    paste = "paste",

    /** Block operations commands */
    transformBlock = "transformBlock",
    duplicateBlock = "duplicateBlock",
    deleteBlock = "deleteBlock",
    createDefaultBlock = "createDefaultBlock",
    focusOnNextBlock = "focusOnNextBlock",
    focusOnPreviousBlock = "focusOnPreviousBlock",
    mergeWithPreviousBlock = "mergeWithPreviousBlock",
    mergeWithNextBlock = "mergeWithNextBlock",
    focusOnFirstBlock = "focusOnFirstBlock",
    deleteBlockAndFocusOnPrevious = "deleteBlockAndFocusOnPrevious",
    deleteBlockAndFocusOnNext = "deleteBlockAndFocusOnNext",

    JustifyLeft = "justifyLeft",
    JustifyCenter = "justifyCenter",
    JustifyRight = "justifyRight",

    
    /** wildcard command context based*/
    insertNew = "insertNew",

    /** table commands */
    insertTableRowAbove = "insertTableRowAbove",
    insertTableRowBelow = "insertTableRowBelow",
    insertTableColumnLeft = "insertTableColumnLeft",
    insertTableColumnRight = "insertTableColumnRight",
    removeColumn = "removeColumn",
    removeRow = "removeRow",



    changeCodeBlockLanguage = "changeCodeBlockLanguage",

    toggleBlockCaption = "toggleBlockCaption"
}