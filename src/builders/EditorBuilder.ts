import { Editor } from "@/components/editor/Editor";
import { AddBlockBuilder } from "./AddBlockBuilder";
import { Builder as TextContextFloatingToolbarBuilder } from "../components/floating-toolbar/text-context/Builder";
import { Builder as TableContextFloatingToolbarBuilder } from "../components/floating-toolbar/table-context/Builder";
import { QuickMenuBuilder } from "./QuickMenuBuilder";
import { TitleBuilder } from "./TitleBuilder";
import { ContentBuilder } from "./ContentBuilder";
import { MediaInputterBuilder } from "./MediaInputterBuilder";

export class EditorBuilder {

    static build(): Editor {

        const editor = Editor.getInstance(
            TitleBuilder.build(),
            ContentBuilder.build(),
            AddBlockBuilder.build(),
            TextContextFloatingToolbarBuilder.build(),
            QuickMenuBuilder.build(),
            TableContextFloatingToolbarBuilder.build(),
            MediaInputterBuilder.build()
        );

        return editor;
    }
}