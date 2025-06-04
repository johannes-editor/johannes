import { QuickMenu } from "./QuickMenu";
import { QuickMenuItem } from "./QuickMenuItem";
import { QuickMenuSection } from "./QuickMenuSection";
import { DependencyContainer } from "@/core/DependencyContainer";

class MockFocusStack {
  push = jest.fn();
  pop = jest.fn();
  peek = jest.fn();
  clear = jest.fn();
}

describe("QuickMenuItem", () => {
  beforeEach(() => {
    DependencyContainer.Instance.register("IFocusStack", () => new MockFocusStack());
  });

  test("Create QuickMenuItem with success", () => {
    const quickMenu = QuickMenu.getInstance();

    const quickMenuSection = new QuickMenuSection({
      quickMenuInstance: quickMenu,
      title: "",
      classList: "a",
    });

    const quickMenuItem = new QuickMenuItem(quickMenuSection, "a", "b", "c", "d", "e");

    expect(quickMenuItem).toBeInstanceOf(QuickMenuItem);
  });
});