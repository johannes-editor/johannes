import { Editor } from "../editor/Editor";
import { EditorBuilder } from "@/builders/EditorBuilder";
import { DependencyContainer } from "@/core/DependencyContainer";
import { registerEditorDependenciesForTests } from "../../../tests/helpers/registerEditorDependencies";
import { ElementFactoryService } from "@/services/element-factory/ElementFactoryService";
import { BlockOperationsService } from "@/services/block-operations/BlockOperationsService";
import { FocusStack } from "@/core/FocusStack";
import { Memento } from "@/core/Memento";

describe("AddBlockButton", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="johannesEditor"></div>';
        (window as any).editorConfig = { enableAddBlock: true };

        registerEditorDependenciesForTests();
        DependencyContainer.Instance.register('IElementFactoryService', () => ElementFactoryService.getInstance());
        DependencyContainer.Instance.register('IFocusStack', () => FocusStack.getInstance());
        DependencyContainer.Instance.register('IMemento', () => Memento.getInstance());
        DependencyContainer.Instance.register('IBlockOperationsService', () => BlockOperationsService.getInstance());
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    test("adds a new paragraph when the only existing block is empty", (done) => {
        const editor = EditorBuilder.build();
        expect(editor).toBeInstanceOf(Editor);

        const content = document.querySelector('#johannesEditor .content') as HTMLElement;
        const addBlockButton = document.querySelector('.add-block') as HTMLButtonElement;

        expect(content.querySelectorAll('.block').length).toBe(1);

        addBlockButton.click();

        setTimeout(() => {
            expect(content.querySelectorAll('.block').length).toBe(2);
            done();
        }, 0);
    });
});
