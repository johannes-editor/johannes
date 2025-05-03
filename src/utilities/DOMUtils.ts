import { Utils } from "./Utils";

const START_MARKER_ID = 'caret-start-marker';
const END_MARKER_ID = 'caret-end-marker';

export class DOMUtils {

    static isSelectionInTableCell() {
        let selection = window.getSelection();
        if (!selection?.rangeCount) return false;

        let node = selection.anchorNode;
        while (node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if ((node as Element).tagName === 'TD' || (node as Element).tagName === 'TH') {
                    return true;
                }
            }
            node = node.parentNode;
        }
        return false;
    }

    /**
    * Determines whether the current selection is at the start or end of a contenteditable element.
    * This function was adapted from a StackOverflow answer.
    *
    * @param {HTMLElement} el - The contenteditable element to check.
    * @returns {Object} An object containing two boolean properties: `atStart` and `atEnd`.
    *
    * @see {@link https://stackoverflow.com/questions/7451468/contenteditable-div-how-can-i-determine-if-the-cursor-is-at-the-start-or-end-o#answer-7478420|StackOverflow Response}
    * @example
    * // Returns { atStart: true, atEnd: false } if the cursor is at the start of the element, but not at the end.
    * const result = getSelectionTextInfo(document.getElementById('editable'));
    */
    static getSelectionTextInfo(el: HTMLElement): { atStart: boolean; atEnd: boolean } {

        let atStart = false, atEnd = false;

        if (el.textContent == "") {
            atStart = true;
            atEnd = true;

            return { atStart, atEnd }
        }

        let selRange: Range, testRange: Range;

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            selRange = sel.getRangeAt(0);
            testRange = document.createRange();

            testRange.selectNodeContents(el);
            testRange.setEnd(selRange.startContainer, selRange.startOffset);
            atStart = testRange.toString() === "";

            testRange.selectNodeContents(el);
            testRange.setStart(selRange.endContainer, selRange.endOffset);
            atEnd = testRange.toString() === "";
        }

        return { atStart, atEnd };
    }

    static insertAfter(newNode: Node, referenceNode: Node) {
        if (referenceNode.parentNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    }

    static hasTextContent(node: Node): boolean {
        return node.textContent?.trim() !== '' ||
            (node.hasChildNodes() && Array.from(node.childNodes).some(childNode => this.hasTextContent(childNode)));
    }

    static cloneAndInsertAfter(element: HTMLElement): HTMLElement | null {
        const clonedElement = element.cloneNode(true) as HTMLElement;

        const parentElement = element.parentNode;

        if (!parentElement) {
            return null;
        }

        parentElement.insertBefore(clonedElement, element.nextSibling);

        if (clonedElement.id) {
            const match = clonedElement.id.match(/^(.+?)-/);

            if (match) {
                const prefix = match[1];
                clonedElement.id = prefix + '-' + Utils.generateUniqueId();
            } else {
                clonedElement.id = Utils.generateUniqueId();
            }
        }

        return clonedElement;
    }

    static findClosestAncestorOfActiveElementByClass(className: string): HTMLElement | null {
        const activeElement = document.activeElement;

        if (!activeElement) {
            return null;
        }

        let currentElement: Node | null = activeElement;

        while (currentElement) {
            if (
                currentElement instanceof HTMLElement &&
                currentElement.classList.contains(className)
            ) {
                return currentElement;
            }

            currentElement = currentElement.parentNode;
        }

        return null;
    }

    static findClosestAncestorOfSelectionByClass(className: string): HTMLElement | null {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            return null;
        }

        let currentElement: Node | null = selection.getRangeAt(0).commonAncestorContainer;

        if (currentElement && currentElement.nodeType === Node.TEXT_NODE) {
            currentElement = currentElement.parentNode;
        }

        while (currentElement) {
            if (currentElement.nodeType === Node.ELEMENT_NODE && (currentElement as HTMLElement).classList.contains(className)) {
                return currentElement as HTMLElement;
            }
            currentElement = currentElement.parentNode;
        }

        return null;
    }

    static trimEmptyTextAndBrElements(element: Node): void {
        if (!element) return;

        const isEmptyTextOrBr = (node: Node): boolean => {
            if (node.nodeType === Node.TEXT_NODE) {
                return !node.textContent?.trim();
            }
            if (node.nodeType === Node.ELEMENT_NODE) {
                return (node as HTMLElement).tagName.toLowerCase() === 'br';
            }
            return false;
        };

        while (element.firstChild && isEmptyTextOrBr(element.firstChild)) {
            element.removeChild(element.firstChild);
        }

        while (element.lastChild && isEmptyTextOrBr(element.lastChild)) {
            element.removeChild(element.lastChild);
        }
    }

    static rearrangeContentAfterSplit(currentNode: Node, newNode: Node): void {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return;
        }

        const range = selection.getRangeAt(0);

        if (!currentNode.contains(range.startContainer)) {
            return;
        }

        const afterCaretRange = range.cloneRange();
        afterCaretRange.setEndAfter(currentNode);
        afterCaretRange.deleteContents();

        const mapNodeToNewNode = (node: Node): Node | null => {
            const path: number[] = [];
            let n: Node | null = node;

            while (n && n !== currentNode) {
                const parent: any = n.parentNode;
                const index = Array.prototype.indexOf.call(parent!.childNodes, n);
                path.unshift(index);
                n = parent;
            }

            if (n !== currentNode) {
                return null;
            }

            let newN: Node = newNode;
            for (const index of path) {
                newN = newN.childNodes[index];
            }

            return newN;
        };

        const newStartContainer = mapNodeToNewNode(range.startContainer);
        const newEndContainer = mapNodeToNewNode(range.endContainer);

        if (!newStartContainer || !newEndContainer) {
            return;
        }

        const newRange = document.createRange();
        newRange.setStart(newStartContainer, range.startOffset);
        newRange.setEnd(newEndContainer, range.endOffset);

        const beforeCaretRange = newRange.cloneRange();
        beforeCaretRange.setStartBefore(newNode);
        beforeCaretRange.deleteContents();

        selection.removeAllRanges();
        selection.selectAllChildren(newNode);
        selection.collapseToStart();
    }

    static getCursorPosition(node: Node): number | null {
        const selection = window.getSelection();
        if (!selection || !node) return null;

        const range = selection.getRangeAt(0);

        if (!range.intersectsNode(node)) return null;

        const treeWalker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_TEXT,
            { acceptNode: node => NodeFilter.FILTER_ACCEPT }
        );

        let charCount = 0;
        let currentNode = treeWalker.firstChild();

        while (currentNode) {
            if (currentNode === range.startContainer) {
                charCount += range.startOffset;
                break;
            }

            charCount += currentNode.textContent?.length || 0;
            currentNode = treeWalker.nextNode();
        }

        return charCount;
    }

    static setCursorPosition(element: Node, position: number): void {
        const selection = window.getSelection();
        if (!selection) return;

        selection.removeAllRanges();

        const range = document.createRange();
        let currentPos = 0;
        let found = false;

        const treeWalker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null
        );

        let currentNode = treeWalker.nextNode();

        while (currentNode) {
            const textLength = currentNode.textContent?.length || 0;

            if (currentPos + textLength >= position) {
                const offset = position - currentPos;
                range.setStart(currentNode, offset);
                range.collapse(true);
                found = true;
                break;
            }

            currentPos += textLength;
            currentNode = treeWalker.nextNode();
        }

        if (!found) {
            if (element.lastChild) {
                if (element.lastChild.nodeType === Node.TEXT_NODE) {
                    const textNode = element.lastChild as Text;
                    range.setStart(textNode, textNode.length);
                } else {
                    range.setStartAfter(element.lastChild);
                }
            } else {
                range.setStart(element, 0);
            }
            range.collapse(true);
        }

        selection.addRange(range);
    }

    static getContentTypeFromActiveElement(): string | null {
        const block = DOMUtils.getCurrentActiveBlock();
        const contentElement = block?.querySelector(".johannes-content-element") as HTMLElement;
        if (!contentElement) {
            return null;
        }
        const contentType = contentElement.getAttribute("data-content-type");
        return contentType || null;
    }

    static splitContentAtCursorSelection(rootNode: Node): Range[] {
        const ranges: Range[] = [];

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return ranges;

        const range = selection.getRangeAt(0);

        const rangeBefore = document.createRange();
        rangeBefore.selectNodeContents(rootNode);
        rangeBefore.setEnd(range.startContainer, range.startOffset);

        const rangeAfter = document.createRange();
        rangeAfter.selectNodeContents(rootNode);
        rangeAfter.setStart(range.endContainer, range.endOffset);
        if (rootNode.lastChild) {
            rangeAfter.setEndAfter(rootNode.lastChild);
        }

        ranges.push(rangeBefore);
        ranges.push(rangeAfter);

        return ranges;
    }

    static placeCursorAtStartOfEditableElement(editableElement: HTMLElement) {
        setTimeout(() => {
            if (editableElement.isContentEditable) {
                editableElement.focus();

                const range = document.createRange();
                range.selectNodeContents(editableElement);
                range.collapse(true);

                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
            } else {
                console.warn("The element is not editable.");
            }
        });
    }

    static placeCursorAtEndOfEditableElement(contentBlock: HTMLElement) {
        if (contentBlock.isContentEditable) {
            requestAnimationFrame(() => {
                contentBlock.focus();

                const range = document.createRange();
                const selection = window.getSelection();

                range.selectNodeContents(contentBlock);

                let lastNode: Node | null = contentBlock;
                while (lastNode.lastChild) {
                    lastNode = lastNode.lastChild;
                }

                range.setEnd(lastNode, lastNode.nodeType === Node.TEXT_NODE ? lastNode.textContent!.length : 0);
                range.collapse(false);

                selection?.removeAllRanges();
                selection?.addRange(range);
            });
        } else {
            console.warn("The element is not editable.");
        }
    }

    static getCurrentActiveBlock(): Element | null {

        let container = document.activeElement;

        if (container) {
            return container.closest(".block");
        }

        return null;
    }

    static getBlockFromEvent(event: Event): HTMLElement | null {
        const target = event.target;

        if (target && target instanceof Element) {
            return target.closest('.block');
        }

        return null;
    }

    static isSelectedTextDescendantOf(parentSelector: string): boolean {
        const selection = document.getSelection();

        if (!selection) {
            return false;
        }

        if (!selection.rangeCount) return false;

        const range = selection.getRangeAt(0);
        let element: Node | null = range.startContainer;

        if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentNode;
        }

        if (!element) {
            return false;
        }

        return (element as Element).closest(parentSelector) !== null;
    }

    static removeFilterText(): number | null {
        let lastSlashPosition: number | null = null;
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;

            if (container.nodeType === Node.TEXT_NODE && container.parentElement?.isContentEditable) {
                let node: Node | null = container;
                let offset = range.startOffset;

                while (node && offset > 0) {
                    const textBeforeCursor = node.textContent?.substring(0, offset) || "";
                    lastSlashPosition = textBeforeCursor.lastIndexOf("/");

                    if (lastSlashPosition !== -1) {
                        range.setStart(node, lastSlashPosition);
                        range.deleteContents();
                        break;
                    } else {
                        offset = node.parentNode?.textContent?.lastIndexOf("/") || -1;
                        node = node.parentNode;
                    }
                }

                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                console.warn("The cursor is not within a contentEditable element or a text node.");
            }
        } else {
            console.warn("No active selection.");
        }

        return lastSlashPosition;
    }



    static findClickedElementOrAncestorByDataContentType(event: MouseEvent, dataContentType: string): HTMLElement | null {
        let clickedElement = event.target as HTMLElement;

        if (clickedElement.nodeType === Node.TEXT_NODE) {
            clickedElement = clickedElement.parentElement!;
        }

        if (clickedElement.dataset.contentType === dataContentType) {
            return clickedElement;
        }

        let currentElement = clickedElement.parentElement;
        while (currentElement) {
            if (currentElement.dataset.contentType === dataContentType) {
                return currentElement;
            }
            currentElement = currentElement.parentElement;
        }

        return null;
    }

    static findClickedElementOrAncestorById(event: MouseEvent, id: string): HTMLElement | null {
        let clickedElement = event.target as HTMLElement;

        if (clickedElement.nodeType === Node.TEXT_NODE) {
            clickedElement = clickedElement.parentElement!;
        }

        if (clickedElement.id === id) {
            return clickedElement;
        }

        let currentElement = clickedElement.parentElement;
        while (currentElement) {
            if (currentElement.id === id) {
                return currentElement;
            }
            currentElement = currentElement.parentElement;
        }

        return null;
    }

    static findClickedElementOrAncestorByClass(event: MouseEvent, classKey: string): HTMLElement | null {
        let clickedElement = event.target as HTMLElement;

        if (clickedElement.nodeType === Node.TEXT_NODE) {
            clickedElement = clickedElement.parentElement!;
        }

        if (clickedElement.classList.contains(classKey)) {
            return clickedElement;
        }

        let currentElement = clickedElement.parentElement;
        while (currentElement) {
            if (currentElement.classList.contains(classKey)) {
                return currentElement;
            }
            currentElement = currentElement.parentElement;
        }

        return null;
    }


    static isEventTargetDescendantOf(event: KeyboardEvent, selector: string): boolean {
        let target: Element | null = event.target as Element;

        if (!(event.target instanceof Element)) {
            return false;
        }

        while (target && target !== document.documentElement) {
            if (target.matches(selector)) {
                return true;
            }
            target = target.parentElement;
        }

        return false;
    }

    static getParentTargetBySelector(event: MouseEvent, selector: string): Element | null {
        let target: Element | null = (event.target instanceof Element) ? event.target : event.target instanceof Node ? event.target.parentElement : null;

        if (!target) {
            return null;
        }

        while (target && target !== document.documentElement) {
            if (target.matches(selector)) {
                return target;
            }
            target = target.parentElement;
        }

        return null;
    }

    static getParentFromSelection(selector: string): Element | null {
        const selection: Selection | null = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            return null;
        }

        let range: Range = selection.getRangeAt(0);
        let commonAncestorContainer: Node = range.commonAncestorContainer;

        if (commonAncestorContainer instanceof Element && commonAncestorContainer.matches(selector)) {
            return commonAncestorContainer;
        }

        let parentElement: Element | null = commonAncestorContainer instanceof Element
            ? commonAncestorContainer
            : commonAncestorContainer.parentElement;

        while (parentElement && parentElement !== document.documentElement) {
            if (parentElement.matches(selector)) {
                return parentElement;
            }
            parentElement = parentElement.parentElement;
        }

        return null;
    }

    static removeClassesWithPrefix(element: Element, prefix: string) {
        const classesToRemove = Array.from(element.classList).filter(cls => cls.startsWith(prefix));
        classesToRemove.forEach(cls => element.classList.remove(cls));
    }

    static isTargetDescendantOfSelector(event: Event, selector: string): boolean {
        let target: HTMLElement | null = null;

        if (event.target instanceof HTMLElement) {
            target = event.target as HTMLElement;
        } else if (event.target instanceof Text) {
            target = (event.target as Text).parentElement;
        }

        if (!target) {
            return false;
        }

        const ancestor = target.closest(selector);

        return ancestor !== null;
    }

    static querySelectorIncludingSelf(element: Element, selector: string): Element | null {
        if (element.matches(selector)) {
            return element;
        }
        return element.querySelector(selector);
    }

    static sanitizeContentEditable(element: HTMLElement): void {
        const content = element.innerHTML;
        const selection = window.getSelection();

        if (!selection) {
            return;
        }

        let shouldRestoreCaret = false;
        let caretPos = 0;
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rangeEndsAtContentEnd = range.endOffset === element.innerText.length;

            if (rangeEndsAtContentEnd && content.endsWith('<br>')) {
                shouldRestoreCaret = true;
                caretPos = range.endOffset;
            }
        }

        if (content.endsWith('<br>')) {
            const lastChild = element.lastChild;
            if (lastChild && lastChild.nodeName === 'BR') {
                element.removeChild(lastChild);
            }
        }

        if (shouldRestoreCaret) {
            const range = new Range();
            const textNodes = this.getTextNodesIn(element);
            let charCount = 0;

            for (const textNode of textNodes) {
                const nodeLength = textNode.length;
                if (charCount + nodeLength >= caretPos) {
                    range.setStart(textNode, caretPos - charCount);
                    range.setEnd(textNode, caretPos - charCount);
                    break;
                }
                charCount += nodeLength;
            }

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    private static getTextNodesIn(node: Node): Text[] {
        let textNodes: Text[] = [];
        if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push(node as Text);
        } else {
            const children = node.childNodes;
            for (let i = 0; i < children.length; i++) {
                textNodes = textNodes.concat(this.getTextNodesIn(children[i]));
            }
        }
        return textNodes;
    }



    static getPreviousContentEditable(element: HTMLElement): HTMLElement | null {
        const allContentEditables: HTMLElement[] = Array.from(document.querySelectorAll('[contenteditable="true"]')) as HTMLElement[];
        const index = allContentEditables.indexOf(element);
        if (index > 0) {
            return allContentEditables[index - 1];
        }
        return null;
    }

    static getNextContentEditable(element: HTMLElement): HTMLElement | null {
        const allContentEditables: HTMLElement[] = Array.from(document.querySelectorAll('[contenteditable="true"]')) as HTMLElement[];
    
        const index = allContentEditables.indexOf(element);
        if (index === -1 || index >= allContentEditables.length - 1) {
            return null;
        }
    
        return allContentEditables[index + 1];
    }


    static getActiveContentEditable(): HTMLElement | null {
        const activeElement = document.activeElement;

        if (!activeElement) {
            return null;
        }

        if (activeElement instanceof HTMLElement && activeElement.isContentEditable) {
            return activeElement;
        }

        let parent = activeElement.parentElement;
        while (parent) {
            if (parent.isContentEditable) {
                return parent;
            }
            parent = parent.parentElement;
        }

        return DOMUtils.findContentEditableInDescendants(activeElement);
    }


    private static findContentEditableInDescendants(element: Element): HTMLElement | null {
        if ((element as HTMLElement).isContentEditable) {
            return element as HTMLElement;
        }
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];
            const result = DOMUtils.findContentEditableInDescendants(child);
            if (result) {
                return result;
            }
        }
        return null;
    }

    static saveCaretPosition2d(element: HTMLElement): { charIndex: number, horizontalPos: number } {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const charIndex = Array.from(element.textContent || '').slice(0, selection.anchorOffset).length;
            return { charIndex, horizontalPos: rect.left };
        }
        return { charIndex: 0, horizontalPos: 0 };
    }

    static restoreCaretPosition2d(element: HTMLElement, position: { charIndex: number, horizontalPos: number }): void {
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection) return;

            const range = document.createRange();
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            let node = walker.nextNode();
            let bestNode = node;
            let bestOffset = 0;
            let bestDistance = Infinity;

            while (node) {
                if (!node.nodeValue) continue;

                for (let i = 0; i <= node.nodeValue.length; i++) {
                    range.setStart(node, i);
                    range.collapse(true);

                    const testRect = range.getBoundingClientRect();
                    const horizontalDistance = Math.abs(testRect.left - position.horizontalPos);

                    if (horizontalDistance < bestDistance) {
                        bestDistance = horizontalDistance;
                        bestNode = node;
                        bestOffset = i;

                        // If it's close enough, break early
                        if (horizontalDistance < 5) break;
                    }
                }

                node = walker.nextNode();
            }

            if (bestNode) {
                range.setStart(bestNode, bestOffset);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });
    }


    static saveCaretPosition3d(element: HTMLElement): { charIndex: number, horizontalPos: number, verticalPos: number } {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const charIndex = Array.from(element.textContent || '').slice(0, selection.anchorOffset).length;
            return { charIndex, horizontalPos: rect.left, verticalPos: rect.top };
        }
        return { charIndex: 0, horizontalPos: 0, verticalPos: 0 };
    }

    static restoreCaretPosition3d(element: HTMLElement, position: { charIndex: number, horizontalPos: number, verticalPos: number }): void {
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection) return;

            const range = document.createRange();
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            let node = walker.nextNode();
            let bestNode = node;
            let bestOffset = 0;
            let bestDistance = Infinity;

            while (node) {
                if (!node.nodeValue) continue;

                for (let i = 0; i <= node.nodeValue.length; i++) {
                    range.setStart(node, i);
                    range.collapse(true);

                    const testRect = range.getBoundingClientRect();
                    const horizontalDistance = Math.abs(testRect.left - position.horizontalPos);
                    const verticalDistance = Math.abs(testRect.top - position.verticalPos);
                    const totalDistance = Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);  // Use Euclidean distance

                    if (totalDistance < bestDistance) {
                        bestDistance = totalDistance;
                        bestNode = node;
                        bestOffset = i;

                        // If it's close enough, break early
                        if (totalDistance < 5) break;
                    }
                }

                node = walker.nextNode();
            }

            if (bestNode) {
                range.setStart(bestNode, bestOffset);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });
    }

    static mergeInlineElements(element: HTMLElement): void {
        element.normalize();

        const children: NodeListOf<ChildNode> = element.childNodes;
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeType === Node.ELEMENT_NODE) {
                const childElement = children[i] as HTMLElement;
                if (['SPAN', 'CODE', 'EM', 'STRONG', 'B', 'I'].includes(childElement.nodeName)) {
                    while (i < children.length - 1 && childElement.nextSibling && childElement.nextSibling.nodeType === Node.ELEMENT_NODE && childElement.nodeName === (childElement.nextSibling as HTMLElement).nodeName) {
                        while ((childElement.nextSibling as HTMLElement).childNodes.length > 0) {
                            childElement.appendChild((childElement.nextSibling as HTMLElement).firstChild!);
                        }
                        element.removeChild(childElement.nextSibling);
                    }
                    DOMUtils.mergeInlineElements(childElement);
                }
            }
        }
    }

    static insertCaretMarker(element: HTMLElement): void {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const isCollapsed = range.collapsed;

            if (isCollapsed) {
                const marker = document.createElement('span');
                marker.id = START_MARKER_ID;
                marker.style.display = 'none';
                range.insertNode(marker);
                range.setStartAfter(marker);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                const endMarker = document.createElement('span');
                endMarker.id = END_MARKER_ID;
                endMarker.style.display = 'none';
                const rangeCloneEnd = range.cloneRange();
                rangeCloneEnd.collapse(false);
                rangeCloneEnd.insertNode(endMarker);

                const startMarker = document.createElement('span');
                startMarker.id = START_MARKER_ID;
                startMarker.style.display = 'none';
                range.collapse(true);
                range.insertNode(startMarker);

                const newRange = document.createRange();
                newRange.setStartAfter(startMarker);
                newRange.setEndBefore(endMarker);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }
    }

    static removeCaretMarkers() {
        document.querySelectorAll(`#${START_MARKER_ID}, #${END_MARKER_ID}`).forEach(marker => {
            marker.parentNode?.removeChild(marker);
        });
    }

    static restoreCaretFromMarker(element: HTMLElement): void {
        const marker = element.querySelector(`#${START_MARKER_ID}`);
        if (marker) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.setStartAfter(marker);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
            marker.parentNode?.removeChild(marker);
        }
    }
}