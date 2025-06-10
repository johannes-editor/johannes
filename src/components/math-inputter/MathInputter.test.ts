import { MathInputter } from './MathInputter';
import { registerEditorDependenciesForTests } from '../../../tests/helpers/registerEditorDependencies';
import { CommonClasses } from '@/common/CommonClasses';

describe('MathInputter inline interactions', () => {
    let inputter: MathInputter;
    let inlineMath: HTMLSpanElement;
    let outside: HTMLDivElement;

    beforeEach(() => {
        document.body.innerHTML = '';
        registerEditorDependenciesForTests();
        inputter = MathInputter.getInstance();
        document.body.appendChild(inputter.htmlElement);

        inlineMath = document.createElement('span');
        inlineMath.classList.add('inline-math', CommonClasses.ContentElement);
        inlineMath.dataset.formula = 'x';
        document.body.appendChild(inlineMath);

        outside = document.createElement('div');
        outside.textContent = 'outside';
        document.body.appendChild(outside);
    });

    afterEach(() => {
        jest.clearAllMocks();
        inputter.hide();
    });

    test('toggles visibility when clicking element with show class', () => {
        inlineMath.classList.add(CommonClasses.ShowMathInputOnClick);

        const click = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(click, 'target', { value: inlineMath });
        document.dispatchEvent(click);
        expect(inputter.isVisible).toBe(true);

        const clickAgain = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(clickAgain, 'target', { value: inlineMath });
        document.dispatchEvent(clickAgain);
        expect(inputter.isVisible).toBe(false);
    });

    test('remains visible when clicking inline math without show class', () => {
        // open manually as selection change would
        inputter.setTarget(inlineMath, () => {});
        inputter.show();

        const click = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(click, 'target', { value: inlineMath });
        document.dispatchEvent(click);

        expect(inputter.isVisible).toBe(true);
    });

    test('hides when clicking outside', () => {
        inputter.setTarget(inlineMath, () => {});
        inputter.show();

        const click = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(click, 'target', { value: outside });
        document.dispatchEvent(click);

        expect(inputter.isVisible).toBe(false);
    });
});
