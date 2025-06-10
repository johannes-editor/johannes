import { BlockToolbox } from './BlockToolbox';
import { ToolboxOptions } from './ToolboxOptions';
import { ContentTypes } from '@/common/ContentTypes';

describe('BlockToolbox caption option visibility', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    function setupBlock(type: ContentTypes, withImage: boolean, withPlaceholder = false): HTMLElement {
        const block = document.createElement('div');
        block.className = 'block deletable';

        const content = document.createElement('div');
        content.classList.add('johannes-content-element', ToolboxOptions.IncludeBlockToolbarClass, ToolboxOptions.ExtraOptionsClass);
        content.setAttribute('data-content-type', type);

        if (withPlaceholder) {
            const placeholder = document.createElement('div');
            placeholder.className = 'content-placeholder';
            content.appendChild(placeholder);
        }

        if (withImage) {
            const figure = document.createElement('figure');
            const figContent = document.createElement('div');
            figContent.className = 'figure-content';
            const img = document.createElement('img');
            figContent.appendChild(img);
            figure.appendChild(figContent);
            content.appendChild(figure);
        } else if (!withPlaceholder) {
            const figure = document.createElement('figure');
            figure.className = 'embed-container';
            const iframe = document.createElement('iframe');
            figure.appendChild(iframe);
            content.appendChild(figure);
        }

        block.appendChild(content);
        document.body.appendChild(block);
        return block;
    }

    test('hides caption option for non-image blocks', () => {
        const block = setupBlock(ContentTypes.Iframe, false);
        const content = block.querySelector('.johannes-content-element') as HTMLElement;
        const event = { target: content } as unknown as MouseEvent;
        BlockToolbox.getInstance().insertToolboxIntoBlockOnce(event);

        const captionItem = block.querySelector('.caption-option-item') as HTMLElement;
        expect(captionItem.style.display).toBe('none');
    });

    test('hides caption option for image placeholders', () => {
        const block = setupBlock(ContentTypes.Image, false, true);
        const content = block.querySelector('.johannes-content-element') as HTMLElement;
        const event = { target: content } as unknown as MouseEvent;
        BlockToolbox.getInstance().insertToolboxIntoBlockOnce(event);

        const captionItem = block.querySelector('.caption-option-item') as HTMLElement;
        expect(captionItem.style.display).toBe('none');
    });

    test('shows caption option for image blocks with img', () => {
        const block = setupBlock(ContentTypes.Image, true);
        const content = block.querySelector('.johannes-content-element') as HTMLElement;
        const event = { target: content } as unknown as MouseEvent;
        BlockToolbox.getInstance().insertToolboxIntoBlockOnce(event);

        const captionItem = block.querySelector('.caption-option-item') as HTMLElement;
        expect(captionItem.style.display).toBe('flex');
    });
});
