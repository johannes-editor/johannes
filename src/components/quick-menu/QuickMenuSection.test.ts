import { QuickMenu } from "./QuickMenu";
import { QuickMenuSection } from "./QuickMenuSection";
import { DependencyContainer } from "@/core/DependencyContainer";

class MockFocusStack {
  push = jest.fn();
  pop = jest.fn();
  peek = jest.fn();
  clear = jest.fn();
}

describe("QuickMenuSection", () => {
  beforeEach(() => {
    DependencyContainer.Instance.register("IFocusStack", () => new MockFocusStack());
  });

  test("Create instance with success", () => {
    const quickMenu = QuickMenu.getInstance();

    const quickMenuSection = new QuickMenuSection({
      quickMenuInstance: quickMenu,
      title: "a",
      classList: "a",
    });

    expect(quickMenuSection).toBeInstanceOf(QuickMenuSection);
  });
});