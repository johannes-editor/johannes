import { QuickMenu } from "./QuickMenu";
import { DependencyContainer } from "@/core/DependencyContainer";

class MockFocusStack {
  push = jest.fn();
  pop = jest.fn();
  peek = jest.fn();
  clear = jest.fn();
}

describe("QuickMenu", () => {
  beforeEach(() => {
    DependencyContainer.Instance.register("IFocusStack", () => new MockFocusStack());
  });

  test("Create a new QuickMenu with success", () => {
    const quickMenu = QuickMenu.getInstance();
    expect(quickMenu).toBeInstanceOf(QuickMenu);
  });
});
