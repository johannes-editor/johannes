import { Commands } from "@/commands/Commands";
import { Colors, ColorsNames } from "@/common/Colors";
import { Icons } from "@/common/Icons";
import { Sizes } from "@/common/Sizes";
import { BlockToolbox } from "@/components/block-toolbox/BlockToolbox";
import { SVGIcon } from "@/components/common/SVGIcon";
import { ButtonGroup } from "@/components/floating-toolbar/base/button-group/ButtonGroup";
import { ButtonGroupItem } from "@/components/floating-toolbar/base/button-group/ButtonGroupItem";
import { ColorIcon } from "@/components/floating-toolbar/base/dropdown-tool/ColorIcon";
import { DropdownMenu } from "@/components/floating-toolbar/base/dropdown-tool/DropdownMenu";
import { DropdownMenuButton } from "@/components/floating-toolbar/base/dropdown-tool/DropdownMenuButton";
import { DropdownMenuList } from "@/components/floating-toolbar/base/dropdown-tool/DropdownMenuList";
import { DropdownMenuListItem } from "@/components/floating-toolbar/base/dropdown-tool/DropdownMenuListItem";
import { DropdownMenuListItemTitle } from "@/components/floating-toolbar/base/dropdown-tool/DropdownMenuListItemTitle";
import { DropdownItemIDs } from "@/core/DropdownItemIDs";
import { Utils } from "@/utilities/Utils";

export class BlockToolboxBuilder {

    static alignTool(): ButtonGroup {
        const groupButton = new ButtonGroup();

        ButtonGroupItem.create(Commands.JustifyLeft, "Left", SVGIcon.create(Icons.JustifyStart, Sizes.large)).appendTo(groupButton);
        ButtonGroupItem.create(Commands.JustifyCenter, "Center", SVGIcon.create(Icons.JustifyCenter, Sizes.large)).appendTo(groupButton);
        ButtonGroupItem.create(Commands.JustifyRight, "Right", SVGIcon.create(Icons.JustifyEnd, Sizes.large)).appendTo(groupButton);

        return groupButton;
    }

    static colorTool(): DropdownMenu {

        const colorDropdownList = new DropdownMenuList("colorInteractiveOptionSelect" + Utils.generateUniqueId());
        const colorButton = new DropdownMenuButton("colorInteractiveButton" + Utils.generateUniqueId(), new ColorIcon("white").htmlElement, colorDropdownList);
        colorButton.addCssClass("color-interactive-button");

        const colorDropdown = new DropdownMenu("colorInteractionOptionsMenu" + Utils.generateUniqueId(), colorButton, colorDropdownList);

        colorDropdownList.append(new DropdownMenuListItemTitle(colorDropdownList, "Background"));

        const backgroundColorRed = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionRed + Utils.generateUniqueId(), colorDropdownList, Commands.changeCalloutBackgroundColor, ColorsNames.CalloutBackgroundRed, new ColorIcon(Colors.HiliteColorRed).htmlElement, "Red");
        backgroundColorRed.addClass("block-toolbox-color");

        const backgroundColorGreen = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionGreen + Utils.generateUniqueId(), colorDropdownList, Commands.changeCalloutBackgroundColor, ColorsNames.CalloutBackgroundGreen, new ColorIcon(Colors.HiliteColorGreen).htmlElement, "Green");
        backgroundColorGreen.addClass("block-toolbox-color");

        const backgroundColorBlue = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionBlue + Utils.generateUniqueId(), colorDropdownList, Commands.changeCalloutBackgroundColor, ColorsNames.CalloutBackgroundBlue, new ColorIcon(Colors.HiliteColorBlue).htmlElement, "Blue");
        backgroundColorBlue.addClass("block-toolbox-color");

        const backgroundColorYellow = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionYellow + Utils.generateUniqueId(), colorDropdownList, Commands.changeCalloutBackgroundColor, ColorsNames.CalloutBackgroundYellow, new ColorIcon(Colors.HiliteColorYellow).htmlElement, "Yellow");
        backgroundColorYellow.addClass("block-toolbox-color");

        const backgroundColorGrey = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionGrey + Utils.generateUniqueId(), colorDropdownList, Commands.changeCalloutBackgroundColor, ColorsNames.CalloutBackgroundGrey, new ColorIcon(Colors.HiliteColorGrey).htmlElement, "Grey");
        backgroundColorGrey.addClass("block-toolbox-color");

        const backgroundColorNone = new DropdownMenuListItem(DropdownItemIDs.BackgroundOptionNone + Utils.generateUniqueId(), colorDropdownList, Commands.changeCalloutBackgroundColor, ColorsNames.CalloutBackgroundNone, new ColorIcon(Colors.HiliteColorNone).htmlElement, "None");
        backgroundColorNone.addClass("block-toolbox-color");

        colorDropdownList.append(backgroundColorRed);
        colorDropdownList.append(backgroundColorGreen);
        colorDropdownList.append(backgroundColorBlue);
        colorDropdownList.append(backgroundColorYellow);
        colorDropdownList.append(backgroundColorGrey);
        colorDropdownList.append(backgroundColorNone);

        return colorDropdown;
    }

    static languageSelectionTool(): DropdownMenu {

        const select = DropdownMenuList.create("languageSelectionInteractiveOptionSelect");
        const button = DropdownMenuButton.create("languageSelectionInteractiveButton", "Plain Text", select, true, ["code-block-language-menu", "color-interactive-button"]);
        const menu = DropdownMenu.create("languageSelectionInteractionOptionsMenu", button, select);

        select.append(new DropdownMenuListItemTitle(select, "Language"));

        Object.entries(BlockToolbox.languageMap).sort((a, b) => a[1].localeCompare(b[1])).forEach(([code, name]) => {
            const item = new DropdownMenuListItem("languageSelectionItem-" + Utils.generateUniqueId(), select, Commands.changeCodeBlockLanguage, code, null, name);

            if (item.value == "plaintext") {
                item.activeIcon?.changeVisibilityToVisible();
            }
            select.append(item);
        });

        return menu;
    }

    static extraOptions(): DropdownMenu {

        const icon = new SVGIcon("icon-material-more", Sizes.large);

        const list = DropdownMenuList.create("moreInteractiveOptionSelect", ["media-more-option-select"]);
        const button = DropdownMenuButton.create("moreInteractiveOptionButton", icon.htmlElement, list, false, ["moreMediaOptionsButton"]);
        const dropdown = DropdownMenu.create("moreInteractiveOptionsMenu", button, list);

        list.append(new DropdownMenuListItemTitle(list, "More options"));
        list.append(new DropdownMenuListItem("duplicateOption" + Utils.generateUniqueId(), list, Commands.duplicateBlock, null, SVGIcon.create(Icons.Duplicate, Sizes.large).htmlElement, "Clone", "Ctrl+D"));


        const deleteItem = new DropdownMenuListItem("deleteOption" + Utils.generateUniqueId(), list, Commands.deleteBlock, null, SVGIcon.create(Icons.Trash, Sizes.large).htmlElement, "Delete", "Shift+Del");
        deleteItem.addCssClass("danger-option");

        list.append(deleteItem);

        return dropdown;
    }
}