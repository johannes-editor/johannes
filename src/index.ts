import './assets/css/main.css';
import 'highlight.js/styles/an-old-hope.css';
import 'katex/dist/katex.min.css';
import { UIBuilder } from './builders/UIBuilder';
import { CommandDispatcher } from './commands/CommandDispatcher';
import { ShortcutListeners } from './core/ShortcutListeners';
import { TableListeners } from './core/listeners/TableListeners';
import { QuickMenu } from './components/quick-menu/QuickMenu';
import { DependencyContainer } from './core/DependencyContainer';
import { FocusStack } from './core/FocusStack';
import { BlockOperationsService } from './services/block-operations/BlockOperationsService';
import { ElementFactoryService } from './services/element-factory/ElementFactoryService';
import { TextOperationsService } from './services/text-operations/TextOperationsService';
import { TableOperationsService } from './services/table-operations/TableOperationsService';
import { Toolbar as TableContextFloatingToolbar } from './components/floating-toolbar/table-context/Toolbar';
import { Memento } from './core/Memento';
import { EditableNavigation } from './core/EditableNavigation';
import { BlockToolbox } from './components/block-toolbox/BlockToolbox';
import { ImageAlt } from './core/listeners/ImageAlt';

/**
 * Initializes the editor and sets up event listeners once the DOM content has fully loaded.
 * It is responsible for building the user interface and starting the event listening process to handle commands.
 *
 * The `DOMContentLoaded` event ensures that all the DOM content has been fully parsed and loaded before the initialization begins.
 * `UIBuilder.build().start();` is used to construct and activate the user interface.
 * `CommandDispatcher.getInstance().listen();` retrieves an instance of the CommandDispatcher and starts listening for events.
 */
document.addEventListener('DOMContentLoaded', function () {

    DependencyContainer.Instance.register("IMemento", () => Memento.getInstance());
    DependencyContainer.Instance.register("IShortcutListeners", () => ShortcutListeners.getInstance());
    DependencyContainer.Instance.register("ITableListeners", () => TableListeners.getInstance());

    DependencyContainer.Instance.register("IFocusStack", () => FocusStack.getInstance());
    DependencyContainer.Instance.register("IElementFactoryService", () => ElementFactoryService.getInstance());
    DependencyContainer.Instance.register("ITextOperationsService", () => TextOperationsService.getInstance());
    DependencyContainer.Instance.register("ITableOperationsService", () => TableOperationsService.getInstance());
    DependencyContainer.Instance.register("IBlockOperationsService", () => BlockOperationsService.getInstance());

    //UserInterface
    DependencyContainer.Instance.register("IQuickMenu", () => QuickMenu.getInstance());
    DependencyContainer.Instance.register("ITableContextFloatingToolbar", () => TableContextFloatingToolbar.getInstance());
    DependencyContainer.Instance.register("IEditableNavigation", () => EditableNavigation.getInstance());

    UIBuilder.build().start();

    CommandDispatcher.getInstance().listen();
    EditableNavigation.getInstance().listen();
    BlockToolbox.getInstance().listen();
    ImageAlt.getInstance().listen();

    document.dispatchEvent(new Event("TextEditorLoaded"));
});


document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById('textFloatingToolbar') as HTMLElement;
    if (!el) return;

    const dropdownClasses = ['.dependent-box', '.dropdown-menu2', '.dropdown-menu3'];
    let initialPosX: number = 0;
    let initialPosY: number = 0;
    let posX: number = 0;
    let posY: number = 0;
    let isDragging: boolean = false;

    el.addEventListener('touchstart', (e: TouchEvent) => {
        const target = e.target as HTMLElement;

        //Touch inside a dropdown: Ignore drag
        if (dropdownClasses.some(className => target.closest(className))) {
            return;
        }

        initialPosX = e.touches[0].clientX - el.offsetLeft;
        initialPosY = e.touches[0].clientY - el.offsetTop;
    }, false);

    el.addEventListener('touchmove', (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        // Movement inside a dropdown: Allow scroll
        if (dropdownClasses.some(className => target.closest(className))) {
            return;
        }

        const diffX = Math.abs(e.touches[0].clientX - initialPosX);
        const diffY = Math.abs(e.touches[0].clientY - initialPosY);
        if (diffX > 10 || diffY > 10) {
            isDragging = true;
            e.preventDefault();
            posX = e.touches[0].clientX - initialPosX;
            posY = e.touches[0].clientY - initialPosY;
            el.style.left = `${posX}px`;
            el.style.top = `${posY}px`;
        }
    }, false);

    el.addEventListener('touchend', (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        //End of touch inside a dropdown
        if (dropdownClasses.some(className => target.closest(className))) {
            return;
        }

        if (isDragging) {
            e.preventDefault();
            isDragging = false;
        }
    }, false);
});