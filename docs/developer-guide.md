# Developer Guide

## Local Setup

1. Run `npm install` to install dependencies.
2. Start the dev server with `npm start`.

## Running Tests

Use `npm test` to execute unit tests.

## Building

`npm run build` generates a production bundle in the `dist/` directory. Running
this command also copies the bundle into the `demo/` folder so GitHub Pages
serves the latest build without keeping duplicate bundles.
The workflow runs this command automatically before deploying the contents of
`demo/`.
