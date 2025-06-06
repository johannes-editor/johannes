import { UIBuilder } from "./UIBuilder";
import { registerEditorDependenciesForTests } from "../../tests/helpers/registerEditorDependencies";

describe("UIBuilder with johannesEditor element", () => {
  let builder: UIBuilder;

  beforeEach(() => {
    registerEditorDependenciesForTests();
    const editor = createElement();
    document.body.appendChild(editor);
    builder = UIBuilder.build();
    builder.start();
  });

  test("floatingToolbar not start", () => {
    const floatingToolbar = document.getElementById("floatingToolbar");
    expect(floatingToolbar).toBeFalsy();
  });

  test("Checking quickMenu", () => {
    const quickMenu = document.getElementById("quickMenu");
    expect(quickMenu).toBeTruthy();
  });
});

function createElement(): Node {
  const htmlElement = document.createElement("div");
  htmlElement.id = "johannesEditor";
  return htmlElement;
}