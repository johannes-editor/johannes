import { Content } from "./Content";
import { DependencyContainer } from "@/core/DependencyContainer";
import { TableUtils } from "@/utilities/TableUtils";
import { CustomEvents } from "@/common/CustomEvents";
import { Commands } from "@/commands/Commands";

class MockShortcutListeners {
  bind = jest.fn();
  unbind = jest.fn();
  clear = jest.fn();
}

class MockTableListeners {
  bind = jest.fn();
  unbind = jest.fn();
  clear = jest.fn();
}

class MockQuickMenu {
  open = jest.fn();
  close = jest.fn();
  toggle = jest.fn();
  register = jest.fn();
}

class MockTableContextFloatingToolbar {
  show = jest.fn();
  hide = jest.fn();
  update = jest.fn();
  get isVisible() {
    return false;
  }
}

describe("Content", () => {
  beforeEach(() => {
    DependencyContainer.Instance.register("IShortcutListeners", () => new MockShortcutListeners());
    DependencyContainer.Instance.register("ITableListeners", () => new MockTableListeners());
    DependencyContainer.Instance.register("IQuickMenu", () => new MockQuickMenu());
    DependencyContainer.Instance.register("ITableContextFloatingToolbar", () => new MockTableContextFloatingToolbar());
  });

  test("Create element", () => {
    const content = Content.getInstance();
    expect(content).toBeInstanceOf(Content);
  });

  test("pressing Enter in a table cell triggers table navigation", () => {
    const controller = document.createElement("div");
    controller.className = "table-controller";
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    const row1 = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "editable";
    cell.setAttribute("data-placeholder", "cell");
    cell.contentEditable = "true";
    row1.appendChild(cell);
    tbody.appendChild(row1);
    table.appendChild(tbody);
    controller.appendChild(table);
    document.body.appendChild(controller);

    const spy = jest.spyOn(TableUtils, "moveFocusToBelowCell").mockReturnValue(true);

    Content.getInstance();

    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    cell.dispatchEvent(event);

    expect(spy).toHaveBeenCalled();
  });

  test("pressing Enter in list inside table cell creates new list item", () => {
    const controller = document.createElement("div");
    controller.className = "table-controller";
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    const row1 = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "editable";
    cell.setAttribute("data-placeholder", "cell");
    cell.contentEditable = "true";
    const ul = document.createElement("ul");
    ul.className = "johannes-content-element swittable list";
    const li = document.createElement("li");
    li.className = "list-item";
    const div = document.createElement("div");
    div.className = "focusable editable";
    div.contentEditable = "true";
    li.appendChild(div);
    ul.appendChild(li);
    cell.appendChild(ul);
    row1.appendChild(cell);
    tbody.appendChild(row1);
    table.appendChild(tbody);
    controller.appendChild(table);
    document.body.appendChild(controller);

    const spy = jest.spyOn(TableUtils, "moveFocusToBelowCell");
    const emitted = jest.fn();
    document.addEventListener(CustomEvents.emittedCommand, emitted);

    Content.getInstance();

    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    div.dispatchEvent(event);

    expect(spy).not.toHaveBeenCalled();
    expect(emitted).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { command: Commands.insertNew } })
    );
  });
});
