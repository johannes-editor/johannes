import { BlockOperationsService } from './BlockOperationsService';
import { EventEmitter } from '../../commands/EventEmitter';
import { DOMUtils } from '../../utilities/DOMUtils';
import { DependencyContainer } from '../../core/DependencyContainer';
import { ContentTypes } from '@/common/ContentTypes';
import { ElementFactoryService } from '../element-factory/ElementFactoryService';

const mockElementFactoryService = {
    create: jest.fn()
};

const mockFocusStack = {
    peek: jest.fn(),
    push: jest.fn()
};

const mockMemento = {
    saveState: jest.fn()
};

describe('BlockOperationsService.transformBlock', () => {
    let service: BlockOperationsService;

    beforeEach(() => {
        (BlockOperationsService as any).instance = null;

        jest.spyOn(DependencyContainer.Instance, 'resolve').mockImplementation((token: string) => {
            if (token === 'IElementFactoryService') return mockElementFactoryService;
            if (token === 'IFocusStack') return mockFocusStack;
            if (token === 'IMemento') return mockMemento;
            return null;
        });

        service = BlockOperationsService.getInstance();
    });

    test('should insert a separator before the current block', () => {
        const mockEditable = document.createElement('div');
        mockEditable.setAttribute('contenteditable', 'true');

        const mockContent = document.createElement('div');
        mockContent.classList.add('swittable');
        mockContent.appendChild(mockEditable);

        const mockBlock = document.createElement('div');
        mockBlock.classList.add('block');
        mockBlock.appendChild(mockContent);

        const parent = document.createElement('div');
        parent.appendChild(mockBlock);

        const separatorElement = document.createElement('div');
        separatorElement.classList.add('block');

        jest.spyOn(DOMUtils, 'findClosestAncestorOfActiveElementByClass').mockReturnValue(mockBlock);
        jest.spyOn(DOMUtils, 'placeCursorAtEndOfEditableElement').mockImplementation(() => { });
        jest.spyOn(DOMUtils, 'removeFilterText').mockImplementation(() => null);
        jest.spyOn(document, 'dispatchEvent').mockImplementation(() => true);
        jest.spyOn(EventEmitter, 'emitDocChangedEvent').mockImplementation(() => { });

        mockFocusStack.peek.mockReturnValue(mockEditable);
        mockElementFactoryService.create.mockImplementation((type) => {
            if (type === 'block-separator') return separatorElement;
            return document.createElement('div');
        });

        service.transformBlock('separator', mockBlock);

        expect(parent.firstChild).toBe(separatorElement);
        expect(parent.children[1]).toBe(mockBlock);
        expect(DOMUtils.placeCursorAtEndOfEditableElement).toHaveBeenCalledWith(mockEditable);
        expect(EventEmitter.emitDocChangedEvent).toHaveBeenCalled();
    });
});

describe('BlockOperationsService.createNewElementAndSplitContent', () => {
    let service: BlockOperationsService;
    let mockMemento: jest.Mocked<any>;

    beforeEach(() => {
        (BlockOperationsService as any).instance = null;

        mockMemento = {
            saveState: jest.fn()
        };

        jest.spyOn(DOMUtils, 'placeCursorAtStartOfEditableElement').mockImplementation(() => { });

        jest.spyOn(DependencyContainer.Instance, 'resolve').mockImplementation((token: string) => {
            if (token === 'IElementFactoryService') return mockElementFactoryService;
            if (token === 'IFocusStack') return mockFocusStack;
            if (token === 'IMemento') return mockMemento;
            return null;
        });

        service = BlockOperationsService.getInstance();
        jest.spyOn(EventEmitter, 'emitDocChangedEvent').mockImplementation(() => { });

        jest.spyOn(DOMUtils, 'placeCursorAtStartOfEditableElement').mockImplementation(() => { });
        jest.spyOn(DOMUtils, 'placeCursorAtEndOfEditableElement').mockImplementation(() => { });
        jest.spyOn(DOMUtils, 'hasTextContent').mockImplementation((el) => (el.textContent || '').trim().length > 0);
        jest.spyOn(DOMUtils, 'trimEmptyTextAndBrElements').mockImplementation(() => { });
        jest.spyOn(DOMUtils, 'rearrangeContentAfterSplit').mockImplementation(() => { });
        jest.spyOn(document, 'querySelector').mockReturnValue(document.createElement('div'));

        mockElementFactoryService.create.mockImplementation((type) => {
            if (type === ElementFactoryService.ELEMENT_TYPES.LIST_ITEM) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (ElementFactoryService as any).listItem_2('');
            }
            if (type === ElementFactoryService.ELEMENT_TYPES.BLOCK_PARAGRAPH) {
                return ElementFactoryService.blockParagraph('');
            }
            return document.createElement('div');
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    describe('List behavior', () => {
        test('pressing enter at end of list item creates new empty item', () => {
            const parentBlock = document.createElement('div');
            parentBlock.className = 'block deletable';

            const listElement = document.createElement('ul');
            listElement.className = 'johannes-content-element swittable list';

            const li = document.createElement('li');
            li.className = 'deletable list-item hide-turninto';

            const content = document.createElement('div');
            content.className = 'focusable editable focus key-trigger';
            content.contentEditable = 'true';
            content.textContent = 'Item 1';

            li.appendChild(content);
            listElement.appendChild(li);
            parentBlock.appendChild(listElement);
            document.body.appendChild(parentBlock);

            jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue(ContentTypes.BulletedList);
            jest.spyOn(DOMUtils, 'findClosestAncestorOfActiveElementByClass').mockImplementation((selector) => {
                if (selector === 'list-item') return li;
                if (selector === 'block') return parentBlock;
                return null;
            });
            jest.spyOn(DOMUtils, 'getSelectionTextInfo').mockReturnValue({ atStart: false, atEnd: true });

            const result = service.createNewElementAndSplitContent();

            expect(result).toBe(true);
            const items = listElement.querySelectorAll('.list-item');
            expect(items.length).toBe(2);
            const newItem = items[1].querySelector('.focusable') as HTMLElement;
            expect(newItem.textContent).toBe('');
            expect(DOMUtils.placeCursorAtStartOfEditableElement).toHaveBeenCalledWith(newItem);
        });

        test('should remove entire list block if first item is empty and is the only item', () => {
            const parentBlock = document.createElement('div');
            parentBlock.className = 'block deletable';
        
            const listElement = document.createElement('ul');
            listElement.className = 'johannes-content-element swittable list';
        
            const li = document.createElement('li');
            li.className = 'deletable list-item hide-turninto';
        
            const content = document.createElement('div');
            content.className = 'focusable editable focus key-trigger';
            content.contentEditable = 'true';
            content.textContent = '';
        
            li.appendChild(content);
            listElement.appendChild(li);
            parentBlock.appendChild(listElement);
            document.body.appendChild(parentBlock);
        
            jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue(ContentTypes.BulletedList);
            jest.spyOn(DOMUtils, 'findClosestAncestorOfActiveElementByClass').mockImplementation((selector) => {
                if (selector === 'list-item') return li;
                if (selector === 'block') return parentBlock;
                return null;
            });
        
            const result = service.createNewElementAndSplitContent();

            expect(result).toBe(true);
            expect(document.body.contains(parentBlock)).toBe(false);
            const paragraph = document.body.querySelector('p');
            expect(paragraph).not.toBeNull();
        });

        test('should remove last empty list item and create paragraph block', () => {
            const parentBlock = document.createElement('div');
            parentBlock.className = 'block deletable';
        
            const listElement = document.createElement('ul');
            listElement.className = 'johannes-content-element swittable list';
        
            const items = [1, 2].map(i => {
                const li = document.createElement('li');
                li.className = 'deletable list-item hide-turninto';
        
                const content = document.createElement('div');
                content.className = 'focusable editable focus key-trigger';
                content.contentEditable = 'true';
                content.textContent = i === 2 ? '' : `Item ${i}`;
        
                li.appendChild(content);
                return li;
            });
        
            items.forEach(item => listElement.appendChild(item));
            parentBlock.appendChild(listElement);
            document.body.appendChild(parentBlock);
        
            jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue(ContentTypes.BulletedList);
            jest.spyOn(DOMUtils, 'findClosestAncestorOfActiveElementByClass').mockImplementation((selector) => {
                if (selector === 'list-item') return items[1];
                if (selector === 'block') return parentBlock;
                return null;
            });
        
            const result = service.createNewElementAndSplitContent();
        
            expect(result).toBe(true);
            const allBlocks = document.querySelectorAll('.block');
        
            expect(allBlocks.length).toBe(2);
            expect(allBlocks[0].querySelectorAll('.list-item').length).toBe(1);
            expect(allBlocks[1].querySelector('p')).not.toBeNull();
        });

        test('pressing enter in the middle of list item splits the item', () => {
            const parentBlock = document.createElement('div');
            parentBlock.className = 'block deletable';

            const listElement = document.createElement('ul');
            listElement.className = 'johannes-content-element swittable list';

            const li = document.createElement('li');
            li.className = 'deletable list-item hide-turninto';

            const content = document.createElement('div');
            content.className = 'focusable editable focus key-trigger';
            content.contentEditable = 'true';
            content.textContent = 'Hello world';

            li.appendChild(content);
            listElement.appendChild(li);
            parentBlock.appendChild(listElement);
            document.body.appendChild(parentBlock);

            jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue(ContentTypes.BulletedList);
            jest.spyOn(DOMUtils, 'findClosestAncestorOfActiveElementByClass').mockImplementation((selector) => {
                if (selector === 'list-item') return li;
                if (selector === 'block') return parentBlock;
                return null;
            });
            jest.spyOn(DOMUtils, 'getSelectionTextInfo').mockReturnValue({ atStart: false, atEnd: false });

            const cloneSpy = jest.spyOn(DOMUtils, 'cloneAndInsertAfter');
            const rearrangeSpy = jest.spyOn(DOMUtils, 'rearrangeContentAfterSplit');

            const result = service.createNewElementAndSplitContent();

            expect(result).toBe(true);
            expect(cloneSpy).toHaveBeenCalledWith(li);
            expect(rearrangeSpy).toHaveBeenCalled();
        });
    });

    describe('Table behavior', () => {
        test('pressing enter in table cell returns false', () => {
            const block = document.createElement('div');
            block.className = 'block deletable';

            const table = document.createElement('table');
            table.className = 'johannes-content-element swittable table';
            table.setAttribute('data-content-type', ContentTypes.Table);

            const tbody = document.createElement('tbody');
            table.appendChild(tbody);

            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.className = 'focusable editable';
            cell.contentEditable = 'true';
            row.appendChild(cell);
            tbody.appendChild(row);

            block.appendChild(table);
            document.body.appendChild(block);

            jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue(ContentTypes.Table);
            jest.spyOn(DOMUtils, 'findClosestAncestorOfActiveElementByClass').mockImplementation((selector) => {
                if (selector === 'block') return block;
                return null;
            });

            const result = service.createNewElementAndSplitContent();

            expect(result).toBe(false);
            expect(block.querySelectorAll('table').length).toBe(1);
        });

        test('list operations inside table are not blocked', () => {
            const block = document.createElement('div');
            block.className = 'block deletable';

            const table = document.createElement('table');
            table.className = 'johannes-content-element swittable table';
            table.setAttribute('data-content-type', ContentTypes.Table);

            const tbody = document.createElement('tbody');
            table.appendChild(tbody);

            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.className = 'focusable editable';
            cell.contentEditable = 'true';
            row.appendChild(cell);
            tbody.appendChild(row);

            const listElement = document.createElement('ul');
            listElement.className = 'list';

            const li = document.createElement('li');
            li.className = 'deletable list-item hide-turninto';
            const content = document.createElement('div');
            content.className = 'focusable editable focus key-trigger';
            content.contentEditable = 'true';
            content.textContent = 'Item 1';

            li.appendChild(content);
            listElement.appendChild(li);
            cell.appendChild(listElement);
            block.appendChild(table);
            document.body.appendChild(block);

            jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue(ContentTypes.Table);
            jest.spyOn(DOMUtils, 'findClosestAncestorOfActiveElementByClass').mockImplementation((selector) => {
                if (selector === 'list-item') return li;
                if (selector === 'block') return block;
                return null;
            });
            jest.spyOn(DOMUtils, 'getSelectionTextInfo').mockReturnValue({ atStart: false, atEnd: true });

            const result = service.createNewElementAndSplitContent();

            expect(result).toBe(true);
            const items = listElement.querySelectorAll('.list-item');
            expect(items.length).toBe(2);
        });
    });

    describe('Paragraph behavior', () => {
        test('pressing enter at end of paragraph creates new paragraph', () => {
            const block = ElementFactoryService.blockParagraph('Hello');
            document.body.appendChild(block);

            mockElementFactoryService.create.mockImplementation((type) => {
                if (type === ElementFactoryService.ELEMENT_TYPES.BLOCK_PARAGRAPH) {
                    return ElementFactoryService.blockParagraph('');
                }
                return document.createElement('div');
            });

            jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue(ContentTypes.Paragraph);
            jest.spyOn(DOMUtils, 'findClosestAncestorOfActiveElementByClass').mockImplementation((selector) => {
                if (selector === 'block') return block;
                return null;
            });
            jest.spyOn(DOMUtils, 'getSelectionTextInfo').mockReturnValue({ atStart: false, atEnd: true });

            const p = block.querySelector('p') as HTMLElement;
            p.focus();
            jest.spyOn(document, 'activeElement', 'get').mockReturnValue(p);

            const result = service.createNewElementAndSplitContent();

            expect(result).toBe(true);

            const blocks = document.querySelectorAll('.block');
            expect(blocks.length).toBe(2);
            expect((blocks[0].querySelector('p') as HTMLElement).textContent).toBe('Hello');
            expect((blocks[1].querySelector('p') as HTMLElement).textContent).toBe('');
        });

        test('pressing enter in the middle of paragraph moves text', () => {
            const block = ElementFactoryService.blockParagraph('Hello world');
            document.body.appendChild(block);

            mockElementFactoryService.create.mockImplementation((type) => {
                if (type === ElementFactoryService.ELEMENT_TYPES.BLOCK_PARAGRAPH) {
                    return ElementFactoryService.blockParagraph('');
                }
                return document.createElement('div');
            });

            const cloneSpy = jest.spyOn(DOMUtils, 'cloneAndInsertAfter');
            const rearrangeSpy = jest.spyOn(DOMUtils, 'rearrangeContentAfterSplit');

            jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue(ContentTypes.Paragraph);
            jest.spyOn(DOMUtils, 'findClosestAncestorOfActiveElementByClass').mockImplementation((selector) => {
                if (selector === 'block') return block;
                return null;
            });
            jest.spyOn(DOMUtils, 'getSelectionTextInfo').mockReturnValue({ atStart: false, atEnd: false });

            const p = block.querySelector('p') as HTMLElement;
            p.focus();
            DOMUtils.setCursorPosition(p, 6);
            jest.spyOn(document, 'activeElement', 'get').mockReturnValue(p);

            const result = service.createNewElementAndSplitContent();

            expect(result).toBe(true);
            expect(cloneSpy).toHaveBeenCalledWith(block);
            expect(rearrangeSpy).toHaveBeenCalled();
        });
    });

    describe('Caption behavior', () => {
        test('pressing enter at end of figcaption creates new paragraph', () => {
            const block = document.createElement('div');
            block.className = 'block deletable';

            const figure = document.createElement('figure');
            figure.className = 'figure-content';
            const img = document.createElement('img');
            figure.appendChild(img);
            const caption = document.createElement('figcaption');
            caption.className = 'editable';
            caption.contentEditable = 'true';
            caption.textContent = 'Caption text';
            figure.appendChild(caption);
            block.appendChild(figure);
            document.body.appendChild(block);

            jest.spyOn(DOMUtils, 'getSelectionTextInfo').mockReturnValue({ atStart: false, atEnd: true });
            mockElementFactoryService.create.mockImplementation((type) => {
                if (type === ElementFactoryService.ELEMENT_TYPES.BLOCK_PARAGRAPH) {
                    return ElementFactoryService.blockParagraph('');
                }
                return document.createElement('div');
            });

            caption.focus();
            jest.spyOn(document, 'activeElement', 'get').mockReturnValue(caption);

            const result = service.createNewElementAndSplitContent();

            expect(result).toBe(true);
            expect(mockElementFactoryService.create).toHaveBeenCalled();
            expect(caption.textContent).toBe('Caption text');
        });

        test('pressing enter in the middle of figcaption moves text', () => {
            const block = document.createElement('div');
            block.className = 'block deletable';

            const figure = document.createElement('figure');
            figure.className = 'figure-content';
            const img = document.createElement('img');
            figure.appendChild(img);
            const caption = document.createElement('figcaption');
            caption.className = 'editable';
            caption.contentEditable = 'true';
            caption.textContent = 'Hello world';
            figure.appendChild(caption);
            block.appendChild(figure);
            document.body.appendChild(block);

            jest.spyOn(DOMUtils, 'getSelectionTextInfo').mockReturnValue({ atStart: false, atEnd: false });
            mockElementFactoryService.create.mockImplementation((type) => {
                if (type === ElementFactoryService.ELEMENT_TYPES.BLOCK_PARAGRAPH) {
                    return ElementFactoryService.blockParagraph('');
                }
                return document.createElement('div');
            });

            caption.focus();
            jest.spyOn(document, 'activeElement', 'get').mockReturnValue(caption);
            DOMUtils.setCursorPosition(caption, 6);

            const result = service.createNewElementAndSplitContent();

            expect(result).toBe(true);
            expect(caption.textContent).toBe('Hello ');
        });
    });

    describe('deleteTheCurrentElementAndTheDraggableBlockIfEmpty', () => {
        test('should remove block when last content element is deleted', () => {
            const block = document.createElement('div');
            block.className = 'block deletable';

            const content = document.createElement('p');
            content.className = 'johannes-content-element editable';

            block.appendChild(content);
            document.body.appendChild(block);

            service.deleteTheCurrentElementAndTheDraggableBlockIfEmpty(content);

            expect(document.body.contains(block)).toBe(false);
        });
    });

});
