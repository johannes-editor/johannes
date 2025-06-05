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

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to propose
changes and run the project locally.

## License

This project is released under the [MIT License](LICENSE).
