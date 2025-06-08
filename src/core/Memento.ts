import { CommonClasses } from "@/common/CommonClasses";
import { IMemento } from "./IMemento";
import { DOMUtils } from "@/utilities/DOMUtils";
import { DefaultJSEvents } from "@/common/DefaultJSEvents";
import { KeyboardKeys } from "@/common/KeyboardKeys";
import { Utils } from "@/utilities/Utils";

export class Memento implements IMemento {

  private static query: string = "#johannesEditor .content-wrapper";
  private static instance: Memento;

  private undoStack: { html: string }[] = [];
  private redoStack: { html: string }[] = [];

  private get content(): HTMLElement {
    return document.querySelector(Memento.query)!;
  }

  private constructor() {
    if (Memento.instance) {
      throw new Error("Use Memento.getInstance() to get instance.");
    }
    this.attachEvents();
    this.saveState();
  }

  saveState() {
    if (this.content) {
      const state = this.captureState();
      this.undoStack.push(state);
      this.redoStack = [];
    }
  }

  private undo() {
    if (this.undoStack.length > 1) {
      const state = this.captureState();
      this.redoStack.push(state);

      const stateToRestore = this.undoStack.pop();
      if (stateToRestore) {
        this.content.innerHTML = stateToRestore.html;
        DOMUtils.restoreCaretFromMarker(this.content);
      }
    }
  }

  private redo() {
    if (this.redoStack.length > 0) {
      const state = this.captureState();
      this.undoStack.push(state);

      const stateToApply = this.redoStack.pop();
      if (stateToApply) {
        this.content.innerHTML = stateToApply.html;
        DOMUtils.restoreCaretFromMarker(this.content);
      }
    }
  }

  debounce(fn: () => void, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn();
      }, delay);
    };
  }

  debouncedSaveState = this.debounce(() => this.saveState(), 300);

  attachEvents() {
    document.addEventListener(DefaultJSEvents.Keydown, (event) => {

      if (!Utils.isEventFromContentWrapper(event)) {
        return;
      }

      if (event.ctrlKey && event.key === 'z') {
        this.undo();
        event.preventDefault();
      } else if (event.ctrlKey && event.key === 'y') {
        this.redo();
        event.preventDefault();
      }
    });

    document.addEventListener(DefaultJSEvents.Keyup, (event: KeyboardEvent) => {
      if (event.key == KeyboardKeys.Space || event.key == KeyboardKeys.Backspace || event.key == KeyboardKeys.Delete) {

        if (!Utils.isEventFromContentWrapper(event)) {
          return;
        }

        if (DOMUtils.isEventTargetDescendantOf(event, `.${CommonClasses.EditorOnly}`)) {
          return;
        }

        this.debouncedSaveState();
        DOMUtils.removeEmptyListItems();
      }
    });
  }

  static getInstance(): Memento {
    if (!Memento.instance) {
      Memento.instance = new Memento();
    }

    return Memento.instance;
  }

  private captureState(): { html: string } {
    DOMUtils.insertCaretMarker(this.content);

    const clone = this.content.cloneNode(true) as HTMLElement;

    clone.querySelectorAll(`.${CommonClasses.EditorOnly}`).forEach(el => el.remove());

    DOMUtils.removeCaretMarkers();

    return { html: clone.innerHTML };
  }
}
