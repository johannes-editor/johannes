import { IUIEventDetail } from "@/commands/IUIEventDetail";
import { CustomUIEvents } from "@/common/CustomUIEvents";

export abstract class BaseUIComponent<T extends HTMLElement = HTMLElement> {

    id?: string;
    private _canHide: boolean;

    classList: string[] = [];
    props: Record<string, any>;
    htmlElement: T;
    parent?: BaseUIComponent;

    constructor(props: Record<string, any>) {

        this.props = props;

        this.htmlElement = this.init() as T;
        this._canHide = true;
    }

    /**
    * Initializes and returns an HTMLElement using the document.createElement API.
    * This abstract method must be implemented by subclasses to specify the type of
    * HTMLElement to be created and possibly configure its properties or styles.
    * Dependencies needed by the subclasses are passed through the constructor and
    * are typically made available via this.props for use within this method.
    *
    * @abstract
    * @example
    * // Example subclass that uses a dependency passed through the constructor.
    * class Toolbar extends BaseUIComponent {
    *     constructor(dependency) {
    *         super({dependency: dependency});
    *         this.dependency = dependency;
    *     }
    *
    *     init(): HTMLElement {
    *         const toolbarElement = document.createElement('div');
    *         toolbarElement.className = 'toolbar';
    *         // Using the dependency
    *         toolbarElement.attribute("customDependencyBased", this.dependency.data);
    *   
    *         return toolbarElement;
    *     }
    * }
    *
    * @returns {HTMLElement} The newly created and configured HTMLElement.
    */
    abstract init(): HTMLElement;

    get display(): string {
        return 'block';
    }

    setId(id: string) {
        this.id = id;
        this.htmlElement.id = id;
    }

    addCssClass(...tokens: string[]) {
        this.classList.push(...tokens);
        this.htmlElement.classList.add(...tokens);
    }

    /**
    * Appends this component's HTML element to the specified parent component's HTML element.
    * This method establishes a parent-child relationship in the DOM by appending this instance's
    * element as a child of the given parent's element. It also updates the parent property of this
    * instance to refer to the provided parent component.
    *
    * @param {BaseUIComponent} parent The parent component to which this component's element will be appended.
    * This should be an instance of BaseUIComponent or any of its subclasses, ensuring that it has an htmlElement property.
    */
    appendTo(parent: BaseUIComponent): void {
        this.parent = parent;
        parent.htmlElement.appendChild(this.htmlElement);
    }

    get isVisible(): boolean {
        let element: HTMLElement = this.htmlElement;

        if (element.style.display === 'none' || element.style.visibility === 'hidden' || !document.contains(element)) {
            return false;
        }

        while (element) {
            const style = window.getComputedStyle(element);

            if (style.display === 'none' || style.visibility === 'hidden') {
                return false;
            }

            if (element.parentElement) {
                element = element.parentElement;
            } else {
                break;
            }
        }

        return true;
    }

    show() {
        // this._canHide = false;
        this.htmlElement.style.display = this.display;

        // setTimeout(() => {
        //     this._canHide = true;
        // }, 100);

        
    }

    hide() {
        // if (!this._canHide) {

        //     console.warn("Attempted to hide the element before 100 milliseconds have passed since the last display.");
        //     // return;
        //     // throw new Error("Attempted to hide the element before 100 milliseconds have passed since the last display.");
        // }

        this.htmlElement.style.display = 'none';
    }

    lockHide() {
        this._canHide = false;
    }

    unlockHide() {
        this._canHide = true;
    }

    get canHide(): boolean {
        return this._canHide && this.isVisible;
    }

    set canHide(value: boolean) {
        this._canHide = value;
    }

    focus() {
        this.htmlElement.focus();
    }

    changeColor(value: string): void {
        this.htmlElement.style.color = value;
    }

    changeColorImportant(value: string): void {
        this.htmlElement.style.setProperty('color', value, 'important');
    }

    removeColor() {
        this.htmlElement.style.color = "inherit";
    }

    changeVisibilityToVisible(): void {
        this.htmlElement.style.visibility = "visible";
    }

    changeVisibilityToHidden(): void {
        this.htmlElement.style.visibility = "hidden";
    }

    toggleVisibility(): void {
        if (this.htmlElement.style.visibility === "hidden") {
            this.htmlElement.style.visibility = "visible";
        } else {
            this.htmlElement.style.visibility = "hidden";
        }
    }

    get doesElementOverflowScreen(): boolean {

        const originalDisplay = this.htmlElement.style.display;
        const originalVisibility = this.htmlElement.style.visibility;
        const originalPosition = this.htmlElement.style.position;

        if (originalDisplay === 'none') {
            this.htmlElement.style.display = 'block';
            this.htmlElement.style.visibility = 'hidden';
            this.htmlElement.style.position = 'absolute';
        }

        const elementRect = this.htmlElement.getBoundingClientRect();
        const screenWidth = window.innerWidth;

        if (originalDisplay === 'none') {
            this.htmlElement.style.display = originalDisplay;
            this.htmlElement.style.visibility = originalVisibility;
            this.htmlElement.style.position = originalPosition;
        }

        const elementRightEdge = elementRect.right;

        if (elementRightEdge > screenWidth) {
            return true;
        }

        if (elementRect.left < 0) {
            return true;
        }

        return false;
    }

    ensureVisible(): void {
        const relevantContainer = this.htmlElement.closest('select, ul');

        if (relevantContainer) {
            this.htmlElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
    }

    handleCloseElementEvent(event: Event) {

        const customEvent = event as CustomEvent<IUIEventDetail>;
        const details = customEvent.detail;

        if (this.id && this.id == details.targetId!) {
            event.stopImmediatePropagation();
            this.hide();
        }
    }

    handleShowElementEvent(event: Event) {

        const customEvent = event as CustomEvent<IUIEventDetail>;
        const details = customEvent.detail;

        if (details.targetId == this.id) {
            event.stopImmediatePropagation();
            this.show();
        }
    }

    //Basic UI events
    attachUIEvent() {
        document.addEventListener(CustomUIEvents.CloseElement, this.handleCloseElementEvent.bind(this));
        document.addEventListener(CustomUIEvents.ShowElement, this.handleShowElementEvent.bind(this));
    }
}