import { Utils } from "@/utilities/Utils";

describe("DOMUtils.isValidUrl", () => {
    test.each([
        ["https://example.com", true],
        ["http://example.com", true],
        ["https://example.com/path/to/resource", true],
        ["https://example.com:8080", true],
        ["https://example.com?query=1", true],
        ["https://example.com#section", true],
        ["https://sub.domain.example.com", true],

        ["", false],
        ["example.com", false],
        ["ftp://example.com", false],
        ["http:/example.com", false],
        ["http://", false],
        ["http://-example.com", false],
        ["http://example..com", false],

        ["https://example.com/../secret", false],
        ["https://example.com/%2e%2e/secret", false],
        ["https://example.com/path%00to", false],

        ["http://127.0.0.1", false],
        ["http://localhost", false],

        ["/relative/path", false],
        ["./file.txt", false],
        ["?x=1", false],
        ["#anchor", false],
    ])("should return %s for %s", (url, expected) => {
        expect(Utils.isValidUrl(url)).toBe(expected);
    });
});

describe("DOMUtils.isValidUrl - edge cases", () => {
    test.each([
        ["https://example.museum", true],
        ["https://example.travel", true],
        ["https://example.technology", true],

        ["https://xn--fsq.com", true],
        ["https://xn--80ak6aa92e.com", true],
        ["https://üñîçødê.com", false],

        ["https://user:pass@example.com", true],
        ["http://admin:1234@sub.domain.com:8080/path", true],

        ["https://example.com/search?q=test&lang=en#section1", true],
        ["https://example.com/?q=%E2%9C%93", true],

        ["https://example.com:99999", false],
        ["https://example.com:0", false],

        ["mailto:user@example.com", false],
        ["file:///C:/Users/Name/index.html", false],

        ["https//example.com", false],
        ["//example.com", false],

        ["https://example.com/with space", false],
        ["https://example.com/%20valid", true],
        ["https://example.com/%00bad", false],

        ["https://-bad.com", false],
        ["https://bad-.com", false],

        ["https://my_domain.com", false],

        ["https://" + "a".repeat(64) + ".com", false],
        ["https://" + "a".repeat(63) + ".com", true],
    ])("should return %s for %s", (url, expected) => {
        expect(Utils.isValidUrl(url)).toBe(expected);
    });
});