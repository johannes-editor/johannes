import { IBlockToolbox } from "./IBlockToolbox";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { ToolboxOptions } from "./ToolboxOptions";
import { BlockToolboxBuilder } from "@/builders/BlockToolboxBuilder";
import { DOMElements } from "@/common/DOMElements";
import { CommonClasses } from "@/common/CommonClasses";
import { DOMUtils } from "@/utilities/DOMUtils";
import { Utils } from "@/utilities/Utils";
import { ContentTypes } from "@/common/ContentTypes";

export class BlockToolbox implements IBlockToolbox {

    private static instance: BlockToolbox;

    static languageMap: { [key: string]: string } = {
        // "1c": "1C",
        // "abnf": "ABNF", 
        // "accesslog": "Access Logs", 
        // "actionscript": "ActionScript", 
        "ada": "Ada",
        //"angelscript": "AngelScript", 
        "apache": "Apache Config",
        "applescript": "AppleScript",
        "arduino": "Arduino",
        // "armasm": "ARM Assembly", 
        "asciidoc": "AsciiDoc",
        // "asm": "Assembly", 
        // "autohotkey": "AutoHotkey", 
        // "autoit": "AutoIt", 
        "bash": "Bash",
        "basic": "BASIC",
        "c": "C",
        "csharp": "C#",
        "cpp": "C++",
        "css": "CSS",
        // "clojure": "Clojure", 
        "coffeescript": "CoffeeScript",
        // "d": "D", 
        "dart": "Dart",
        // "delphi": "Delphi", 
        // "elixir": "Elixir", 
        // "elm": "Elm", 
        // "erlang": "Erlang", 
        // "fsharp": "F#", 
        // "fortran": "Fortran", 
        "go": "Go",
        // "groovy": "Groovy", 
        // "haskell": "Haskell", 
        "html": "HTML",
        "java": "Java",
        "javascript": "JavaScript",
        "json": "JSON",
        // "julia": "Julia", 
        // "kotlin": "Kotlin", 
        // "latex": "LaTeX", 
        // "lisp": "Lisp", 
        // "lua": "Lua", 
        "markdown": "Markdown",
        // "matlab": "MATLAB", 
        // "objective-c": "Objective-C", 
        "perl": "Perl",
        "php": "PHP",
        "plaintext": "Plain Text",
        "python": "Python",
        // "r": "R", 
        "ruby": "Ruby",
        // "rust": "Rust", 
        // "scala": "Scala", 
        // "scheme": "Scheme", 
        "scss": "SCSS",
        "shell": "Shell",
        "sql": "SQL",
        // "swift": "Swift", 
        "typescript": "TypeScript",
        // "vbnet": "Visual Basic .NET", 
        // "vhdl": "VHDL", 
        "xml": "XML",
        "yaml": "YAML"
    };

    private constructor() {
        if (BlockToolbox.instance) {
            throw new Error("Use BlockToolbox.getInstance() to get instance.");
        }

        this.attachEvents();
    }

    static getInstance(): BlockToolbox {
        if (!BlockToolbox.instance) {
            BlockToolbox.instance = new BlockToolbox();
        }
        return BlockToolbox.instance;
    }

    listen(): void {
        console.log("Listening block toolboxes...");
    }

    private attachEvents(): void {
        document.addEventListener(DefaultJSEvents.Mouseover, this.insertToolboxIntoBlockOnce.bind(this));
        document.addEventListener(DefaultJSEvents.Focusin, this.handleTableBehaviorFocusIn.bind(this));
        document.addEventListener(DefaultJSEvents.Focusout, this.handleTableBehaviorFocusOut.bind(this));
        document.addEventListener(DefaultJSEvents.Click, this.handleClickEvent.bind(this));
    }

    private handleClickEvent(event: MouseEvent): void {
        const targetElement = event.target as HTMLElement;

        if (targetElement.closest(DOMElements.TABLE)) {
            this.toolboxVisibilityController(targetElement, false);
        }
    }

    private handleTableBehaviorFocusIn(event: FocusEvent): void {
        const targetElement = event.target as HTMLElement;
        if (targetElement.closest(DOMElements.TABLE)) {
            this.toolboxVisibilityController(targetElement, true);
        }
    }

    private handleTableBehaviorFocusOut(event: FocusEvent): void {
        const targetElement = event.target as HTMLElement;
        if (targetElement.closest(DOMElements.TABLE)) {
            this.toolboxVisibilityController(targetElement, false);
        }
    }

    private toolboxVisibilityController(cell: HTMLElement, forceHideElement: boolean): void {
        const block = cell.closest('.block');
        if (block) {
            const optionsWrapper = block.querySelector('.block-toolbar') as HTMLElement;
            
            if (optionsWrapper) {
                if (forceHideElement) {
                    optionsWrapper.classList.add('hidden');
                } else {
                    optionsWrapper.classList.remove('hidden');
                }
            }
        }
    }

    insertToolboxIntoBlockOnce(event: MouseEvent) {

        const content: HTMLElement | null = (event.target as HTMLElement).closest(`.${ToolboxOptions.IncludeBlockToolbarClass}`);

        if (!content) return;

        const block = content.closest(".".concat(CommonClasses.Block));

        if (!block) return;

        let optionsButtonExists = block.querySelector(".".concat(CommonClasses.BlockToolbarWrapper)) !== null;
        if (!optionsButtonExists) {

            const includeLanguageSelectionTool = content.classList.contains(ToolboxOptions.LanguageSelectionToolClass);
            const includeAlignTool = content.classList.contains(ToolboxOptions.AlignToolClass);
            const includeColorTool = content.classList.contains(ToolboxOptions.ColorToolClass);
            const includeExtraOptions = content.classList.contains(ToolboxOptions.ExtraOptionsClass);

            const toolboxWrapper = BlockToolbox.createToolbox(includeLanguageSelectionTool, includeAlignTool, includeColorTool, includeExtraOptions);

            if (block) {
                block.appendChild(toolboxWrapper);
                BlockToolbox.updateCaptionOptionVisibility(block as HTMLElement);
                block.addEventListener(DefaultJSEvents.Mouseenter, (event) => this.resetToolbox(event, block as HTMLElement));

                block.addEventListener(DefaultJSEvents.Mousemove, (event: Event) => {
                    const blockToolbarId = (toolboxWrapper.firstChild as HTMLElement)?.id;
                    const toolbar = document.getElementById(blockToolbarId);

                    if (toolbar) {
                        if (block.contains(event.target as Node)) {
                            toolbar.style.display = "flex";




                        } else {
                            this.hideBlockToolbox(toolboxWrapper);
                        }
                    }
                });

                block.addEventListener(DefaultJSEvents.Mouseleave, () => this.hideBlockToolbox(toolboxWrapper));

                document.addEventListener(DefaultJSEvents.Click, (event) => {
                    if (!DOMUtils.isTargetDescendantOfSelector(event, `#${block.id}`)) {
                        this.hideBlockToolbox(toolboxWrapper);
                    }
                });


                const iframes = block.querySelectorAll("iframe");
                iframes.forEach(iframe => {
                    iframe.addEventListener(DefaultJSEvents.Mouseenter, () => {
                        const blockToolbarId = (toolboxWrapper.firstChild as HTMLElement)?.id;

                        const toolbar = document.getElementById(blockToolbarId);
                        if (toolbar) {
                            toolbar.style.display = "flex";
                            this.changeToolbarColor(block);
                        }
                    });

                    iframe.addEventListener(DefaultJSEvents.Mouseleave, () => this.hideBlockToolbox(toolboxWrapper));
                });
            }
        }
    }


    changeToolbarColor(block: Element) {
        const colorInteractiveButton = block.querySelector(".color-interactive-button div") as HTMLElement;
        const calloutWrapper = block.querySelector(".callout-wrapper");

        if (colorInteractiveButton && calloutWrapper) {

            var style = window.getComputedStyle(calloutWrapper);

            colorInteractiveButton.style.backgroundColor = style.backgroundColor;
            colorInteractiveButton.style.borderColor = style.borderColor;
            colorInteractiveButton.style.borderColor = "#ccc";
        }
    }

    hideBlockToolbox(toolboxWrapper: HTMLElement) {
        const blockToolbarId = (toolboxWrapper.firstChild as HTMLElement)?.id;
        const toolbar = document.getElementById(blockToolbarId);
        if (toolbar) {

            if (!BlockToolbox.isAnyDependentBoxVisible(toolbar)) {
                toolbar.style.display = "none";
            }
        }
    }

    static isAnyDependentBoxVisible(htmlElement: HTMLElement): boolean {
        const dependentBoxes = htmlElement.querySelectorAll(".dependent-box");

        for (const box of dependentBoxes) {
            const style = window.getComputedStyle(box);

            if (style.display !== 'none' && style.visibility !== 'hidden') {
                return true;
            }
        }

        return false;
    }

    static updateCaptionOptionVisibility(block: HTMLElement): void {
        const captionItem = block.querySelector('.caption-option-item') as HTMLElement | null;
        if (!captionItem) return;

        const contentElement = block.querySelector('.johannes-content-element') as HTMLElement | null;
        const contentType = contentElement?.getAttribute('data-content-type');
        const hasImage = !!block.querySelector('img');

        if (contentType === ContentTypes.Image && hasImage) {
            captionItem.style.display = 'flex';
        } else {
            captionItem.style.display = 'none';
        }
    }

    resetToolbox(event: Event, block: HTMLElement) {
        const blockToolbar = block.querySelector(".block-toolbar");

        if (!blockToolbar) {
            console.log("block-toolbar not found");
            return;
        }

        const more = blockToolbar.querySelector(".media-more-option-select") as HTMLElement;
        if (more) {
            more.style.display = "none";
        }

        const color = blockToolbar.querySelector(".color-interactive-select") as HTMLElement;
        if (color) {
            color.style.display = "none";
        }

        this.changeToolbarColor(block);
        BlockToolbox.updateCaptionOptionVisibility(block);
    }

    static createToolbox(includeLanguageSelectionTool = false, includeAlignTool = false, includeColorTool = false, includeExtraOptions = false): HTMLElement {

        const htmlElementWrapper = document.createElement("div");

        htmlElementWrapper.classList.add("block-toolbar-wrapper", "exclude-from-clone", CommonClasses.EditorOnly);

        const htmlElement = document.createElement("div");
        htmlElement.classList.add("block-toolbar", "soft-box-shadow");
        htmlElement.id = `btb-${Utils.generateUniqueId()}`;
        htmlElement.setAttribute("spellcheck", "false");

        htmlElementWrapper.appendChild(htmlElement);

        if (includeLanguageSelectionTool) {
            htmlElement.appendChild(BlockToolboxBuilder.languageSelectionTool().htmlElement);
        }

        if (includeAlignTool) {
            htmlElement.appendChild(BlockToolboxBuilder.alignTool().htmlElement);
        }

        if (includeColorTool) {
            htmlElement.appendChild(BlockToolboxBuilder.colorTool().htmlElement);
        }

        if (includeExtraOptions) {
            htmlElement.appendChild(BlockToolboxBuilder.extraOptions().htmlElement);
        }

        return htmlElementWrapper;
    }
}