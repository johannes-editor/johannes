import { Editor } from './Editor';

describe('Editor.extractClipboardContent - inline code handling', () => {

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
    
    
    test('should handle nested lists inside a list item', () => {
        const html = `
            <ul>
                <li>Item 1</li>
                <li>Item 2
                    <ul>
                        <li>Subitem 2.1</li>
                        <li>Subitem 2.2</li>
                    </ul>
                </li>
                <li>Item 3</li>
            </ul>
        `;
    
        const result = Editor.extractClipboardContent(html);
    
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('ul');
        expect(result[0].items).toHaveLength(3);
    
        expect(result[0].items?.[1]).toEqual({
            type: 'li',
            text: 'Item 2',
            items: [
                { type: 'li', text: 'Subitem 2.1' },
                { type: 'li', text: 'Subitem 2.2' }
            ]
        });
    });

});


