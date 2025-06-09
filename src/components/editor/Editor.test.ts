import { DOMUtils } from '@/utilities/DOMUtils';
import { Editor } from './Editor';
import { EditorBuilder } from '@/builders/EditorBuilder';
import { DependencyContainer } from '@/core/DependencyContainer';
import { ElementFactoryService } from '@/services/element-factory/ElementFactoryService';
import { registerEditorDependenciesForTests } from '../../../tests/helpers/registerEditorDependencies';
import { IBlockOperationsService } from '@/services/block-operations/IBlockOperationsService';
import { Utils } from '@/utilities/Utils';

describe('Editor.extractClipboardContent', () => {

    test('should treat inline <code> as part of paragraph text', () => {
        const html = `
            <p>This is a test with <code>inlineCode()</code> inside.</p>
        `;

        const result = Editor.extractClipboardContent(html);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('p');
        expect(result[0].text).toBe('This is a test with inlineCode() inside.');
    });

    test('should extract multiple paragraphs correctly', () => {
        const html = `
            <p>First paragraph.</p>
            <p>Second paragraph.</p>
        `;
    
        const result = Editor.extractClipboardContent(html);
    
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ type: 'p', text: 'First paragraph.' });
        expect(result[1]).toEqual({ type: 'p', text: 'Second paragraph.' });
    });    
    
    test('should handle ordered lists', () => {
        const html = `
            <ol>
                <li>First</li>
                <li>Second</li>
            </ol>
        `;
    
        const result = Editor.extractClipboardContent(html);
    
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('ol');
        expect(result[0].items).toEqual([
            { type: 'li', text: 'First' },
            { type: 'li', text: 'Second' },
        ]);
    });
    
    test('should treat <pre> as code block', () => {
        const html = `
            <pre><code>const a = 10;\nconsole.log(a);</code></pre>
        `;
    
        const result = Editor.extractClipboardContent(html);
    
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            type: 'pre',
            text: 'const a = 10;\nconsole.log(a);'
        });
    });
    
    test('should ignore style and script tags', () => {
        const html = `
            <style>.hidden { display: none; }</style>
            <script>alert('oops');</script>
            <p>Visible text</p>
        `;
    
        const result = Editor.extractClipboardContent(html);
    
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ type: 'p', text: 'Visible text' });
    });
    
    test('should wrap raw text in a paragraph', () => {
        const html = `Just a raw text without tags.`;
    
        const result = Editor.extractClipboardContent(html);
    
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ type: 'p', text: 'Just a raw text without tags.' });
    });
    
    test('should handle all heading tags from <h1> to <h6>', () => {
        const html = `
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <h5>Heading 5</h5>
            <h6>Heading 6</h6>
        `;
    
        const result = Editor.extractClipboardContent(html);
    
        expect(result).toHaveLength(6);
        expect(result[0]).toEqual({ type: 'h1', text: 'Heading 1' });
        expect(result[1]).toEqual({ type: 'h2', text: 'Heading 2' });
        expect(result[2]).toEqual({ type: 'h3', text: 'Heading 3' });
        expect(result[3]).toEqual({ type: 'h4', text: 'Heading 4' });
        expect(result[4]).toEqual({ type: 'h5', text: 'Heading 5' });
        expect(result[5]).toEqual({ type: 'h6', text: 'Heading 6' });
    });

    //TODO: Add List test case

});


describe('Editor.handlePasteEvent', () => {
    let blockOperationsService: jest.Mocked<IBlockOperationsService>;
    let insertTextAtCursor: jest.SpyInstance;
    let clipboardEvent: ClipboardEvent;

    beforeEach(() => {
        blockOperationsService = {
            insertBlock: jest.fn(),
            insertLiIntoListBlock: jest.fn(),
            createDefaultBlock: jest.fn(),
        } as any;

        insertTextAtCursor = jest.spyOn(Editor, 'insertTextAtCursor').mockImplementation(() => {});
        jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue('p');
        jest.spyOn(Utils, 'isEventFromContentWrapper').mockReturnValue(true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    function createPasteEvent(html = '', text = '', customTarget?: HTMLElement): Event {
        const clipboardData = {
            getData: (type: string) => {
                if (type === 'text/html') return html;
                if (type === 'text/plain') return text;
                return '';
            }
        };
    
        const event = new Event('paste', { bubbles: true, cancelable: true });
        
        Object.defineProperty(event, 'clipboardData', {
            value: clipboardData,
        });
    
        const target = customTarget || document.createElement('div');
        target.setAttribute('contenteditable', 'true');
    
        Object.defineProperty(event, 'target', {
            value: target,
        });
    
        return event;
    }

    test('should insert text from single paragraph HTML paste', () => {
        const html = '<p>Hello world</p>';
        clipboardEvent = createPasteEvent(html) as unknown as ClipboardEvent;

        Editor.handlePasteEvent(clipboardEvent, blockOperationsService);

        expect(insertTextAtCursor).toHaveBeenCalledWith('Hello world');
        expect(blockOperationsService.insertBlock).not.toHaveBeenCalled();
    });

    test('should insert text and create block for additional paragraphs', () => {
        const html = '<p>First</p><p>Second</p>';
        clipboardEvent = createPasteEvent(html) as unknown as ClipboardEvent;

        Editor.handlePasteEvent(clipboardEvent, blockOperationsService);

        expect(insertTextAtCursor).toHaveBeenCalledWith('First');
        expect(blockOperationsService.insertBlock).toHaveBeenCalledWith('block-p', 'Second', null);
    });

    test('uses next empty paragraph when pasting into title', () => {
        const html = '<p>First</p><p>Second</p><p>Third</p>';

        const h1 = document.createElement('h1');
        h1.setAttribute('contenteditable', 'true');
        const title = document.createElement('div');
        title.classList.add('title');
        title.appendChild(h1);
        document.body.appendChild(title);

        const p = document.createElement('p');
        p.setAttribute('contenteditable', 'true');
        p.classList.add('johannes-content-element');
        p.innerHTML = '<br>';
        const block = document.createElement('div');
        block.classList.add('block');
        block.appendChild(p);
        document.body.appendChild(block);

        clipboardEvent = createPasteEvent(html, '', h1) as unknown as ClipboardEvent;

        Editor.handlePasteEvent(clipboardEvent, blockOperationsService);

        expect(insertTextAtCursor).toHaveBeenCalledWith('First');
        expect(p.textContent).toBe('Second');
        expect(blockOperationsService.insertBlock).toHaveBeenCalledWith('block-p', 'Third', null);
    });

    //TODO: Add List test case

    test('should fallback to plain text when no HTML provided', () => {
        clipboardEvent = createPasteEvent('', 'Line 1\n\rLine 2') as unknown as ClipboardEvent;

        Editor.handlePasteEvent(clipboardEvent, blockOperationsService);

        expect(insertTextAtCursor).toHaveBeenCalledWith('Line 1');
        expect(blockOperationsService.createDefaultBlock).toHaveBeenCalledWith(null, 'Line 2');
    });

    test('should not do anything if contenteditable is false', () => {
        clipboardEvent = createPasteEvent('<p>Ignore me</p>') as unknown as ClipboardEvent;
        (clipboardEvent.target as HTMLElement).removeAttribute('contenteditable');

        Editor.handlePasteEvent(clipboardEvent, blockOperationsService);

        expect(insertTextAtCursor).not.toHaveBeenCalled();
    });

    test('should insert plain text when active block is not a paragraph', () => {
        jest.spyOn(DOMUtils, 'getContentTypeFromActiveElement').mockReturnValue('h1');
        clipboardEvent = createPasteEvent('<p>Should not parse as block</p>', 'Fallback text') as unknown as ClipboardEvent;

        Editor.handlePasteEvent(clipboardEvent, blockOperationsService);

        expect(insertTextAtCursor).toHaveBeenCalledWith('Fallback text');
    });

    test('should insert plain text when pasting into figcaption', () => {
        const clipboardData = {
            getData: (type: string) => {
                if (type === 'text/html') return '<strong>bold</strong>';
                if (type === 'text/plain') return 'bold';
                return '';
            }
        };

        clipboardEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
        Object.defineProperty(clipboardEvent, 'clipboardData', { value: clipboardData });

        const target = document.createElement('figcaption');
        target.setAttribute('contenteditable', 'true');
        Object.defineProperty(clipboardEvent, 'target', { value: target });

        Editor.handlePasteEvent(clipboardEvent, blockOperationsService);

        expect(insertTextAtCursor).toHaveBeenCalledWith('bold');
    });
});

describe('Editor structure monitoring', () => {
    let editor: Editor;
    beforeEach(() => {
        document.body.innerHTML = '<div id="johannesEditor"></div>';
        registerEditorDependenciesForTests();
        DependencyContainer.Instance.register('IElementFactoryService', () => ElementFactoryService.getInstance());
        editor = EditorBuilder.build();
    });

    test('recreates title and first paragraph when removed', (done) => {
        const wrapper = document.querySelector('#johannesEditor .content-wrapper') as HTMLElement;
        const title = wrapper.querySelector('.title') as HTMLElement;
        const first = wrapper.querySelector('.content .block') as HTMLElement;

        title.remove();
        first.remove();

        setTimeout(() => {
            expect(wrapper.querySelector('.title')).not.toBeNull();
            expect(wrapper.querySelector('.content .block')).not.toBeNull();
            done();
        }, 0);
    });
});