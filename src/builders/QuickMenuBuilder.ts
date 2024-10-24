import { QuickMenu } from "../components/quick-menu/QuickMenu";
import { QuickMenuSection } from "../components/quick-menu/QuickMenuSection";
import { QuickMenuItem } from "../components/quick-menu/QuickMenuItem";
import { ElementFactoryService } from "../services/element-factory/ElementFactoryService";
import { Icons } from "@/common/Icons";

export class QuickMenuBuilder {

    static build(): QuickMenu {

        const quickMenu: QuickMenu = QuickMenu.getInstance();

        const basicBlocksSection: QuickMenuSection = new QuickMenuSection({ quickMenuInstance: quickMenu, title: 'Basic', classList: 'basic-section' });

        basicBlocksSection.appendQuickMenuItems([
            new QuickMenuItem(basicBlocksSection, 'Text', 'Start writing in plain text.', 'icon-material-format', ElementFactoryService.ELEMENT_TYPES.PARAGRAPH, "paragraph text p"),
            new QuickMenuItem(basicBlocksSection, 'Bulleted list', 'Organize items with bullet points.', 'icon-wordpress-bulleted-list', ElementFactoryService.ELEMENT_TYPES.BULLETED_LIST, "bulleted list unordered list ul"),
            new QuickMenuItem(basicBlocksSection, 'Numbered list', 'List items in a numbered format.', 'icon-wordpress-numbered-list', ElementFactoryService.ELEMENT_TYPES.NUMBERED_LIST, "numbered list number list sequential list ol enumerated list ordered list"),
            //new QuickMenuItem(basicBlocksSection, 'Table', 'Organize data in rows and columns.', 'icon-material-table', ElementFactoryService.ELEMENT_TYPES.TABLE, "table tr th"),
            new QuickMenuItem(basicBlocksSection, 'Callout', 'Emphasize key points with a callout box.', Icons.Callout, ElementFactoryService.ELEMENT_TYPES.CALLOUT, "callout note spotlight"),
            new QuickMenuItem(basicBlocksSection, 'Code', 'Include a code snippet.', 'icon-wordpress-code-mark', ElementFactoryService.ELEMENT_TYPES.CODE, "code script source markup"),
            new QuickMenuItem(basicBlocksSection, 'Quote', 'Highlight text as a quote.', 'icon-wordpress-quote', ElementFactoryService.ELEMENT_TYPES.QUOTE, "quote blockquote citation quotation cite"),
            new QuickMenuItem(basicBlocksSection, 'Heading 2', 'Medium header for sections.', 'icon-julia-head-2', ElementFactoryService.ELEMENT_TYPES.HEADER_2, "header 2 heading 2 h2"),
            new QuickMenuItem(basicBlocksSection, 'Heading 3', 'Small header for subsections.', 'icon-julia-head-2', ElementFactoryService.ELEMENT_TYPES.HEADER_3, "header 3 heading 3 h3"),
            new QuickMenuItem(basicBlocksSection, 'Separator', 'Visually divide blocks.', 'icon-wordpress-separator', ElementFactoryService.ELEMENT_TYPES.SEPARATOR, "separator divider rule line hr")
        ]);

        quickMenu.append(basicBlocksSection);

        const mediaBlocksSection = new QuickMenuSection({ quickMenuInstance: quickMenu, title: 'Media', classList: 'media-section' });

        mediaBlocksSection.appendQuickMenuItems([
            new QuickMenuItem(mediaBlocksSection, 'Image', 'Upload or embed an image.', Icons.Image2, ElementFactoryService.ELEMENT_TYPES.IMAGE, "image figure photo illustration picture media upload"),
            new QuickMenuItem(mediaBlocksSection, 'YouTube', 'Embed a YouTube video.', Icons.YouTube, 'video', "video embed youtube clip film movie tape")
        ]);

        quickMenu.append(mediaBlocksSection);

        const headingBlocksSection = new QuickMenuSection({ quickMenuInstance: quickMenu, title: 'Heading', classList: 'heading-section' });

        headingBlocksSection.appendQuickMenuItems([
            new QuickMenuItem(headingBlocksSection, 'Heading 1', 'Large header for main topics.', 'icon-julia-head-1', ElementFactoryService.ELEMENT_TYPES.HEADER_1, "header 1 heading 1 h1"),
            new QuickMenuItem(headingBlocksSection, 'Heading 2', 'Medium header for sections.', 'icon-julia-head-2', ElementFactoryService.ELEMENT_TYPES.HEADER_2, "header 2 heading 2 h2"),
            new QuickMenuItem(headingBlocksSection, 'Heading 3', 'Small header for subsections.', 'icon-julia-head-3', ElementFactoryService.ELEMENT_TYPES.HEADER_3, "header 3 heading 3 h3"),
            new QuickMenuItem(headingBlocksSection, 'Heading 4', 'Detailed header for subtopics.', 'icon-julia-head-4', ElementFactoryService.ELEMENT_TYPES.HEADER_4, "header 4 heading 4 h4"),
            new QuickMenuItem(headingBlocksSection, 'Heading 5', 'Minor header for specifics.', 'icon-julia-head-5', ElementFactoryService.ELEMENT_TYPES.HEADER_5, "header 5 heading 5 h5"),
            new QuickMenuItem(headingBlocksSection, 'Heading 6', 'Smallest header for fine details.', 'icon-julia-head-6', ElementFactoryService.ELEMENT_TYPES.HEADER_6, "header 6 heading 6 h6"),
        ]);

        quickMenu.append(headingBlocksSection);


        const listBlocksSection = new QuickMenuSection({ quickMenuInstance: quickMenu, title: 'List', classList: 'list-section' });

        listBlocksSection.appendQuickMenuItems([
            new QuickMenuItem(listBlocksSection, 'Todo list', 'Track tasks with checkboxes.', 'icon-material-check-list-2', ElementFactoryService.ELEMENT_TYPES.CHECK_LIST, "todo list task list checklist"),
            new QuickMenuItem(listBlocksSection, 'Bulleted list', 'Organize items with bullet points.', 'icon-wordpress-bulleted-list', ElementFactoryService.ELEMENT_TYPES.BULLETED_LIST, "bulleted list unordered list ul"),
            new QuickMenuItem(listBlocksSection, 'Numbered list', 'List items in a numbered format.', 'icon-wordpress-numbered-list', ElementFactoryService.ELEMENT_TYPES.NUMBERED_LIST, "numbered list number list sequential list ol enumerated list ordered list")
        ]);

        quickMenu.append(listBlocksSection);
        
        
        const embedSection = new QuickMenuSection({ quickMenuInstance: quickMenu, title: 'Embed', classList: 'embed-section' });

        embedSection.appendQuickMenuItems([
            // new QuickMenuItem(embedSection, 'GitHub Gist', 'Embed a GitHub Gist.', Icons.GitHub, 'github-gist', "code gist github snippet git"),
            // new QuickMenuItem(embedSection, 'GitLab Snippet ', 'List items in a numbered format.', Icons.GitLab, 'gitlab-snippet', "code git gitlab snippet gist"),
            // new QuickMenuItem(embedSection, 'GitLab Snippet ', 'List items in a numbered format.', 'icon-wordpress-numbered-list', 'numbered-list', "numbered list number list sequential list ol enumerated list ordered list"),
            new QuickMenuItem(embedSection, 'CodePen', 'Embed a CodePen web demo.', Icons.CodePen, 'codepen', "code codepen"),
            // new QuickMenuItem(embedSection, 'Google Maps', 'List items in a numbered format.', 'icon-wordpress-numbered-list', 'numbered-list', "numbered list number list sequential list ol enumerated list ordered list"),
            new QuickMenuItem(embedSection, 'Spotify', 'Embed a Spotify audio track.', Icons.Spotify, 'spotify', "mp3 sound audio music spotify track"),
        ]);

        quickMenu.append(embedSection);

        return quickMenu;
    }
}