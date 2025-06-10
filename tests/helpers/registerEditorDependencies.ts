import { DependencyContainer } from "@/core/DependencyContainer";

class MockTextOperationsService {
    insertText = jest.fn();
    deleteText = jest.fn();
    replaceText = jest.fn();
}

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
    register = jest.fn();
    toggle = jest.fn();
}


class MockMemento {
    get = jest.fn();
    set = jest.fn();
    undo = jest.fn();
    redo = jest.fn();
    saveState = jest.fn();
}

class MockBlockOperationsService {
    createBlock = jest.fn();
    removeBlock = jest.fn();
    splitBlock = jest.fn();
    mergeBlocks = jest.fn();
}

class MockFocusStack {
    push = jest.fn();
    pop = jest.fn();
    peek = jest.fn();
    clear = jest.fn();
}

class MockTableOperationsService {
    insertRow = jest.fn();
    deleteRow = jest.fn();
    mergeCells = jest.fn();
    splitCell = jest.fn();
}

class MockElementFactoryService {
    createElement = jest.fn();
    createBlock = jest.fn();
    createTable = jest.fn();
}

export function registerEditorDependenciesForTests() {
    DependencyContainer.Instance.register("IShortcutListeners", () => new MockShortcutListeners());
    DependencyContainer.Instance.register("ITableListeners", () => new MockTableListeners());
    DependencyContainer.Instance.register("IQuickMenu", () => new MockQuickMenu());
    DependencyContainer.Instance.register("IMemento", () => new MockMemento());
    DependencyContainer.Instance.register("IBlockOperationsService", () => new MockBlockOperationsService());
    DependencyContainer.Instance.register("ITextOperationsService", () => new MockTextOperationsService());
    DependencyContainer.Instance.register("IFocusStack", () => new MockFocusStack());
    DependencyContainer.Instance.register("ITableOperationsService", () => new MockTableOperationsService());
    DependencyContainer.Instance.register("IElementFactoryService", () => new MockElementFactoryService());


}