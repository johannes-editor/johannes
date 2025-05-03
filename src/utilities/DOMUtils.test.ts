import { DOMUtils } from "./DOMUtils";

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