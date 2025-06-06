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
});
