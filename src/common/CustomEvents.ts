export enum CustomEvents {
    //Component events
    floatingToolbarDisplayed = "floatingToolbarDisplayed",

    //Text click edit events
    anchorButtonClicked = "anchorButtonClicked",
    boldButtonClicked = "boldButtonClicked",
    italicButtonClicked = "italicButtonClicked",
    underlineButtonClicked = "underlineButtonClicked",
    inlineCodeButtonClicked = "inlineCodeButtonClicked",
    strikeThroughButtonClicked = "strikeThroughButtonClicked",
    hiliteColorButtonClicked = "hiliteColorButtonClicked",
    foreColorButtonClicked = "foreColorButtonClicked",
    
    buttonGroupItemClicked = "buttonGroupItemClicked",
    focusOnFirstRequested = "focusOnFirstRequested",
    pressedEnterOnTitle = "pressedEnterOnTitle",
    
    transformBlockRequested = "transformBlockRequested",
    duplicateBlockRequested = "duplicateBlockRequested",

    documentChanged = "documentChanged",

    //Text edit events
    anchor = "anchor",
    bold = "bold",
    italic = "italic",
    underline = "underline",
    inlineCode = "inlineCode",
    strikeThrough = "strikeThrough",
    hiliteColor = "hiliteColor",
    foreColor = "foreColor",


    textFormatChanged = "textFormatChanged",
    emittedCommand = "emittedCommand",
    blockTypeChanged = "blockTypeChanged",
    blockDeleted = "blockDeleted",
    blockCloned = "blockCloned",
    tableCellChanged = "tableCellChanged",



    //Block commands
    
}