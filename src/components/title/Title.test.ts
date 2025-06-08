import { Title } from "./Title";

describe("Title", () => {
    
    test("Create title", () => {

        const title = Title.create(undefined);
        expect(title).toBeInstanceOf(Title);
    });

    test("should include <br> when no value is provided", () => {
        const title = Title.create(undefined);
        const element = title.init();
        expect(element.querySelector("h1")!.innerHTML).toBe("<br>");
    });

    //TODO: Add test to check Enter
});