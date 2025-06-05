import { BlockOperationsService } from './BlockOperationsService';
import { EventEmitter } from '../../commands/EventEmitter';
import { DOMUtils } from '../../utilities/DOMUtils';
import { DependencyContainer } from '../../core/DependencyContainer';
import { ContentTypes } from '@/common/ContentTypes';

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
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('List behavior', () => {
        test('should split list when pressing enter on empty middle item', () => {
            const parentBlock = document.createElement('div');
            parentBlock.className = 'block deletable';

            const listElement = document.createElement('ul');
            listElement.className = 'johannes-content-element swittable list';

            const items = [1, 2, 3].map(i => {
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

            const emptyItemContent = items[1].querySelector('.focusable') as HTMLElement;
            jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue(ContentTypes.BulletedList);
            jest.spyOn(DOMUtils, 'findClosestAncestorOfActiveElementByClass').mockImplementation((selector) => {
                if (selector === 'list-item') return items[1];
                if (selector === 'block') return parentBlock;
                return null;
            });

            const result = service.createNewElementAndSplitContent();

            expect(result).toBe(true);
            expect(mockMemento.saveState).toHaveBeenCalled();

            const allBlocks = document.querySelectorAll('.block');
            expect(allBlocks.length).toBe(2);

            const firstList = allBlocks[0].querySelector('ul');
            expect(firstList?.querySelectorAll('.list-item').length).toBe(1);

            const secondList = allBlocks[1].querySelector('ul');
            expect(secondList?.querySelectorAll('.list-item').length).toBe(1);

            expect(items[1].parentNode).toBeNull();

            const newFocusElement = secondList?.querySelector('.focusable') as HTMLElement;
            expect(DOMUtils.placeCursorAtStartOfEditableElement).toHaveBeenCalledWith(newFocusElement);
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

        test('should split list with multiple items after split point', () => {
            const parentBlock = document.createElement('div');
            parentBlock.className = 'block deletable';
        
            const listElement = document.createElement('ul');
            listElement.className = 'johannes-content-element swittable list';
        
            const items = [1, 2, 3, 4].map(i => {
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
        
            const firstListItems = allBlocks[0].querySelectorAll('.list-item');
            const secondListItems = allBlocks[1].querySelectorAll('.list-item');
        
            expect(firstListItems.length).toBe(1);
            expect(secondListItems.length).toBe(2);
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

        test('should remove empty list items inside block', () => {
            const block = document.createElement('div');
            block.className = 'block deletable';

            const listElement = document.createElement('ul');
            listElement.className = 'johannes-content-element list';

            const createItem = (text: string) => {
                const li = document.createElement('li');
                li.className = 'deletable list-item';
                const input = document.createElement('input');
                const div = document.createElement('div');
                div.className = 'focusable editable';
                div.textContent = text;
                li.appendChild(input);
                li.appendChild(div);
                return li;
            };

            const li1 = createItem('one');
            const li2 = createItem('two');
            const li3 = createItem('three');

            listElement.appendChild(li1);
            listElement.appendChild(li2);
            listElement.appendChild(li3);
            block.appendChild(listElement);
            document.body.appendChild(block);

            li2.innerHTML = '<br>'; // simulate leftover empty item

            service.deleteTheCurrentElementAndTheDraggableBlockIfEmpty(listElement);

            expect(listElement.querySelectorAll('li').length).toBe(2);
            expect(listElement.contains(li2)).toBe(false);
        });
    });

    describe('removeEmptyBlocks', () => {
        test('should remove blocks without content elements', () => {
            const block = document.createElement('div');
            block.className = 'block deletable';
            document.body.appendChild(block);

            service.removeEmptyBlocks();

            expect(document.body.contains(block)).toBe(false);
        });
    });

});
