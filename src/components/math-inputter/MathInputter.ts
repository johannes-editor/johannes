import { BaseUIComponent } from "../common/BaseUIComponent";
import { DependencyContainer } from "@/core/DependencyContainer";
import { IFocusStack } from "@/core/IFocusStack";
import { ZIndex } from "@/common/ZIndex";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { KeyboardKeys } from "@/common/KeyboardKeys";
import { DOMUtils } from "@/utilities/DOMUtils";
import { CommonClasses } from "@/common/CommonClasses";
import { Utils } from "@/utilities/Utils";

export class MathInputter extends BaseUIComponent {

    id: string;
    focusStack: IFocusStack;
    input!: HTMLDivElement;
    done!: HTMLButtonElement;

    private ensureInputElements() {
        if (!this.input) {
            this.input = this.htmlElement.querySelector('.math-input') as HTMLDivElement;
        }
        if (!this.done) {
            this.done = this.htmlElement.querySelector('button') as HTMLButtonElement;
        }
    }

    private static instance: MathInputter;

    private constructor() {
        const id = "mathInputter";

        super({ id });

        this.id = id;
        this.focusStack = DependencyContainer.Instance.resolve<IFocusStack>("IFocusStack");

        this.attachEvents();
    }

    static getInstance(): MathInputter {
        if (!MathInputter.instance) {
            MathInputter.instance = new MathInputter();
        }
        return MathInputter.instance;
    }

    init(): HTMLElement {
        const htmlElement = document.createElement("div");
        htmlElement.id = this.props.id;
        htmlElement.classList.add("dependent-box", "soft-box-shadow", CommonClasses.IgnoreTextFloatingToolbar);
        htmlElement.style.position = "absolute";
        htmlElement.style.display = "none";
        htmlElement.style.zIndex = ZIndex.ExtremelyImportant;

        const input = document.createElement("div");
        input.classList.add("math-input", "focusable", "editable");
        input.contentEditable = "true";
        input.setAttribute("data-placeholder", "\\text{Formula}");
        input.innerHTML = "<br>";
        DOMUtils.updatePlaceholderVisibility(input);

        const button = document.createElement("button");
        button.classList.add("blue-button");
        button.textContent = "Done";

        this.input = input;
        this.done = button;

        const shell = document.createElement("div");
        shell.classList.add("math-input-shell");
        shell.appendChild(input);
        shell.appendChild(button);

        htmlElement.appendChild(shell);
        return htmlElement;
    }

    private currentTarget?: HTMLElement;
    private renderCallback?: () => void;

    setTarget(target: HTMLElement, renderCallback: () => void) {
        this.currentTarget = target;
        this.renderCallback = renderCallback;
        this.ensureInputElements();
        this.input.textContent = target.dataset.formula || "";
    }

    attachEvents(): void {
        this.ensureInputElements();
        document.addEventListener(DefaultJSEvents.Keydown, this.handleKeydown.bind(this), true);
        document.addEventListener(DefaultJSEvents.Click, this.handleClick.bind(this));
        document.addEventListener(DefaultJSEvents.SelectionChange, this.handleSelectionChange.bind(this));

        this.input?.addEventListener("input", () => this.updateFormula());
        this.input?.addEventListener(DefaultJSEvents.Keydown, this.handleInputNavigation.bind(this));
        this.done?.addEventListener(DefaultJSEvents.Click, (e) => {
            e.preventDefault();
            this.updateFormula();
            this.hide();
        });

        super.attachUIEvent();
    }

    private handleKeydown(event: KeyboardEvent) {
        if (event.key === KeyboardKeys.Escape) {
            if (!Utils.isEventFromContentWrapper(event)) return;
            if (this.canHide) {
                event.stopImmediatePropagation();
                this.hide();
            }
        }
    }

    private handleClick(event: MouseEvent) {
        this.hideOnExternalClick(event);
        this.showOnTargetClick(event);
    }

    private handleInputNavigation(event: KeyboardEvent) {
        if (!this.currentTarget) return;

        if (event.key === KeyboardKeys.Enter) {
            event.preventDefault();
            this.updateFormula();
            this.hide();
            DOMUtils.placeCaretAfterNode(this.currentTarget);
            (this.currentTarget.closest('[contenteditable="true"]') as HTMLElement | null)?.focus();
        } else if (event.key === KeyboardKeys.ArrowRight && DOMUtils.isCursorAtEnd(this.input)) {
            event.preventDefault();
            this.updateFormula();
            this.hide();
            DOMUtils.placeCaretAfterNode(this.currentTarget);
            (this.currentTarget.closest('[contenteditable="true"]') as HTMLElement | null)?.focus();
        } else if (event.key === KeyboardKeys.ArrowLeft && DOMUtils.isCursorAtStart(this.input)) {
            event.preventDefault();
            this.updateFormula();
            this.hide();
            DOMUtils.placeCaretBeforeNode(this.currentTarget);
            (this.currentTarget.closest('[contenteditable="true"]') as HTMLElement | null)?.focus();
        }
    }

    private hideOnExternalClick(event: MouseEvent) {
        const mathInputter = DOMUtils.findClickedElementOrAncestorById(event, this.id);
        const clickedOnElement = DOMUtils.findClickedElementOrAncestorByClass(event, CommonClasses.ShowMathInputOnClick);
        if (!mathInputter && !clickedOnElement && this.isVisible) {
            this.hide();
        }
    }

    private showOnTargetClick(event: MouseEvent) {
        const clickedOnElement = DOMUtils.findClickedElementOrAncestorByClass(event, CommonClasses.ShowMathInputOnClick);
        if (clickedOnElement) {
            event.preventDefault();
            event.stopImmediatePropagation();
            const container = clickedOnElement.closest(`.${CommonClasses.ContentElement}`) as HTMLElement;
            if (container) {
                this.focusStack.push(container);
                const render = (container as any).renderPreview || (() => {});
                this.setTarget(container, render);
                if (this.isVisible && this.currentTarget === container) {
                    this.hide();
                } else {
                    this.show();
                }
            }
        }
    }

    private handleSelectionChange() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return;

        if (this.htmlElement.contains(selection.anchorNode)) return;

        const container = DOMUtils.findClosestAncestorOfSelectionByClass('inline-math');
        if (container) {
            this.focusStack.push(container);
            const render = (container as any).renderPreview || (() => {});
            this.setTarget(container, render);
            if (!this.isVisible || this.currentTarget !== container) {
                this.show();
            }
        } else if (this.isVisible) {
            this.hide();
        }
    }

    private updateFormula() {
        if (!this.currentTarget) return;
        this.currentTarget.dataset.formula = this.input.textContent || "";
        this.renderCallback?.();
    }

    show(): void {
        this.ensureInputElements();
        super.show();
        const lastFocused = this.focusStack.peek();
        if (lastFocused) {
            const rect = lastFocused.getBoundingClientRect();
            const targetMidpoint = rect.left + window.scrollX + rect.width / 2;
            const left = targetMidpoint - this.htmlElement.offsetWidth / 2;
            const top = rect.bottom + window.scrollY + 10;
            this.htmlElement.style.left = `${left}px`;
            this.htmlElement.style.top = `${top}px`;
        }
        setTimeout(() => this.input.focus(), 0);
    }
}
