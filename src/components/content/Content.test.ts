import { Content } from "./Content";
import { DependencyContainer } from "@/core/DependencyContainer";

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

  test("handleSelectionChange removes wrapper editability once selection collapses", () => {
    document.body.innerHTML = `
      <div id="johannesEditor">
        <div class="content-wrapper">
          <p contenteditable="true">Hello</p>
        </div>
      </div>`;

    const content = Content.getInstance();
    const wrapper = document.querySelector(".content-wrapper") as HTMLElement;
    const p = wrapper.querySelector("p") as HTMLElement;

    const range = document.createRange();
    range.setStart(p.firstChild!, 0);
    range.setEnd(p.firstChild!, p.textContent!.length);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    content.handleSelectionChange();

    expect(wrapper.getAttribute("contenteditable")).toBe("true");

    // Collapse selection
    sel?.removeAllRanges();
    const collapsedRange = document.createRange();
    collapsedRange.setStart(p.firstChild!, 1);
    collapsedRange.setEnd(p.firstChild!, 1);
    sel?.addRange(collapsedRange);

    content.handleSelectionChange();

    expect(wrapper.getAttribute("contenteditable")).toBeNull();
  });
});
