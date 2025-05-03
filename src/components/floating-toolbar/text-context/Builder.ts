import { DropdownMenu } from "../base/dropdown-tool/DropdownMenu";
import { DropdownMenuList } from "../base/dropdown-tool/DropdownMenuList";
import { DropdownMenuListItem } from "../base/dropdown-tool/DropdownMenuListItem";
import { SVGIcon } from "../../common/SVGIcon";
import { FloatingToolbarSeparator } from "../base/separator/FloatingToolbarSeparator";
import { ButtonGroup } from "../base/button-group/ButtonGroup";
import { ButtonGroupItem } from "../base/button-group/ButtonGroupItem";
import { ColorIcon } from "../base/dropdown-tool/ColorIcon";
import { DropdownMenuButton } from "../base/dropdown-tool/DropdownMenuButton";
import { DropdownMenuListItemTitle } from "@/components/floating-toolbar/base/dropdown-tool/DropdownMenuListItemTitle";
import { ElementFactoryService } from "@/services/element-factory/ElementFactoryService";
import { Commands } from "@/commands/Commands";
import { Icons } from "@/common/Icons";
import { Sizes } from "@/common/Sizes";
import { Colors } from "@/common/Colors";
import { Toolbar } from "@/components/floating-toolbar/text-context/Toolbar";
import { ButtonIDs } from "@/core/ButtonIDs";
import { DropdownItemIDs } from "@/core/DropdownItemIDs";
import { DropdownListIDs } from "@/core/DropdownListIDs";
import { DropdownMenuIDs } from "@/core/DropdownMenuIDs";

/**
 * Builder is a factory class responsible for constructing a fully configured
 * FloatingToolbar instance with predefined UI components.
 *
 * It assembles dropdown menus, button groups, separators, and commands
 * into a cohesive toolbar structure used in the text editing context.
 *
 * Usage example:
 * ```ts
 * const toolbar = Builder.build();
 * ```
 */
export class Builder {

    /**
     * Builds and returns a fully configured FloatingToolbar instance.
     * The toolbar includes dropdowns for block transformations, color options,
     * formatting buttons, and additional text operations.
     *
     * @returns {Toolbar} A complete floating toolbar ready to be rendered or inserted.
     */
    static build(): Toolbar {

        const id = ""
        const floatingBar = Toolbar.getInstance();

        floatingBar.appendDropdown(Builder.turnIntoDropdown());
        floatingBar.appendSeparator(Builder.separator("turnIntoSeparator"));
        floatingBar.appendButtonGroup(Builder.buttonGroup());
        floatingBar.appendDropdown(Builder.colorDropdown());
        floatingBar.appendSeparator(Builder.separator("textOperationsSeparator"));
        floatingBar.appendDropdown(Builder.moreOptionsDropdown());

        return floatingBar;
    }

    static turnIntoDropdown(): DropdownMenu {

        const turnIntoBarList = new DropdownMenuList("turnIntoSelect");
        const turnIntoBarButton = new DropdownMenuButton("turnIntoButton", "Text", turnIntoBarList);
        const turnIntoDropdown = new DropdownMenu("turnIntoMenu", turnIntoBarButton, turnIntoBarList);

        turnIntoBarList.append(new DropdownMenuListItemTitle(turnIntoBarList, "Turn into"));

        turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionText", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.PARAGRAPH, SVGIcons.paragraph.htmlElement, "Text", "Ctrl+Shift+Enter"));
        turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionTodoList", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.CHECK_LIST, SVGIcons.todo_list.htmlElement, "Todo list", "Ctrl+1"));
        turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionBulletedList", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.BULLETED_LIST, SVGIcons.b_list.htmlElement, "Bulleted list", "Ctrl+."));
        turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionNumberedList", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.NUMBERED_LIST, SVGIcons.n_list.htmlElement, "Numbered list", "Ctrl+/"));
        turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionBlockCode", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.CODE, SVGIcons.code.htmlElement, "Block code"));
        turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionQuote", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.QUOTE, SVGIcons.quote.htmlElement, "Quote"));
        //turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionHeading1", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.HEADER_1, SVGIcons.head1.htmlElement, "Heading 1", "Ctrl+Alt+1"));
        turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionHeading2", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.HEADER_2, SVGIcons.head2.htmlElement, "Heading 2", "Ctrl+Alt+2"));
        turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionHeading3", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.HEADER_3, SVGIcons.head3.htmlElement, "Heading 3", "Ctrl+Alt+3"));
        turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionHeading4", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.HEADER_4, SVGIcons.head4.htmlElement, "Heading 4", "Ctrl+Alt+4"));
        //turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionHeading5", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.HEADER_5, SVGIcons.head5.htmlElement, "Heading 5", "Ctrl+Alt+5"));
        //turnIntoBarList.append(new DropdownMenuListItem("turnIntoOptionHeading6", turnIntoBarList, Commands.transformBlock, ElementFactoryService.ELEMENT_TYPES.HEADER_6, SVGIcons.head6.htmlElement, "Heading 6", "Ctrl+Alt+6"));

        return turnIntoDropdown;
    }

    static separator(id: string): FloatingToolbarSeparator {
        return new FloatingToolbarSeparator(id);
    }

    static buttonGroup(): ButtonGroup {
        const groupButton = new ButtonGroup();

        const link = ButtonGroupItem.create(Commands.toggleLink, "Link", SVGIcon.create(Icons.Link, Sizes.large));
        link.setId(ButtonIDs.Link);
        link.appendTo(groupButton);

        const bold = ButtonGroupItem.create(Commands.toggleBold, "Bold", SVGIcon.create(Icons.Bold, Sizes.large));
        bold.setId(ButtonIDs.Bold);
        bold.appendTo(groupButton);
        
        const italic = ButtonGroupItem.create(Commands.toggleItalic, "Italic", SVGIcon.create(Icons.Italic, Sizes.large));
        italic.setId(ButtonIDs.Italic);
        italic.appendTo(groupButton);
        
        const underline = ButtonGroupItem.create(Commands.toggleUnderline, "Underline", SVGIcon.create(Icons.Underline, Sizes.large));
        underline.setId(ButtonIDs.Underline);
        underline.appendTo(groupButton);
        
        const inlineCode = ButtonGroupItem.create(Commands.toggleInlineCode, "Code", SVGIcon.create(Icons.InlineCode, Sizes.large));
        inlineCode.setId(ButtonIDs.InlineCode);
        inlineCode.appendTo(groupButton);
        
        const strikethrough = ButtonGroupItem.create(Commands.toggleStrikeThrough, "Strike-through", SVGIcon.create(Icons.StrikeThrough, Sizes.large));
        strikethrough.setId(ButtonIDs.Strikethrough);
        strikethrough.appendTo(groupButton);

        return groupButton;
    }

    static colorDropdown(): DropdownMenu {

        const colorDropdownList = new DropdownMenuList(DropdownListIDs.ColorTextOptionSelect);
        const colorButton = new DropdownMenuButton("colorTextButton", new ColorIcon("white").htmlElement, colorDropdownList);
        const colorDropdown = new DropdownMenu(DropdownMenuIDs.ColorTextOptionsMenu, colorButton, colorDropdownList);

        colorDropdownList.append(new DropdownMenuListItemTitle(colorDropdownList, "Highlight"));

        const hiliteColorRed = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionRed, colorDropdownList, Commands.toggleHiliteColor, Colors.HiliteColorRed, new ColorIcon(Colors.HiliteColorRed).htmlElement, "Red");
        hiliteColorRed.addClass("hiliteColor");

        const hiliteColorGreen = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionGreen, colorDropdownList, Commands.toggleHiliteColor, Colors.HiliteColorGreen, new ColorIcon(Colors.HiliteColorGreen).htmlElement, "Green");
        hiliteColorGreen.addClass("hiliteColor");

        const hiliteColorBlue = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionBlue, colorDropdownList, Commands.toggleHiliteColor, Colors.HiliteColorBlue, new ColorIcon(Colors.HiliteColorBlue).htmlElement, "Blue");
        hiliteColorBlue.addClass("hiliteColor");

        const hiliteColorYellow = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionYellow, colorDropdownList, Commands.toggleHiliteColor, Colors.HiliteColorYellow, new ColorIcon(Colors.HiliteColorYellow).htmlElement, "Yellow");
        hiliteColorYellow.addClass("hiliteColor");

        const hiliteColorGrey = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionGrey, colorDropdownList, Commands.toggleHiliteColor, Colors.HiliteColorGrey, new ColorIcon(Colors.HiliteColorGrey).htmlElement, "Grey");
        hiliteColorGrey.addClass("hiliteColor");

        // const hiliteColorNone = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionNone, colorDropdownList, Commands.toggleHiliteColor, Colors.HiliteColorNone, new ColorIcon(Colors.HiliteColorNone).htmlElement, "None");
        // hiliteColorNone.addClass("hiliteColor");

        colorDropdownList.append(hiliteColorRed);
        colorDropdownList.append(hiliteColorGreen);
        colorDropdownList.append(hiliteColorBlue);
        colorDropdownList.append(hiliteColorYellow);
        colorDropdownList.append(hiliteColorGrey);
        // colorDropdownList.append(hiliteColorNone);

        colorDropdownList.append(new DropdownMenuListItemTitle(colorDropdownList, "Text"));

        const foreColorRed = new DropdownMenuListItem("colorOptionRed", colorDropdownList, Commands.toggleForeColor, Colors.ForeColorRed, new SVGIcon("icon-material-format", Sizes.large).htmlElement, "Red");
        foreColorRed.addClass("foreColor");

        const foreColorGreen = new DropdownMenuListItem("colorOptionGreen", colorDropdownList, Commands.toggleForeColor, Colors.ForeColorGreen, new SVGIcon("icon-material-format", Sizes.large).htmlElement, "Green");
        foreColorGreen.addClass("foreColor");

        const foreColorBlue = new DropdownMenuListItem("colorOptionBlue", colorDropdownList, Commands.toggleForeColor, Colors.ForeColorBlue, new SVGIcon("icon-material-format", Sizes.large).htmlElement, "Blue");
        foreColorBlue.addClass("foreColor");

        const foreColorYellow = new DropdownMenuListItem("colorOptionYellow", colorDropdownList, Commands.toggleForeColor, Colors.ForeColorYellow, new SVGIcon("icon-material-format", Sizes.large).htmlElement, "Yellow");
        foreColorYellow.addClass("foreColor");

        const foreColorGrey = new DropdownMenuListItem("colorOptionGrey", colorDropdownList, Commands.toggleForeColor, Colors.ForeColorGrey, new SVGIcon("icon-material-format", Sizes.large).htmlElement, "Grey");
        foreColorGrey.addClass("foreColor");

        const foreColorDark = new DropdownMenuListItem("colorOptionDark", colorDropdownList, Commands.toggleForeColor, Colors.ForeColorDark, new SVGIcon("icon-material-format", Sizes.large).htmlElement, "Dark");
        foreColorDark.addClass("foreColor");

        const foreColorLight = new DropdownMenuListItem("colorOptionDark", colorDropdownList, Commands.toggleForeColor, Colors.ForeColorLight, new SVGIcon("icon-material-format", Sizes.large).htmlElement, "Light");
        foreColorLight.addClass("foreColor");

        // const foreColorNone = new DropdownMenuListItem("colorOptionNone", colorDropdownList, Commands.toggleForeColor, Colors.ForeColorInitial, new SVGIcon("icon-material-format", Sizes.large).htmlElement, "None");
        // foreColorNone.addClass("foreColor");

        colorDropdownList.append(foreColorRed);
        colorDropdownList.append(foreColorGreen);
        colorDropdownList.append(foreColorBlue);
        colorDropdownList.append(foreColorYellow);
        colorDropdownList.append(foreColorDark);
        colorDropdownList.append(foreColorLight);
        colorDropdownList.append(foreColorGrey);
        // colorDropdownList.append(foreColorNone);

        return colorDropdown;
    }

    static moreOptionsDropdown(): DropdownMenu {

        const icon = new SVGIcon("icon-material-more", Sizes.large);

        const moreOptionsList = new DropdownMenuList("moreTextOptionSelect");
        const moreOptionsButton = new DropdownMenuButton("moreTextOptionButton", icon.htmlElement, moreOptionsList, false);
        const moreOptionsDropdown = new DropdownMenu("moreTextOptionsMenu", moreOptionsButton, moreOptionsList);

        moreOptionsList.append(new DropdownMenuListItemTitle(moreOptionsList, "More options"));

        moreOptionsList.append(new DropdownMenuListItem("copyOption", moreOptionsList, Commands.copySelected, null, SVGIcons.copy.htmlElement, "Copy", "Ctrl+C"));
        //moreOptionsList.append(new DropdownMenuListItem("cutOption", moreOptionsList, Commands.cutSelected, null, SVGIcons.cut.htmlElement, "Cut", "Ctrl+X"));
        //moreOptionsList.append(new DropdownMenuListItem("pasteOption", moreOptionsList, Commands.past, null, SVGIcons.paste.htmlElement, "Replace", "Ctrl+V"));
        moreOptionsList.append(new DropdownMenuListItem("duplicateOption", moreOptionsList, Commands.duplicateBlock, null, SVGIcons.duplicate.htmlElement, "Clone", "Ctrl+D"));
        moreOptionsList.append(new DropdownMenuListItem("resetOption", moreOptionsList, Commands.removeFormat, null, SVGIcons.eraser.htmlElement, "Reset Style", "Ctrl+\\"));

        const deleteItem = new DropdownMenuListItem("deleteOption", moreOptionsList, Commands.deleteBlock, null, SVGIcons.delete.htmlElement, "Delete", "Shift+Del");
        deleteItem.addCssClass("danger-option");

        moreOptionsList.append(deleteItem);

        return moreOptionsDropdown;
    }
}

const SVGIcons: any = {

    paragraph: new SVGIcon("icon-material-format", "1.25rem"),
    todo_list: new SVGIcon("icon-material-check-list-2", Sizes.large),
    b_list: new SVGIcon("icon-wordpress-bulleted-list", Sizes.large),
    n_list: new SVGIcon("icon-wordpress-numbered-list", Sizes.large),
    code: new SVGIcon("icon-wordpress-code-mark", Sizes.large),
    quote: new SVGIcon("icon-wordpress-quote", Sizes.large),
    head1: new SVGIcon("icon-julia-head-1", Sizes.large),
    head2: new SVGIcon("icon-julia-head-2", Sizes.large),
    head3: new SVGIcon("icon-julia-head-3", Sizes.large),
    head4: new SVGIcon("icon-julia-head-4", Sizes.large),
    head5: new SVGIcon("icon-julia-head-5", Sizes.large),
    head6: new SVGIcon("icon-julia-head-6", Sizes.large),
    duplicate: new SVGIcon("icon-material-duplicate", Sizes.large),
    delete: new SVGIcon("icon-material-trash", Sizes.large),
    eraser: new SVGIcon("icon-material-clear", Sizes.large),
    copy: new SVGIcon("icon-material-copy", Sizes.large),
    cut: new SVGIcon("icon-material-cut", Sizes.large),
    paste: new SVGIcon("icon-material-paste", Sizes.large)
}