export enum CommonClasses {
    /** 
     * Class name for the main content elements within blocks. This class is used to indicate
     * which elements contain the actual content that should be considered for operations like
     * styling or interaction.
     */
    ContentElement = "johannes-content-element",
     /**
    * Class name for elements that should be ignored during save or export operations.
    * Applied specifically to editing UI components within the `.content` element to ensure
    * they are not preserved in the saved or exported output. Elements outside the `.content`
    * should not receive this class as it would lead to the loss of event listeners upon actions
    * like undo or redo, which rely on these elements being consistently available.
    * Elements marked with `EditorOnly` inside the content do not retain persistent listeners;
    * they exist only transiently during the edit session, such as the `BlockToolbox`, which
    * is recreated rather than saved.
    */
    EditorOnly = "editor-only",
    /**
     * Class name used to define a content block. Blocks are fundamental structural elements
     * in the layout that may contain text, images, or other types of content. This class
     * helps in applying consistent styling and behavior to content blocks.
     */
    Block = "block",
    /**
    * Class name used to trigger the display of the MediaInputter component upon a click event.
    * When an element with this class is clicked, the MediaInputter listens for the event
    * and activates, providing a user interface for entering a URL for an embed or uploading a file.
    *
    * This class facilitates user interaction for embedding media content directly into the document,
    * streamlining the process of adding multimedia elements like images, videos, or other embedded content.
    */
    ShowMediaInputOnClick = "show-media-input-on-click",
    ShowMediaInputUpload =  "show-media-input-upload",
    ShowMediaInputEmbed =  "show-media-input-embed",

    ShowMathInputOnClick = "show-math-input-on-click",

    BlockToolbarWrapper = "block-toolbar-wrapper"
}