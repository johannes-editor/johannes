import { BaseUIComponent } from "../common/BaseUIComponent";
import { DependencyContainer } from "@/core/DependencyContainer";
import { IFocusStack } from "@/core/IFocusStack";
import { ZIndex } from "@/common/ZIndex";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { KeyboardKeys } from "@/common/KeyboardKeys";
import { DOMUtils } from "@/utilities/DOMUtils";
import { CommonClasses } from "@/common/CommonClasses";
import { Utils } from "@/utilities/Utils";
import { EventEmitter } from "@/commands/EventEmitter";

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
        input.innerHTML = "";

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
        document.addEventListener(DefaultJSEvents.Mousedown, this.handleClick.bind(this));
        document.addEventListener(DefaultJSEvents.SelectionChange, this.handleSelectionChange.bind(this));

        this.input?.addEventListener(DefaultJSEvents.Input, () => this.updateFormula());
        this.done?.addEventListener(DefaultJSEvents.Click, (e) => {
            e.preventDefault();
            this.updateFormula();
            this.hide();
        });

        super.attachUIEvent();
    }

    private handleSelectionChange() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;

        let node: Node | null = sel.anchorNode;
        if (!node) return;

        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentElement;
        }

        const container = (node as HTMLElement).closest('.inline-math');
        if (container) {
            const render = (container as any).renderPreview || (() => {});
            if (this.currentTarget !== container || !this.isVisible) {
                this.focusStack.push(container as HTMLElement);
                this.setTarget(container as HTMLElement, render);
                this.show();
            }
        }
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

    hide() {
        this.updateFormula();
        if (this.currentTarget) {
            const formula = this.currentTarget.dataset.formula || "";
            if (!formula.trim()) {
                const container = this.currentTarget;
                const parent = container.parentElement;
                if (parent) {
                    if (container.previousSibling &&
                        container.previousSibling.nodeType === Node.TEXT_NODE &&
                        (container.previousSibling as Text).data === '\u200B') {
                        parent.removeChild(container.previousSibling);
                    }
                    if (container.nextSibling &&
                        container.nextSibling.nodeType === Node.TEXT_NODE &&
                        (container.nextSibling as Text).data === '\u200B') {
                        parent.removeChild(container.nextSibling);
                    }
                    const range = document.createRange();
                    range.setStartAfter(container);
                    range.collapse(true);
                    const selection = window.getSelection();
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                    parent.removeChild(container);
                    DOMUtils.trimEmptyTextAndBrElements(parent);
                    (parent as HTMLElement).normalize();
                    DOMUtils.mergeInlineElements(parent as HTMLElement);
                } else {
                    container.remove();
                }
                this.currentTarget = undefined;
                EventEmitter.emitDocChangedEvent();
            }
        }
        super.hide();
    }
}
