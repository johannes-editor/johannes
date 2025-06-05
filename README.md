# Johannes Editor

Johannes is a lightweight block based text editor written in TypeScript. It ships without any
front end framework dependencies and focuses on providing an easy to embed editing experience.
The project powers a small demo application included in this repository and can be integrated
into other web applications.

## Features

- **Pure TypeScript** – no additional framework dependencies are required.
- **Block based** editing with support for paragraphs, headings, tables and more.
- **Quick menu** and **floating toolbar** components for a better UX.
- **Undo/redo** support using a `Memento` implementation.
- Syntax highlighted code blocks via `highlight.js`.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm start
```

To build the production bundle run:

```bash
npm run build
```

### Running Tests

The project contains Jest unit tests. Execute them with:

```bash
npm test
```

## Project Structure

- `src/` – TypeScript sources and style sheets
- `demo/` – static files used by the demo application
- `tests/` – helper files for unit tests

## CSS Classes

Johannes exposes a set of CSS classes that can be used to style editable blocks:

* `.focusable` – indicates whether an element can be focused
* `.focus` – highlights the primary focus when multiple focusable elements are present
* `.deletable` – allows deletion of empty elements via the delete or backspace key
* `.swittable` – indicates that an element can change its type
* `.draggable` – marks an element as draggable
* `.drag-handler` – used along with `draggable="true"` for drag and drop handlers
* `.block` – general class for block elements
* `.editable` – focuses the cursor when navigating the document with arrow keys
* `.key-trigger` – marks elements that trigger actions on key press
* `.johannes-editor` – the main editor container
* `.johannes-content-element` – content elements within the editor

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to propose
changes and run the project locally.

## License

This project is released under the [MIT License](LICENSE).
