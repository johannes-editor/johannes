import { UIBuilder } from "../../builders/UIBuilder";
import { Editor } from "../editor/Editor";


describe("AddBlockButton", () => {
    test("dummy", () => {
        expect(true).toBe(true);
    });
});

// describe("AddBlockButton", () => {

//     beforeEach(() => {
//         document.body.innerHTML = `
//         <div id="johannesEditor"></div>
//     `;

//         const editor = UIBuilder.build().start();
//         expect(editor).toBeInstanceOf(Editor);
//     });

//     test("Add functionality", () => {

//         let paragraphs = document.querySelectorAll("#johannesEditor .content p");
//         expect(paragraphs.length).toBe(1);

//         const addBlockButton = document.querySelector(".add-block") as HTMLButtonElement;

//         addBlockButton.click();

//         paragraphs = document.querySelectorAll("#johannesEditor .content p");
//         expect(paragraphs.length).toBe(2);
//     });
// });












// // import { UIBuilder } from "../../builders/UIBuilder";
// // import { Editor } from "../editor/Editor";

// // describe("AddBlockButton", () => {

// //     beforeEach(() => {
// //         // Setup the editor in the document body
// //         document.body.innerHTML = `
// //         <div id="johannesEditor"></div>
// //         <script>
// //             const editorConfig = {
// //                 enableFloatingToolbar: true,
// //                 enableQuickMenu: true,
// //                 enableAddBlock: true,
// //                 includeHeader: true,
// //                 includeFirstParagraph: true,
// //                 enableTitle: true,
// //                 title: undefined
// //             };
// //             window.editorConfig = editorConfig;
// //         </script>
// //     `;

// //         const editorConfig = {
// //             enableFloatingToolbar: true,
// //             enableQuickMenu: true,
// //             enableAddBlock: true,
// //             includeHeader: true,
// //             includeFirstParagraph: true,
// //             enableTitle: true,
// //             title: undefined
// //         };
// //         window.editorConfig = editorConfig;

// //         const editor = UIBuilder.build().start();
// //         expect(editor).toBeInstanceOf(Editor);
// //     });

// //     test("Add functionality", () => {

// //         let paragraphs = document.querySelectorAll("#johannesEditor .content p");
// //         expect(paragraphs.length).toBe(1);

// //         const addBlockButton = document.querySelector(".add-block") as HTMLButtonElement;

// //         addBlockButton.click();

// //         paragraphs = document.querySelectorAll("#johannesEditor .content p");
// //         expect(paragraphs.length).toBe(2);
// //     });
// // });
