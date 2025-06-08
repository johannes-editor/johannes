import { DOMUtils } from "./DOMUtils";
import { fireEvent } from '@testing-library/dom';

describe("DOMUtils.isCursorAtStart", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("should return true when cursor is at the start of contenteditable", () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        element.innerHTML = "Hello, world!";
        document.body.appendChild(element);

        const firstChild = element.firstChild;
        if (firstChild) {
            const range = document.createRange();
            range.setStart(firstChild, 0);
            range.setEnd(firstChild, 0);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);

            const result = DOMUtils.isCursorAtStart(element);
            expect(result).toBe(true);
        } else {
            expect(false).toBe(true);
        }
    });

    test("should return false when cursor is not at the start of contenteditable", () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        element.innerHTML = "Hello, world!";
        document.body.appendChild(element);

        const range = document.createRange();
        const firstChild = element.firstChild;
        if (firstChild) {
            range.setStart(element.firstChild, 5);
            range.setEnd(element.firstChild, 5);
        }

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        const result = DOMUtils.isCursorAtStart(element);
        expect(result).toBe(false);
    });

    test("should return true when contenteditable is empty and cursor is at the start", () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        document.body.appendChild(element);

        const range = document.createRange();
        range.setStart(element, 0);
        range.setEnd(element, 0);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        const result = DOMUtils.isCursorAtStart(element);
        expect(result).toBe(true);
    });

    test("should return false when there is no selection", () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        element.innerHTML = "Hello, world!";
        document.body.appendChild(element);

        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
        }

        const result = DOMUtils.isCursorAtStart(element);
        expect(result).toBe(false);
    });

    test("should return false when contenteditable is empty and cursor is not at the start", () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        document.body.appendChild(element);

        const range = document.createRange();

        try {
            range.setStart(element, 1);
            range.setEnd(element, 1);
        } catch (e) {
            const result = DOMUtils.isCursorAtStart(element);
            expect(result).toBe(false);
        }
    });

    test("should return false when no contenteditable elements exist", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);

        const result = DOMUtils.isCursorAtStart(element);
        expect(result).toBe(false);
    });
});

describe("DOMUtils.isCursorAtEnd", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("should return true when cursor is at the end of contenteditable", () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        element.innerHTML = "Hello, world!";
        document.body.appendChild(element);

        const range = document.createRange();
        const firstChild = element.firstChild;
        if (firstChild) {
            range.setStart(firstChild, element.innerHTML.length);
            range.setEnd(firstChild, element.innerHTML.length);
        }

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        const result = DOMUtils.isCursorAtEnd(element);
        expect(result).toBe(true);
    });

    test("should return false when cursor is not at the end of contenteditable", () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        element.innerHTML = "Hello, world!";
        document.body.appendChild(element);

        const range = document.createRange();
        const firstChild = element.firstChild;
        if (firstChild) {
            range.setStart(firstChild, 5);
            range.setEnd(firstChild, 5);
        }

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        const result = DOMUtils.isCursorAtEnd(element);
        expect(result).toBe(false);
    });

    test("should return true when contenteditable is empty and cursor is at the end", () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        document.body.appendChild(element);

        const range = document.createRange();
        range.setStart(element, 0);
        range.setEnd(element, 0);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);

        const result = DOMUtils.isCursorAtEnd(element);
        expect(result).toBe(true);
    });

    test("should return false when there is no selection", () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        element.innerHTML = "Hello, world!";
        document.body.appendChild(element);

        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
        }

        const result = DOMUtils.isCursorAtEnd(element);
        expect(result).toBe(false);
    });

    test("should return false when contenteditable is empty and cursor is not at the end", () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        document.body.appendChild(element);

        const range = document.createRange();

        try {
            range.setStart(element, 1);
            range.setEnd(element, 1);

            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);

            const result = DOMUtils.isCursorAtEnd(element);
            expect(result).toBe(false);
        } catch (e) {
            const result = DOMUtils.isCursorAtEnd(element);
            expect(result).toBe(false);
        }
    });

    test("should return false when no contenteditable elements exist", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);

        const result = DOMUtils.isCursorAtEnd(element);
        expect(result).toBe(false);
    });
});


describe("Utils", () => {

    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("IsDescendant should be true", () => {
        document.body.innerHTML = "<div class='parent'><div class='child'>This is a child element</div></div>";

        const child = document.querySelector(".child");
        if (!child || !child.firstChild) {
            throw new Error("Child element or its text node is not found in the DOM setup");
        }

        const range = new Range();
        range.setStart(child.firstChild, 0);
        range.setEnd(child.firstChild, child.firstChild.textContent!.length);

        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);

        const result = DOMUtils.isSelectedTextDescendantOf(".parent");
        expect(result).toBe(true);
    });

    test("IsDescendant should be false when parent does not exist", () => {
        const childDiv = document.createElement("div");
        childDiv.classList.add("child");
        childDiv.textContent = "This is a child element";

        document.body.appendChild(childDiv);

        const range = new Range();
        range.setStart(childDiv.firstChild!, 0);
        range.setEnd(childDiv.firstChild!, childDiv.firstChild!.textContent!.length);

        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);

        const result = DOMUtils.isSelectedTextDescendantOf(".parent");
        expect(result).toBe(false);
    });

    test("IsDescendant should be false when parent parameter does not exist but child has a parent", () => {
        const parentDiv = document.createElement("div");
        parentDiv.classList.add("parent");

        const childDiv = document.createElement("div");
        childDiv.classList.add("child");
        childDiv.textContent = "This is a child element";

        parentDiv.appendChild(childDiv);
        document.body.appendChild(parentDiv);

        const range = new Range();
        range.setStart(childDiv.firstChild!, 0);
        range.setEnd(childDiv.firstChild!, childDiv.firstChild!.textContent!.length);

        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);

        const result = DOMUtils.isSelectedTextDescendantOf(".no-exist");
        expect(result).toBe(false);
    });

});






describe("DOMUtils.restoreCaretFromMarker", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        window.getSelection()?.removeAllRanges();
    });

    test("should do nothing when no marker exists", () => {
        const container = document.createElement("div");
        container.innerHTML = "Hello World";
        document.body.appendChild(container);

        DOMUtils.restoreCaretFromMarker(container);

        const selection = window.getSelection();
        expect(selection?.rangeCount).toBe(0);
    });

    test("should work with complex nested structure", () => {
        const container = document.createElement("div");
        container.innerHTML = `
                <p>Paragraph <span>with <strong>nested <span id='caret-start-marker' style='display: none;'></span>elements</strong></span></p>
            `;
        document.body.appendChild(container);

        DOMUtils.restoreCaretFromMarker(container);

        const selection = window.getSelection();
        expect(selection?.rangeCount).toBe(1);

        const range = selection?.getRangeAt(0);
        expect(range?.collapsed).toBe(true);

        expect(container.querySelector("#caret-start-marker")).toBeNull();
    });

    test("should not throw error when container is empty", () => {
        const container = document.createElement("div");
        document.body.appendChild(container);

        expect(() => DOMUtils.restoreCaretFromMarker(container)).not.toThrow();
    });
});

describe("DOMUtils.getNextContentEditable", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("should return the next contenteditable element", () => {
        const first = document.createElement("div");
        first.setAttribute("contenteditable", "true");
        const second = document.createElement("div");
        second.setAttribute("contenteditable", "true");
        const third = document.createElement("div");
        third.setAttribute("contenteditable", "true");

        document.body.append(first, second, third);

        const result = DOMUtils.getNextContentEditable(first);
        expect(result).toBe(second);
    });

    test("should return null if element is the last contenteditable", () => {
        const first = document.createElement("div");
        first.setAttribute("contenteditable", "true");
        const second = document.createElement("div");
        second.setAttribute("contenteditable", "true");

        document.body.append(first, second);

        const result = DOMUtils.getNextContentEditable(second);
        expect(result).toBeNull();
    });

    test("should return null if element is not in the list", () => {
        const editable1 = document.createElement("div");
        editable1.setAttribute("contenteditable", "true");

        const editable2 = document.createElement("div");
        editable2.setAttribute("contenteditable", "true");

        const notEditable = document.createElement("div");

        document.body.append(editable1, editable2);

        const result = DOMUtils.getNextContentEditable(notEditable);
        expect(result).toBeNull();
    });

    test("should return null when no contenteditable elements exist", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);

        const result = DOMUtils.getNextContentEditable(element);
        expect(result).toBeNull();
    });
});

describe("DOMUtils.getPreviousContentEditable", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("should return the previous contenteditable element when in the middle", () => {
        const div1 = document.createElement("div");
        div1.setAttribute("contenteditable", "true");

        const div2 = document.createElement("div");
        div2.setAttribute("contenteditable", "true");

        const div3 = document.createElement("div");
        div3.setAttribute("contenteditable", "true");

        document.body.append(div1, div2, div3);

        const result = DOMUtils.getPreviousContentEditable(div2);
        expect(result).toBe(div1);
    });

    test("should return the previous contenteditable element when at the end", () => {
        const div1 = document.createElement("div");
        div1.setAttribute("contenteditable", "true");

        const div2 = document.createElement("div");
        div2.setAttribute("contenteditable", "true");

        document.body.append(div1, div2);

        const result = DOMUtils.getPreviousContentEditable(div2);
        expect(result).toBe(div1);
    });

    test("should return null when the element is the first contenteditable", () => {
        const div1 = document.createElement("div");
        div1.setAttribute("contenteditable", "true");

        const div2 = document.createElement("div");
        div2.setAttribute("contenteditable", "true");

        document.body.append(div1, div2);

        const result = DOMUtils.getPreviousContentEditable(div1);
        expect(result).toBeNull();
    });

    test("should return null if the element is not in the list", () => {
        const editable = document.createElement("div");
        editable.setAttribute("contenteditable", "true");

        const notInList = document.createElement("div");

        document.body.append(editable);

        const result = DOMUtils.getPreviousContentEditable(notInList);
        expect(result).toBeNull();
    });

    test("should return null when no contenteditable elements exist", () => {
        const div = document.createElement("div");
        document.body.appendChild(div);

        const result = DOMUtils.getPreviousContentEditable(div);
        expect(result).toBeNull();
    });
});


describe("DOMUtils.getTextNodesIn", () => {
    const getTextNodesIn = (DOMUtils as any).getTextNodesIn as (node: Node) => Text[];

    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("should return single text node when node is a text node", () => {
        const textNode = document.createTextNode("Hello");
        const result = getTextNodesIn(textNode);
        expect(result).toHaveLength(1);
        expect(result[0].textContent).toBe("Hello");
    });

    test("should return all text nodes in a flat structure", () => {
        const container = document.createElement("div");
        container.innerHTML = "Hello <span>World</span>";
        document.body.appendChild(container);

        const result = getTextNodesIn(container);
        expect(result.map(n => n.textContent)).toEqual(["Hello ", "World"]);
    });

    test("should return all text nodes in a deeply nested structure", () => {
        const container = document.createElement("div");
        container.innerHTML = `
            <div>
                <p>Hello <span><b>deep</b> inside</span></p>
                <p>another <i>level</i></p>
            </div>
        `;
        document.body.appendChild(container);

        const result = getTextNodesIn(container);
        expect(result.map(n => n.textContent?.trim()).filter(Boolean)).toEqual(["Hello", "deep", "inside", "another", "level"]);
    });

    test("should return empty array when node has no text", () => {
        const container = document.createElement("div");
        container.innerHTML = `<div><span><b></b></span></div>`;
        document.body.appendChild(container);

        const result = getTextNodesIn(container);
        expect(result).toHaveLength(0);
    });

    test("should ignore comment nodes and elements without text", () => {
        const container = document.createElement("div");
        container.appendChild(document.createComment("this is a comment"));
        container.appendChild(document.createElement("span"));

        const result = getTextNodesIn(container);
        expect(result).toHaveLength(0);
    });
});

describe("DOMUtils.sanitizeContentEditable", () => {
    let editable: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = "";
        editable = document.createElement("div");
        editable.setAttribute("contenteditable", "true");
        document.body.appendChild(editable);
        window.getSelection()?.removeAllRanges();
    });

    test("should remove trailing <br> from contenteditable", () => {
        editable.innerHTML = "Hello<br>";
        DOMUtils.sanitizeContentEditable(editable);
        expect(editable.innerHTML).toBe("Hello");
    });

    test("should not remove <br> when it is not at the end", () => {
        editable.innerHTML = "Hello<br>World";
        DOMUtils.sanitizeContentEditable(editable);
        expect(editable.innerHTML).toBe("Hello<br>World");
    });

    test("should keep <br> when content only contains <br>", () => {
        editable.innerHTML = "<br>";
        DOMUtils.sanitizeContentEditable(editable);
        expect(editable.innerHTML).toBe("<br>");
    });

    test("should restore caret when selection is at the end and content ends with <br>", () => {
        editable.innerHTML = "Hello<br>";
        const textNode = editable.firstChild!;
        const range = new Range();
        range.setStart(textNode, 5);
        range.setEnd(textNode, 5);

        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);

        DOMUtils.sanitizeContentEditable(editable);

        const newRange = selection.getRangeAt(0);
        expect(newRange.startContainer).toBeInstanceOf(Text);
        expect(newRange.startOffset).toBe(5);
        expect(editable.innerHTML).toBe("Hello");
    });

    test("should not restore caret when selection is not at the end", () => {
        editable.innerHTML = "Hello<br>";
        const textNode = editable.firstChild!;
        const range = new Range();
        range.setStart(textNode, 2);
        range.setEnd(textNode, 2);

        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);

        DOMUtils.sanitizeContentEditable(editable);

        const newRange = selection.getRangeAt(0);
        expect(newRange.startOffset).toBe(2);
        expect(editable.innerHTML).toBe("Hello");
    });

    test("should not throw if selection is null", () => {
        const originalGetSelection = window.getSelection;
        window.getSelection = () => null;

        editable.innerHTML = "Hello<br>";

        expect(() => DOMUtils.sanitizeContentEditable(editable)).not.toThrow();
        expect(editable.innerHTML).toBe("Hello<br>");

        window.getSelection = originalGetSelection;
    });
});

describe("DOMUtils.trimEmptyTextAndBrElements", () => {
    test("should keep single <br> when element only has <br>", () => {
        const div = document.createElement("div");
        div.innerHTML = "<br>";
        DOMUtils.trimEmptyTextAndBrElements(div);
        expect(div.innerHTML).toBe("<br>");
    });

    test("should remove leading and trailing <br> when text is present", () => {
        const div = document.createElement("div");
        div.innerHTML = "<br>Hello<br>";
        DOMUtils.trimEmptyTextAndBrElements(div);
        expect(div.innerHTML).toBe("Hello");
    });
});


describe("DOMUtils.querySelectorIncludingSelf", () => {

    test("should return element if it matches the selector", () => {
        const element = document.createElement("div");
        element.classList.add("test-class");

        const result = DOMUtils.querySelectorIncludingSelf(element, ".test-class");

        expect(result).toBe(element);
    });

    test("should return first matching child element if element does not match", () => {
        const element = document.createElement("div");
        const child = document.createElement("span");
        child.classList.add("test-class");
        element.appendChild(child);

        const result = DOMUtils.querySelectorIncludingSelf(element, ".test-class");

        expect(result).toBe(child);
    });

    test("should return null if element does not match and has no matching children", () => {
        const element = document.createElement("div");

        const result = DOMUtils.querySelectorIncludingSelf(element, ".test-class");

        expect(result).toBeNull();
    });

    test("should return element if ID matches", () => {
        const element = document.createElement("div");
        element.id = "test-id";

        const result = DOMUtils.querySelectorIncludingSelf(element, "#test-id");

        expect(result).toBe(element);
    });

    test("should return element if class matches", () => {
        const element = document.createElement("div");
        element.classList.add("test-class");

        const result = DOMUtils.querySelectorIncludingSelf(element, ".test-class");

        expect(result).toBe(element);
    });

    test("should return element if it matches selector even with a more generic selector", () => {
        const element = document.createElement("div");

        const result = DOMUtils.querySelectorIncludingSelf(element, "div");

        expect(result).toBe(element);
    });

    test("should return element if it matches :hover pseudo-class after mouseover", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);

        element.style.transition = "all 0.2s";
        element.classList.add("hover-class");
        element.innerHTML = "Test Hover";

        const style = document.createElement('style');
        style.innerHTML = `
            .hover-class:hover {
                background-color: yellow;
            }
        `;
        document.head.appendChild(style);

        fireEvent.mouseOver(element);

        const result = DOMUtils.querySelectorIncludingSelf(element, ":hover");

        expect(result).toBe(element);
    });

    test("should throw an error if the selector is invalid", () => {
        const element = document.createElement("div");

        expect(() => {
            DOMUtils.querySelectorIncludingSelf(element, "/* invalid selector */");
        }).toThrowError();
    });

});

describe("DOMUtils.isTargetDescendantOfSelector", () => {

    test("should return true if the target is a descendant of the selector", () => {
        const container = document.createElement("div");
        const parent = document.createElement("div");
        const child = document.createElement("div");

        parent.classList.add("parent");
        child.classList.add("child");
        parent.appendChild(child);
        container.appendChild(parent);
        document.body.appendChild(container);

        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
        });

        child.dispatchEvent(event);

        const result = DOMUtils.isTargetDescendantOfSelector(event, ".parent");
        expect(result).toBe(true);
    });

    test("should return false if the target is not a descendant of the selector", () => {
        const container = document.createElement("div");
        const parent = document.createElement("div");
        const child = document.createElement("div");

        parent.classList.add("parent");
        child.classList.add("child");
        container.appendChild(parent);
        container.appendChild(child);
        document.body.appendChild(container);

        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
        });

        child.dispatchEvent(event);

        const result = DOMUtils.isTargetDescendantOfSelector(event, ".parent");
        expect(result).toBe(false);
    });

    test("should return true if the target itself matches the selector", () => {
        const container = document.createElement("div");
        const element = document.createElement("div");

        element.classList.add("parent");
        container.appendChild(element);
        document.body.appendChild(container);

        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
        });

        element.dispatchEvent(event);

        const result = DOMUtils.isTargetDescendantOfSelector(event, ".parent");
        expect(result).toBe(true);
    });

    test("should return true if the target is a text node inside a matching element", () => {
        const element = document.createElement("div");
        element.classList.add("parent");

        const textNode = document.createTextNode("Hello");
        element.appendChild(textNode);
        document.body.appendChild(element);

        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            composed: true,
        });

        textNode.dispatchEvent(event);

        const result = DOMUtils.isTargetDescendantOfSelector(event, ".parent");
        console.log("Result:", result);

        expect(result).toBe(true);
    });

    test("should return false if the event target is null", () => {
        const event = {} as MouseEvent;

        const result = DOMUtils.isTargetDescendantOfSelector(event, ".parent");
        expect(result).toBe(false);
    });

    test("should return false if the target has no parent matching the selector", () => {
        const container = document.createElement("div");
        const child = document.createElement("div");
        child.classList.add("child");
        container.appendChild(child);
        document.body.appendChild(container);

        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
        });

        child.dispatchEvent(event);

        const result = DOMUtils.isTargetDescendantOfSelector(event, ".parent");
        expect(result).toBe(false);
    });
});


describe("DOMUtils.removeClassesWithPrefix", () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = document.createElement("div");
    });

    test("should remove all classes starting with the prefix", () => {
        element.classList.add("prefix-one", "prefix-two", "other-class");

        DOMUtils.removeClassesWithPrefix(element, "prefix");

        expect(element.classList.contains("prefix-one")).toBe(false);
        expect(element.classList.contains("prefix-two")).toBe(false);
        expect(element.classList.contains("other-class")).toBe(true);
    });

    test("should not remove classes if no class starts with the prefix", () => {
        element.classList.add("no-prefix", "another-class");

        DOMUtils.removeClassesWithPrefix(element, "prefix");

        expect(element.classList.contains("no-prefix")).toBe(true);
        expect(element.classList.contains("another-class")).toBe(true);
    });

    test("should work when the element has no classes", () => {
        DOMUtils.removeClassesWithPrefix(element, "prefix");

        expect(element.classList.length).toBe(0);
    });

    test("should not remove classes if the prefix doesn't match any class", () => {
        element.classList.add("some-class", "other-class");

        DOMUtils.removeClassesWithPrefix(element, "prefix");

        expect(element.classList.contains("some-class")).toBe(true);
        expect(element.classList.contains("other-class")).toBe(true);
    });

    test("should not affect other classes not related to the prefix", () => {
        element.classList.add("prefix-class", "other-class");

        DOMUtils.removeClassesWithPrefix(element, "prefix");

        expect(element.classList.contains("prefix-class")).toBe(false);
        expect(element.classList.contains("other-class")).toBe(true);
    });
});

describe("DOMUtils.getParentFromSelection", () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = document.createElement("div");
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("should return null if there is no valid selection", () => {
        const result = DOMUtils.getParentFromSelection(".parent");
        expect(result).toBeNull();
    });

    test("should return the element if it matches the selector and is the common ancestor", () => {
        element.classList.add("parent");
        const span = document.createElement("span");
        element.appendChild(span);
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(span);
        selection?.removeAllRanges();
        selection?.addRange(range);

        const result = DOMUtils.getParentFromSelection(".parent");

        expect(result).toBe(element);
    });

    test("should return the parent element if it matches the selector", () => {
        const parent = document.createElement("div");
        parent.classList.add("parent");
        const child = document.createElement("span");
        child.textContent = "Test";
        parent.appendChild(child);
        document.body.appendChild(parent);

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(child);
        selection?.removeAllRanges();
        selection?.addRange(range);

        const result = DOMUtils.getParentFromSelection(".parent");

        expect(result).toBe(parent);
    });

    test("should return null if no matching parent is found", () => {
        const parent = document.createElement("div");
        const child = document.createElement("span");
        child.textContent = "Test";
        parent.appendChild(child);
        document.body.appendChild(parent);

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(child);
        selection?.removeAllRanges();
        selection?.addRange(range);

        const result = DOMUtils.getParentFromSelection(".non-existent");

        expect(result).toBeNull();
    });

    test("should return null if common ancestor is not an element", () => {
        const selection = window.getSelection();
        const range = document.createRange();
        const textNode = document.createTextNode("Hello");
        document.body.appendChild(textNode);
        range.selectNodeContents(textNode);
        selection?.removeAllRanges();
        selection?.addRange(range);

        const result = DOMUtils.getParentFromSelection(".parent");

        expect(result).toBeNull();
    });
});

describe("DOMUtils.getParentTargetBySelector", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("should return the target element if it matches the selector", () => {
        const element = document.createElement("div");
        element.classList.add("target");
        document.body.appendChild(element);

        const event = new MouseEvent("click", { bubbles: true });
        Object.defineProperty(event, "target", { value: element });

        const result = DOMUtils.getParentTargetBySelector(event, ".target");

        expect(result).toBe(element);
    });

    test("should return the parent element that matches the selector", () => {
        const parent = document.createElement("div");
        parent.classList.add("parent");
        const child = document.createElement("span");
        parent.appendChild(child);
        document.body.appendChild(parent);

        const event = new MouseEvent("click", { bubbles: true });
        Object.defineProperty(event, "target", { value: child });

        const result = DOMUtils.getParentTargetBySelector(event, ".parent");

        expect(result).toBe(parent);
    });

    test("should return null if no matching ancestor is found", () => {
        const parent = document.createElement("div");
        const child = document.createElement("span");
        parent.appendChild(child);
        document.body.appendChild(parent);

        const event = new MouseEvent("click", { bubbles: true });
        Object.defineProperty(event, "target", { value: child });

        const result = DOMUtils.getParentTargetBySelector(event, ".not-found");

        expect(result).toBeNull();
    });

    test("should return null if event.target is not an Element or Node", () => {
        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: null });

        const result = DOMUtils.getParentTargetBySelector(event, ".any");

        expect(result).toBeNull();
    });

    test("should return parent if event.target is a Text node", () => {
        const parent = document.createElement("div");
        parent.classList.add("wrapper");
        const textNode = document.createTextNode("Hello");
        parent.appendChild(textNode);
        document.body.appendChild(parent);

        const event = new MouseEvent("click", { bubbles: true });
        Object.defineProperty(event, "target", { value: textNode });

        const result = DOMUtils.getParentTargetBySelector(event, ".wrapper");

        expect(result).toBe(parent);
    });
});

describe("DOMUtils.isEventTargetDescendantOf", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("should return true if the target element matches the selector", () => {
        const target = document.createElement("div");
        target.classList.add("match");
        document.body.appendChild(target);

        const event = new KeyboardEvent("keydown");
        Object.defineProperty(event, "target", { value: target });

        const result = DOMUtils.isEventTargetDescendantOf(event, ".match");

        expect(result).toBe(true);
    });

    test("should return true if a parent element matches the selector", () => {
        const parent = document.createElement("div");
        parent.classList.add("parent");
        const child = document.createElement("span");
        parent.appendChild(child);
        document.body.appendChild(parent);

        const event = new KeyboardEvent("keydown");
        Object.defineProperty(event, "target", { value: child });

        const result = DOMUtils.isEventTargetDescendantOf(event, ".parent");

        expect(result).toBe(true);
    });

    test("should return false if no element in the tree matches the selector", () => {
        const wrapper = document.createElement("div");
        const inner = document.createElement("span");
        wrapper.appendChild(inner);
        document.body.appendChild(wrapper);

        const event = new KeyboardEvent("keydown");
        Object.defineProperty(event, "target", { value: inner });

        const result = DOMUtils.isEventTargetDescendantOf(event, ".not-found");

        expect(result).toBe(false);
    });

    test("should return false if the event target is not an Element", () => {
        const event = new KeyboardEvent("keydown");
        Object.defineProperty(event, "target", { value: null });

        const result = DOMUtils.isEventTargetDescendantOf(event, ".any");

        expect(result).toBe(false);
    });

    test("should return false if the event target is a Text node", () => {
        const parent = document.createElement("div");
        parent.classList.add("some-parent");
        const textNode = document.createTextNode("test");
        parent.appendChild(textNode);
        document.body.appendChild(parent);

        const event = new KeyboardEvent("keydown");
        Object.defineProperty(event, "target", { value: textNode });

        const result = DOMUtils.isEventTargetDescendantOf(event, ".some-parent");

        expect(result).toBe(false);
    });
});


describe("DOMUtils.findClickedElementOrAncestorByClass", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("should return the clicked element if it has the class", () => {
        const element = document.createElement("div");
        element.classList.add("clickable");
        document.body.appendChild(element);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: element });

        const result = DOMUtils.findClickedElementOrAncestorByClass(event, "clickable");
        expect(result).toBe(element);
    });

    test("should return the ancestor element with the class", () => {
        const parent = document.createElement("div");
        parent.classList.add("clickable");
        const child = document.createElement("span");
        parent.appendChild(child);
        document.body.appendChild(parent);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: child });

        const result = DOMUtils.findClickedElementOrAncestorByClass(event, "clickable");
        expect(result).toBe(parent);
    });

    test("should return the parent if the clicked target is a Text node", () => {
        const parent = document.createElement("div");
        parent.classList.add("clickable");
        const textNode = document.createTextNode("text");
        parent.appendChild(textNode);
        document.body.appendChild(parent);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: textNode });

        const result = DOMUtils.findClickedElementOrAncestorByClass(event, "clickable");
        expect(result).toBe(parent);
    });

    test("should return null if neither the element nor its ancestors have the class", () => {
        const outer = document.createElement("div");
        const inner = document.createElement("span");
        outer.appendChild(inner);
        document.body.appendChild(outer);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: inner });

        const result = DOMUtils.findClickedElementOrAncestorByClass(event, "nonexistent");
        expect(result).toBeNull();
    });

    test("should handle elements with no parent safely", () => {
        const element = document.createElement("div");
        element.classList.add("clickable");

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: element });

        const result = DOMUtils.findClickedElementOrAncestorByClass(event, "clickable");
        expect(result).toBe(element);
    });
});

describe("DOMUtils.findClickedElementOrAncestorById", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("should return the clicked element if it has the ID", () => {
        const element = document.createElement("div");
        element.id = "target-id";
        document.body.appendChild(element);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: element });

        const result = DOMUtils.findClickedElementOrAncestorById(event, "target-id");
        expect(result).toBe(element);
    });

    test("should return the ancestor element if it has the ID", () => {
        const parent = document.createElement("div");
        parent.id = "target-id";
        const child = document.createElement("span");
        parent.appendChild(child);
        document.body.appendChild(parent);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: child });

        const result = DOMUtils.findClickedElementOrAncestorById(event, "target-id");
        expect(result).toBe(parent);
    });

    test("should return parent if clicked node is a Text node inside an element with the ID", () => {
        const parent = document.createElement("div");
        parent.id = "target-id";
        const textNode = document.createTextNode("some text");
        parent.appendChild(textNode);
        document.body.appendChild(parent);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: textNode });

        const result = DOMUtils.findClickedElementOrAncestorById(event, "target-id");
        expect(result).toBe(parent);
    });

    test("should return null if no element or ancestor has the ID", () => {
        const outer = document.createElement("div");
        const inner = document.createElement("span");
        outer.appendChild(inner);
        document.body.appendChild(outer);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: inner });

        const result = DOMUtils.findClickedElementOrAncestorById(event, "nonexistent-id");
        expect(result).toBeNull();
    });

    test("should handle elements without parentElement safely", () => {
        const element = document.createElement("div");
        element.id = "target-id";

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: element });

        const result = DOMUtils.findClickedElementOrAncestorById(event, "target-id");
        expect(result).toBe(element);
    });
});

describe("DOMUtils.findClickedElementOrAncestorByDataContentType", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("should return clicked element if it has matching data-content-type", () => {
        const element = document.createElement("div");
        element.dataset.contentType = "test";
        document.body.appendChild(element);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: element });

        const result = DOMUtils.findClickedElementOrAncestorByDataContentType(event, "test");
        expect(result).toBe(element);
    });

    test("should return ancestor if it has matching data-content-type", () => {
        const parent = document.createElement("div");
        parent.dataset.contentType = "test";
        const child = document.createElement("span");
        parent.appendChild(child);
        document.body.appendChild(parent);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: child });

        const result = DOMUtils.findClickedElementOrAncestorByDataContentType(event, "test");
        expect(result).toBe(parent);
    });

    test("should return parent if target is a TextNode inside element with matching data-content-type", () => {
        const parent = document.createElement("div");
        parent.dataset.contentType = "test";
        const textNode = document.createTextNode("text here");
        parent.appendChild(textNode);
        document.body.appendChild(parent);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: textNode });

        const result = DOMUtils.findClickedElementOrAncestorByDataContentType(event, "test");
        expect(result).toBe(parent);
    });

    test("should return null if no element or ancestor has matching data-content-type", () => {
        const div = document.createElement("div");
        const span = document.createElement("span");
        div.appendChild(span);
        document.body.appendChild(div);

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: span });

        const result = DOMUtils.findClickedElementOrAncestorByDataContentType(event, "nonexistent");
        expect(result).toBeNull();
    });

    test("should handle element with no parentElement safely", () => {
        const element = document.createElement("div");
        element.dataset.contentType = "test";

        const event = new MouseEvent("click");
        Object.defineProperty(event, "target", { value: element });

        const result = DOMUtils.findClickedElementOrAncestorByDataContentType(event, "test");
        expect(result).toBe(element);
    });
});


describe("DOMUtils.isSelectedTextDescendantOf", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        container.innerHTML = `<div class="wrapper"><p class="target">Some <b>bold</b> text</p></div>`;
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        const selection = window.getSelection();
        selection?.removeAllRanges();
    });

    function selectTextInsideElement(selector: string) {
        const element = container.querySelector(selector);
        const textNode = element?.firstChild;
        if (textNode) {
            const range = document.createRange();
            range.setStart(textNode, 0);
            range.setEnd(textNode, textNode.textContent!.length);

            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }

    test("should return true if selected text is within an element matching the selector", () => {
        selectTextInsideElement(".target");
        const result = DOMUtils.isSelectedTextDescendantOf(".wrapper");
        expect(result).toBe(true);
    });

    test("should return false if selected text is not within an element matching the selector", () => {
        selectTextInsideElement(".target");
        const result = DOMUtils.isSelectedTextDescendantOf(".nonexistent");
        expect(result).toBe(false);
    });

    test("should return false if no selection exists", () => {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        const result = DOMUtils.isSelectedTextDescendantOf(".target");
        expect(result).toBe(false);
    });

    test("should return false if selection has no range", () => {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        const result = DOMUtils.isSelectedTextDescendantOf(".target");
        expect(result).toBe(false);
    });

    test("should return true if selected text is inside a text node inside a matching element", () => {
        const bold = container.querySelector("b")!;
        const textNode = bold.firstChild!;
        const range = document.createRange();
        range.setStart(textNode, 0);
        range.setEnd(textNode, textNode.textContent!.length);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);

        const result = DOMUtils.isSelectedTextDescendantOf(".target");
        expect(result).toBe(true);
    });
});


describe("DOMUtils.getBlockFromEvent", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        container.innerHTML = `
            <div class="block" id="block">
                <div class="child" id="child">Click me</div>
            </div>
        `;
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("should return the closest .block ancestor from event target", () => {
        const child = document.getElementById("child")!;
        const event = new MouseEvent("click", { bubbles: true });
        Object.defineProperty(event, "target", { value: child });

        const block = DOMUtils.getBlockFromEvent(event);
        expect(block).toBe(document.getElementById("block"));
    });

    test("should return null if the event target is not within a .block", () => {
        const outside = document.createElement("div");
        outside.textContent = "Outside";
        document.body.appendChild(outside);

        const event = new MouseEvent("click", { bubbles: true });
        Object.defineProperty(event, "target", { value: outside });

        const block = DOMUtils.getBlockFromEvent(event);
        expect(block).toBeNull();
    });

    test("should return null if the target is not an Element", () => {
        const textNode = document.createTextNode("text");
        container.appendChild(textNode);

        const event = new Event("click");
        Object.defineProperty(event, "target", { value: textNode });

        const block = DOMUtils.getBlockFromEvent(event);
        expect(block).toBeNull();
    });

    test("should return null if the event has no target", () => {
        const event = new Event("click");
        Object.defineProperty(event, "target", { value: null });

        const block = DOMUtils.getBlockFromEvent(event);
        expect(block).toBeNull();
    });
});

describe("DOMUtils.getCurrentActiveBlock", () => {
    let container: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="block" id="block">
                <div contenteditable="true" id="editable">Text</div>
            </div>
            <div id="outside" contenteditable="true">Outside</div>
        `;
        container = document.body;
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("should return the closest .block element from the active element", () => {
        const editable = document.getElementById("editable")!;
        editable.focus();

        const block = DOMUtils.getCurrentActiveBlock();
        expect(block).toBe(document.getElementById("block"));
    });

    test("should return null if the active element is not inside a .block", () => {
        const outside = document.getElementById("outside")!;
        outside.focus();

        const block = DOMUtils.getCurrentActiveBlock();
        expect(block).toBeNull();
    });

    test("should return null if there is no active element", () => {
        Object.defineProperty(document, "activeElement", {
            value: null,
            configurable: true,
        });

        const block = DOMUtils.getCurrentActiveBlock();
        expect(block).toBeNull();
    });
});
