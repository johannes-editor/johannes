import { AddBlockButton } from './AddBlockButton';
import { SVGIcon } from '../common/SVGIcon';
import { Icons } from '@/common/Icons';
import { Sizes } from '@/common/Sizes';
import { Commands } from '@/commands/Commands';
import { IBlockOperationsService } from '@/services/block-operations/IBlockOperationsService';

class MockBlockOperationsService implements IBlockOperationsService {
  execCommand = jest.fn();
  queryCommandState(): Promise<boolean> { return Promise.resolve(false); }
  transformBlock(): void {}
  createNewElementAndSplitContent(): boolean { return false; }
  justifyLeft(): void {}
  justifyCenter(): void {}
  justifyRight(): void {}
  changeCodeBlockLanguage(): void {}
  createANewParagraphFromTitle(): void {}
  execDeleteBlock(): boolean { return false; }
  execDuplicateBlock(): boolean { return false; }
  execDeleteFocusOnPrevious(): boolean { return false; }
  execDeleteAndFocusOnNext(): boolean { return false; }
  execFocusOnNext(): boolean { return false; }
  execMergeWithPreviousBlock(): void {}
  execMergeWithNextBlock(): void {}
  execChangeCalloutBackground(): void {}
  toggleCaption(): void {}
  createDefaultBlock(): HTMLElement { return document.createElement('div'); }
  insertBlock(): HTMLElement { return document.createElement('div'); }
  insertLiIntoListBlock(): HTMLElement { return document.createElement('li'); }
}

describe('AddBlockButton', () => {
  let service: MockBlockOperationsService;
  let button: AddBlockButton;

  beforeEach(() => {
    document.body.innerHTML = '';
    service = new MockBlockOperationsService();
    const icon = SVGIcon.create(Icons.Plus, Sizes.medium);
    button = new AddBlockButton(service, icon);
    document.body.appendChild(button.htmlElement);
  });

  test('executes createDefaultBlock on pointerdown', () => {
    const event = new Event('pointerdown', { bubbles: true });
    button.htmlElement.dispatchEvent(event);

    expect(service.execCommand).toHaveBeenCalledWith(Commands.createDefaultBlock, false);
  });

  test('keeps previous active element when triggering', () => {
    const paragraph = document.createElement('p');
    paragraph.classList.add('johannes-content-element');
    paragraph.setAttribute('contenteditable', 'true');
    document.body.appendChild(paragraph);
    paragraph.focus();

    let active: Element | null = null;
    service.execCommand = jest.fn(() => { active = document.activeElement; });

    button.htmlElement.dispatchEvent(new Event('pointerdown', { bubbles: true }));

    expect(active).toBe(paragraph);
  });
});
