import { TextOperationsService } from "./TextOperationsService"
import { DependencyContainer } from "@/core/DependencyContainer";

class MockMemento {
    get = jest.fn();
    set = jest.fn();
    undo = jest.fn();
    redo = jest.fn();
    saveState = jest.fn();
}

describe("textOperationService", () => {

    beforeEach(() => {
        DependencyContainer.Instance.register("IMemento", () => new MockMemento());
    });

    test("getInstance with success", () => {

        const textOperationService = TextOperationsService.getInstance();

        expect(textOperationService).toBeInstanceOf(TextOperationsService);
    });
});