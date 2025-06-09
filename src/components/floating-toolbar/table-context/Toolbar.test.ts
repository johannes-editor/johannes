import { Toolbar } from "./Toolbar";
import { SelectionModes } from "./SelectionMode";
import { DependencyContainer } from "@/core/DependencyContainer";

class MockFocusStack {
    push = jest.fn();
    pop = jest.fn();
    peek = jest.fn();
    clear = jest.fn();
}

class MockTableOperationsService {
    queryAllStateCellBackgroundColor = jest.fn(() => false);
}

describe("TableContextFloatingToolbar", () => {
    let toolbar: Toolbar;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="johannesEditor">
                <div class="content-wrapper">
                    <table>
                        <tbody>
                            <tr><td id="cell1">a</td><td id="cell2">b</td></tr>
                        </tbody>
                    </table>
                </div>
                <div id="outside"></div>
            </div>
        `;

        DependencyContainer.Instance.register("IFocusStack", () => new MockFocusStack());
        DependencyContainer.Instance.register("ITableOperationsService", () => new MockTableOperationsService());

        toolbar = Toolbar.getInstance();
        document.getElementById("johannesEditor")!.appendChild(toolbar.htmlElement);
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("shows toolbar when mouseup occurs inside wrapper", () => {
        const cell = document.getElementById("cell1") as HTMLTableCellElement;
        const mousedown = new MouseEvent("mousedown", { bubbles: true });
        Object.defineProperty(mousedown, 'target', { value: cell });
        const mouseup = new MouseEvent("mouseup", { bubbles: true });
        Object.defineProperty(mouseup, 'target', { value: cell });

        (toolbar as any).handleMouseDown(mousedown);
        (toolbar as any).handleMouseUp(mouseup);

        expect(toolbar.isVisible).toBe(true);
    });

    test("shows toolbar when mouseup occurs outside wrapper", () => {
        const cell = document.getElementById("cell1") as HTMLTableCellElement;
        const outside = document.getElementById("outside") as HTMLElement;
        const mousedown = new MouseEvent("mousedown", { bubbles: true });
        Object.defineProperty(mousedown, 'target', { value: cell });
        const mouseupOutside = new MouseEvent("mouseup", { bubbles: true });
        Object.defineProperty(mouseupOutside, 'target', { value: outside });

        (toolbar as any).handleMouseDown(mousedown);
        (toolbar as any).handleMouseUp(mouseupOutside);

        expect(toolbar.isVisible).toBe(true);
    });

    test("shows toolbar when multiple cells are selected by dragging", () => {
        const cell1 = document.getElementById("cell1") as HTMLTableCellElement;
        const cell2 = document.getElementById("cell2") as HTMLTableCellElement;

        const mousedown = new MouseEvent("mousedown", { bubbles: true });
        Object.defineProperty(mousedown, 'target', { value: cell1 });
        (toolbar as any).handleMouseDown(mousedown);

        (toolbar as any).selectionMode = SelectionModes.Cell;
        const mousemove = new MouseEvent("mousemove", { bubbles: true });
        Object.defineProperty(mousemove, 'target', { value: cell2 });
        (toolbar as any).handleMouseMove(mousemove);

        const mouseup = new MouseEvent("mouseup", { bubbles: true });
        Object.defineProperty(mouseup, 'target', { value: cell2 });
        (toolbar as any).handleMouseUp(mouseup);

        expect((toolbar as any).selectedCells.length).toBe(2);
        expect(toolbar.isVisible).toBe(true);
    });
});
