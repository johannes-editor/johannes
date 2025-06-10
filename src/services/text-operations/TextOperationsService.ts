import { Commands } from "@/commands/Commands";
import { ITextOperationsService } from "./ITextOperationsService";
import { Colors } from "@/common/Colors";
import { IMemento } from "@/core/IMemento";
import { DependencyContainer } from "@/core/DependencyContainer";
import { EventEmitter } from "@/commands/EventEmitter";
import { ButtonIDs } from "@/core/ButtonIDs";
import { DOMUtils } from "@/utilities/DOMUtils";
import { MathInputter } from "@/components/math-inputter/MathInputter";
import { CommonClasses } from "@/common/CommonClasses";
import { ContentTypes } from "@/common/ContentTypes";
import katex from 'katex';

import rangy from 'rangy';
import 'rangy/lib/rangy-classapplier';

type TargetNode = {
    nodeType: string;
    classes?: string[];
};

export class TextOperationsService implements ITextOperationsService {

    private static instance: TextOperationsService;

    private memento: IMemento;

    textOperationService: any;

    lastDropdownColorChangeTime : number = 0;

    private constructor(memento: IMemento) {
        if (TextOperationsService.instance) {
            throw new Error("Use TextOperationService.getInstance() to get instance.");
        }

        this.memento = memento;
    }

    static getInstance(): TextOperationsService {

        const memento = DependencyContainer.Instance.resolve<IMemento>("IMemento");

        if (!this.instance) {
            this.instance = new TextOperationsService(memento);
        }

        return this.instance;
    }

    execCopy(): void {
        const selection = document.getSelection();
        if (!selection || selection.isCollapsed) {
            console.error("No text is selected");
            return;
        }

        const selectedText = selection.toString();

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(selectedText).then(() => {
                EventEmitter.emitChangeTextTemporarilyEvent("copyOption", "Copied!");
            }).catch(err => {
                console.error("Failed to copy: ", err);
            });
        }
    }

    async execCut(): Promise<void> {
        this.memento.saveState();
    
        const selection = document.getSelection();
        if (!selection || selection.isCollapsed) {
            console.error("No text is selected.");
            return;
        }
    
        const selectedText = selection.toString();
    
        try {
            if (navigator.clipboard && navigator.clipboard.write) {
                const blob = new Blob([selectedText], { type: "text/plain" });
                const clipboardItem = new ClipboardItem({ "text/plain": blob });
    
                await navigator.clipboard.write([clipboardItem]);
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(selectedText);
            } else {
                throw new Error("The cut functionality is not supported in this browser.");
            }
    
            const range = selection.getRangeAt(0);
            range.deleteContents();
    
            selection.removeAllRanges();
        } catch (err) {
            console.error("Failed to cut: ", err);
            alert("Could not cut automatically. Please cut the text manually.");
        }
    }

    async execReplace(): Promise<void> {
        this.memento.saveState();

        const selection = window.getSelection();
        if (!selection?.rangeCount) {
            console.error("No text is selected.");
            return;
        }

        try {
            const replacementText = await navigator.clipboard.readText();
            const range = selection.getRangeAt(0);
            range.deleteContents();

            const textNode = document.createTextNode(replacementText);
            range.insertNode(textNode);

            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(textNode);
            selection.addRange(newRange);
        } catch (error) {
            console.error("Failed to read from clipboard:", error);
        }

        EventEmitter.emitDocChangedEvent();
    }

    execInsertLink(url: string): void {
        this.memento.saveState();

        const selection = document.getSelection();
        if (!selection || selection.isCollapsed) {
            console.error("No text is selected.");
            return;
        }

        const range = selection.getRangeAt(0);

        const anchor = document.createElement("a");
        anchor.href = url;

        const selectedContent = range.extractContents();
        anchor.appendChild(selectedContent);

        range.insertNode(anchor);

        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(anchor);
        selection.addRange(newRange);

        setTimeout(() => {
            EventEmitter.emitChangeComponentColorEvent(ButtonIDs.Link, Colors.IconActiveBlue);
            this.normalizeAnchors();
        }, 50);

        EventEmitter.emitDocChangedEvent();
    }

    private normalizeAnchors() {
        const anchors = document.querySelectorAll("#johannesEditor .content a");

        anchors.forEach(anchor => {
            if (!anchor.hasAttribute('title')) {
                anchor.setAttribute('title', (anchor as HTMLAnchorElement).href);
            }

            anchor.normalize();
        });
    }

    execToggleLink(): void {
        if (!this.queryAnchorCommandState()) {
            EventEmitter.emitShowElementEvent("linkBox");
        } else {
            const selection = document.getSelection();
            if (!selection || selection.rangeCount === 0) {
                console.error("No selection found.");
                return;
            }

            let node: Node | null = selection.anchorNode;
            while (node && node.nodeType !== Node.ELEMENT_NODE) {
                node = node.parentNode;
            }

            if (node && node.nodeType === Node.ELEMENT_NODE) {
                const elementNode = node as Element;
                const anchorElement = elementNode.closest('a');
                if (anchorElement) {
                    const parent = anchorElement.parentNode;
                    if (parent) {
                        while (anchorElement.firstChild) {
                            parent.insertBefore(anchorElement.firstChild, anchorElement);
                        }
                        parent.removeChild(anchorElement);
                    }
                    EventEmitter.emitChangeComponentColorEvent("linkButton", Colors.IconDefaultBlack);
                } else {
                    console.error("No link found to remove.");
                }
            } else {
                console.error("No element selected.");
            }
        }
    }

    execBold(): void {
        this.memento.saveState();
    
        const boldApplier = rangy.createClassApplier("bold", {
            elementTagName: "span",
            elementProperties: {
                style: {
                    fontWeight: "bold"
                }
            },
            toggle: true
        });
    
        const selection = rangy.getSelection();
    
        if (selection.rangeCount === 0 || selection.isCollapsed) {
            console.warn("No valid text selection to apply bold.");
            return;
        }
    
        try {
            boldApplier.toggleSelection();
        } catch (error) {
            console.error("Failed to apply bold formatting:", error);
            return;
        }
    
        const isBold = this.checkBoldState();
        EventEmitter.emitChangeComponentColorEvent(
            ButtonIDs.Bold,
            isBold ? Colors.IconActiveBlue : Colors.IconDefaultBlack
        );
        EventEmitter.emitDocChangedEvent();
    }

    private checkBoldState(): boolean {
        const selection = rangy.getSelection();
        if (!selection.rangeCount) return false;
    
        const range = selection.getRangeAt(0);
        if (!range) return false;
    
        let container = range.commonAncestorContainer;
    
        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement;
        }
    
        if (!(container instanceof Element)) return false;
    
        try {
            const spanBold = container.querySelectorAll(
                "span[style*='font-weight: bold'], span[style*='font-weight: 700']"
            );
            return spanBold.length > 0;
        } catch (error) {
            console.error("Failed to check bold state:", error);
            return false;
        }
    }

    execInlineCode(): void {
        this.memento.saveState();
    
        try {
            const toggled = this.toggleInlineCode();
    
            if (toggled) {
                const isActive = this.queryInlineCodeCommandState();
                EventEmitter.emitChangeComponentColorEvent(
                    ButtonIDs.InlineCode,
                    isActive ? Colors.IconActiveBlue : Colors.IconDefaultBlack
                );
            }
        } catch (error) {
            console.error("Failed to toggle inline code formatting:", error);
        }
    
        EventEmitter.emitDocChangedEvent();
    }

    toggleInlineCode(): boolean {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            console.warn("No valid selection for inline code.");
            return false;
        }
    
        try {
            const range = selection.getRangeAt(0);
    
            let selectedContent: DocumentFragment | HTMLSpanElement = range.extractContents();
    
            let isCode = false;
            const containsCode = document.createElement('span');
            containsCode.appendChild(selectedContent.cloneNode(true));
    
            if (containsCode.querySelector('code')) {
                isCode = true;
                containsCode.querySelectorAll('code').forEach(code => {
                    const textNode = document.createTextNode(code.textContent || '');
                    code.parentNode?.replaceChild(textNode, code);
                });
                selectedContent = containsCode;
            }
    
            let parentCode = selection.anchorNode;
            while (parentCode && parentCode.nodeName !== "CODE" && parentCode.nodeName !== "BODY") {
                parentCode = parentCode.parentNode;
            }
    
            if (parentCode && parentCode.nodeName === "CODE") {
                isCode = true;
                const textNode = document.createTextNode(parentCode.textContent || '');
                parentCode.parentNode?.replaceChild(textNode, parentCode);
            }
    
            if (!isCode) {
                const codeElement = document.createElement("code");
                codeElement.appendChild(selectedContent);
                range.insertNode(codeElement);
            } else {
                range.insertNode(selectedContent);
            }
    
            selection.removeAllRanges();
            selection.addRange(range);
    
            const content = DOMUtils.getActiveContentEditable();
            if (content) {
                content.normalize();
                DOMUtils.mergeInlineElements(content);
            }
    
            return true;
        } catch (error) {
            console.error("Error applying inline code:", error);
            return false;
        }
    }

    execInlineFormula(): void {
        this.memento.saveState();

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            console.warn("No valid cursor position for inline formula.");
            return;
        }

        const range = selection.getRangeAt(0);
        const container = document.createElement('span');
        container.classList.add('inline-math', CommonClasses.ShowMathInputOnClick, CommonClasses.ContentElement);
        container.setAttribute('data-content-type', ContentTypes.Math);
        container.dataset.formula = '';

        const renderPreview = () => {
            const formula = container.dataset.formula || '';
            container.innerHTML = '';
            if (formula) {
                try {
                    katex.render(formula, container, { throwOnError: false });
                } catch (e) {
                    container.textContent = formula;
                }
            } else {
                container.textContent = 'f(x)';
            }
        };

        (container as any).renderPreview = renderPreview;
        renderPreview();

        range.insertNode(container);
        range.setStartAfter(container);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        const inputter = MathInputter.getInstance();
        inputter.setTarget(container, renderPreview);
        inputter.focusStack.push(container);
        inputter.show();

        EventEmitter.emitDocChangedEvent();
    }

    execItalic(): void {
        this.memento.saveState();
    
        const italicApplier = rangy.createClassApplier("italic", {
            elementTagName: "span",
            elementProperties: {
                style: {
                    fontStyle: "italic"
                }
            },
            toggle: true
        });
    
        const selection = rangy.getSelection();
        if (selection.rangeCount === 0 || selection.isCollapsed) {
            console.warn("No valid text selection to apply italic.");
            return;
        }
    
        try {
            italicApplier.toggleSelection();
        } catch (error) {
            console.error("Failed to apply italic formatting:", error);
            return;
        }
    
        const isItalic = this.checkItalicState();
        EventEmitter.emitChangeComponentColorEvent(
            ButtonIDs.Italic,
            isItalic ? Colors.IconActiveBlue : Colors.IconDefaultBlack
        );
        EventEmitter.emitDocChangedEvent();
    }

    private checkItalicState(): boolean {
        const selection = rangy.getSelection();
        if (!selection.rangeCount) return false;
    
        const range = selection.getRangeAt(0);
        if (!range) return false;
    
        let container = range.commonAncestorContainer;
    
        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement;
        }
    
        if (!(container instanceof Element)) return false;
    
        try {
            const spanItalic = container.querySelectorAll("span[style*='font-style: italic']");
            return spanItalic.length > 0;
        } catch (error) {
            console.error("Failed to check italic state:", error);
            return false;
        }
    }

    execStrikeThrough(): void {
        this.memento.saveState();
    
        const strikethroughApplier = rangy.createClassApplier("strikethrough", {
            elementTagName: "span",
            elementProperties: {
                style: {
                    textDecoration: "line-through"
                }
            },
            toggle: true
        });
    
        const selection = rangy.getSelection();
        if (selection.rangeCount === 0 || selection.isCollapsed) {
            console.warn("No valid text selection to apply strikethrough.");
            return;
        }
    
        try {
            strikethroughApplier.toggleSelection();
        } catch (error) {
            console.error("Failed to apply strikethrough formatting:", error);
            return;
        }
    
        const isStrikethrough = this.checkStrikethroughState();
        EventEmitter.emitChangeComponentColorEvent(
            ButtonIDs.Strikethrough,
            isStrikethrough ? Colors.IconActiveBlue : Colors.IconDefaultBlack
        );
        EventEmitter.emitDocChangedEvent();
    }

    private checkStrikethroughState(): boolean {
        const selection = rangy.getSelection();
        if (!selection.rangeCount) return false;
    
        const range = selection.getRangeAt(0);
        if (!range) return false;
    
        let container = range.commonAncestorContainer;
    
        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement;
        }
    
        if (!(container instanceof Element)) return false;
    
        try {
            const spanStrikethrough = container.querySelectorAll("span[style*='text-decoration: line-through']");
            return spanStrikethrough.length > 0;
        } catch (error) {
            console.error("Failed to check strikethrough state:", error);
            return false;
        }
    }

    execUnderline(): void {
        this.memento.saveState();
    
        const underlineApplier = rangy.createClassApplier("underline", {
            elementTagName: "span",
            elementProperties: {
                style: {
                    textDecoration: "underline"
                }
            },
            toggle: true
        });
    
        const selection = rangy.getSelection();
        if (selection.rangeCount === 0 || selection.isCollapsed) {
            console.warn("No valid text selection to apply underline.");
            return;
        }
    
        try {
            underlineApplier.toggleSelection();
        } catch (error) {
            console.error("Failed to apply underline formatting:", error);
            return;
        }
    
        setTimeout(() => {
            try {
                const isUnderlined = this.checkUnderlineState();
                EventEmitter.emitChangeComponentColorEvent(
                    ButtonIDs.Underline,
                    isUnderlined ? Colors.IconActiveBlue : Colors.IconDefaultBlack
                );
            } catch (error) {
                console.error("Failed to check underline state:", error);
            }
        }, 10);
    
        EventEmitter.emitDocChangedEvent();
    }

    private checkUnderlineState(): boolean {
        const selection = rangy.getSelection();
        if (!selection.rangeCount) return false;
    
        const range = selection.getRangeAt(0);
        if (!range) return false;
    
        let container = range.commonAncestorContainer;
        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement;
        }
    
        if (!(container instanceof Element)) return false;
    
        try {
            const spanUnderline = container.querySelectorAll("span[style*='text-decoration: underline']");
            return spanUnderline.length > 0;
        } catch (error) {
            console.error("Failed to check underline state:", error);
            return false;
        }
    }

    execHiliteColor(value: string): void {
        this.memento.saveState();
        this.lastDropdownColorChangeTime = Date.now();
    
        const className = `highlight-${value.replace(/[^a-zA-Z0-9]/g, '')}`;
        const selection = rangy.getSelection();
        if (selection.rangeCount === 0 || selection.isCollapsed) {
            console.warn("No valid text selection to apply background highlight.");
            return;
        }
    
        try {
            const highlightApplier = rangy.createClassApplier(className, {
                elementTagName: "span",
                toggle: true
            });
    
            highlightApplier.toggleSelection();
        } catch (error) {
            console.error("Failed to apply highlight color:", error);
            return;
        }
    
        EventEmitter.emitShowHideActiveElementEvent("hiliteColor", value, "show");
        EventEmitter.emitDocChangedEvent();
    }

    execForeColor(value: string): void {
        this.memento.saveState();
        this.lastDropdownColorChangeTime = Date.now();
    
        const className = `textColor-${value.replace(/[^a-zA-Z0-9]/g, '')}`;
        const selection = rangy.getSelection();
        if (selection.rangeCount === 0 || selection.isCollapsed) {
            console.warn("No valid text selection to apply foreground color.");
            return;
        }
    
        try {
            const colorApplier = rangy.createClassApplier(className, {
                elementTagName: "span",
                toggle: true
            });
    
            colorApplier.toggleSelection();
        } catch (error) {
            console.error("Failed to apply text color:", error);
            return;
        }
    
        EventEmitter.emitShowHideActiveElementEvent("foreColor", value, "show");
        EventEmitter.emitDocChangedEvent();
    }

    queryCommandState(command: string, value: string | null): boolean {

        if (command === Commands.toggleLink) {
            return this.queryAnchorCommandState();
        }

        if (command === Commands.toggleUnderline) {
            return this.queryUnderlineCommandState();
        }

        if (command === Commands.toggleHiliteColor) {
            return this.queryHiliteColor(value!);
        }

        if (command === Commands.toggleForeColor) {
            return this.queryForeColor(value!);
        }

        if (command === Commands.toggleInlineCode) {
            return this.queryInlineCodeCommandState();
        }

        return document.queryCommandState(command);
    }

    private queryAnchorCommandState(): boolean {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return false;

        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        const isNodeInsideAnchor = (node: Node | null): boolean => {
            while (node && node !== document.body) {
                if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === 'a') {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        };

        if (isNodeInsideAnchor(startContainer) || isNodeInsideAnchor(endContainer)) {
            return true;
        }

        const nodesInRange = range.cloneContents().querySelectorAll('a');
        return nodesInRange.length > 0;
    }

    private queryInlineCodeCommandState(): boolean {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return false;

        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;

        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
        }

        while (node && node !== null) {
            if (node.nodeType == Node.ELEMENT_NODE && (node as HTMLElement).closest('code')) {
                return true;
            }
            node = node.parentNode;
        }

        return false;
    }

    private queryUnderlineCommandState(): boolean {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return false;

        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;

        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
        }

        while (node && node !== null) {
            if (node.nodeType == Node.ELEMENT_NODE && (node as HTMLElement).closest('u')) {
                return true;
            }
            node = node.parentNode;
        }

        return false;
    }

    queryForeColor(expectedColor: string): boolean {
        const selection = window.getSelection();
    
        if (!selection || !selection.rangeCount) {
            return false;
        }
    
        let element: Node | null = selection.getRangeAt(0).commonAncestorContainer;
    
        if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentNode;
        }
    
        if (!(element instanceof Element)) {
            return false;
        }
    
        const normalizedColor = expectedColor.replace('#', '').toLowerCase();
    
        const className = `textColor-${normalizedColor}`;
    
        return element.closest(`.${className}`) !== null;
    }

    queryHiliteColor(expectedColor: string): boolean {
        const selection = window.getSelection();
    
        if (!selection || !selection.rangeCount) {
            return false;
        }
    
        let element: Node | null = selection.getRangeAt(0).commonAncestorContainer;
    
        if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentNode;
        }
    
        if (!(element instanceof Element)) {
            return false;
        }
    
        const normalizedColor = expectedColor.replace('#', '').toLowerCase();
    
        const className = `highlight-${normalizedColor}`;
    
        return element.closest(`.${className}`) !== null;
    }

    getTargetElementMap(command: string): keyof HTMLElementTagNameMap {
        switch (command) {

            case "strong":
            case "bold":
            case "b":
                return 'strong';

            case "italic":
            case "i":
            case "em":
                return "em";

            case "underline":
            case "u":
                return "u";

            case "strikethrough":
            case "s":
                return 's';

            case "background":
                return "span";

            case "color":
                return "span";

            default:
                throw new Error();
        }
    }

    static getSelectedHTMLElement(): HTMLElement | null {
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let element: Node | null = range.commonAncestorContainer;

            if (element.nodeType === Node.TEXT_NODE) {
                element = element.parentNode as HTMLElement;
            }

            while (element && !(element instanceof HTMLElement)) {
                element = element.parentNode as HTMLElement | null;
            }

            if (element) {
                return element;
            }
        }

        return null;
    }

    getSelectedTextNodes(): Node[] {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return [];
        }

        const textNodes: Node[] = [];

        for (let i = 0; i < selection.rangeCount; ++i) {
            const range = selection.getRangeAt(i);
            const nodeIterator = document.createNodeIterator(
                range.commonAncestorContainer,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode(node) {
                        if (range.intersectsNode(node)) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        return NodeFilter.FILTER_REJECT;
                    }
                }
            );

            let node;
            while ((node = nodeIterator.nextNode())) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const nodeRange = document.createRange();
                    nodeRange.selectNodeContents(node);

                    if (
                        range.compareBoundaryPoints(Range.END_TO_START, nodeRange) === -1 &&
                        range.compareBoundaryPoints(Range.START_TO_END, nodeRange) === 1
                    ) {
                        textNodes.push(node);
                    }
                }
            }
        }

        return textNodes;
    }

    findClosestMatchingParent(element: Node | null, target: TargetNode): Element | null {
        if (element && element.nodeType === Node.TEXT_NODE) {
            element = element.parentElement;
        }

        while (element && element !== document.body) {
            if (element.nodeType === Node.ELEMENT_NODE) {
                const elem = element as Element;
                if (elem.tagName.toLowerCase() === target.nodeType.toLowerCase()) {
                    if (!target.classes || target.classes.every(cls => elem.classList.contains(cls))) {
                        return elem;
                    }
                }
            }
            element = element.parentElement;
        }
        return null;
    }

    extractSelectedText(textNode: Node): string {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            return "";
        }

        const range = selection.getRangeAt(0);

        if (textNode.nodeType !== Node.TEXT_NODE) {
            return "";
        }

        const textContent = textNode.textContent || "";

        let start = 0;
        let end = textContent.length;

        if (!range.intersectsNode(textNode)) {
            return "";
        }

        if (range.startContainer === textNode) {
            start = range.startOffset;
        } else if (range.startContainer.contains(textNode)) {
            start = 0;
        }

        if (range.endContainer === textNode) {
            end = range.endOffset;
        } else if (range.endContainer.contains(textNode)) {
            end = textContent.length;
        }

        if (start < end) {
            return textContent.substring(start, end);
        }

        return "";
    }
}