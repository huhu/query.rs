import { describe, expect, it } from "vitest";
import errorCodesIndex from "../../lib/index/error-codes.js";
import { formatErrorCode, searchErrorCodes } from "../../lib/search/error-code.js";

// Numbers inside the old invented spans that the error-code book does not publish.
const MISSING_NEIGHBORS = ["E0039", "E0041", "E0042", "E0043", "E0047", "E0385"];

describe("error code search", () => {
    it("indexes codes published in the Rust error-code book", () => {
        const codes = Object.keys(errorCodesIndex);
        expect(codes.length).toBeGreaterThan(400);
        for (const code of codes) {
            expect(code).toMatch(/^E\d{4}$/);
        }
        expect(codes).toContain("E0038");
        expect(codes).toContain("E0382");
        for (const code of MISSING_NEIGHBORS) {
            expect(errorCodesIndex[code]).toBeUndefined();
        }
    });

    it("searching e0038 returns the published code", () => {
        expect(searchErrorCodes("e0038").map((entry) => entry.code)).toEqual(["E0038"]);
        expect(searchErrorCodes("`e0038`").map((entry) => entry.code)).toEqual(["E0038"]);
    });

    it("searching e0382 returns the published code", () => {
        expect(searchErrorCodes("e0382").map((entry) => entry.code)).toEqual(["E0382"]);
        expect(searchErrorCodes("`E0382`").map((entry) => entry.code)).toEqual(["E0382"]);
    });

    it("a shorter prefix lists only published codes with that prefix", () => {
        const codes = searchErrorCodes("e038").map((entry) => entry.code);
        expect(codes).toContain("E0380");
        expect(codes).toContain("E0382");
        expect(codes).toContain("E0384");
        expect(codes).toContain("E0386");
        for (const code of codes) {
            expect(code.startsWith("E038")).toBe(true);
            expect(errorCodesIndex[code]).toBeTruthy();
        }
        for (const code of MISSING_NEIGHBORS) {
            expect(codes).not.toContain(code);
        }
    });

    it("links keep the error_codes path under the docs base url", () => {
        const [entry] = searchErrorCodes("e0382");
        expect(formatErrorCode("https://doc.rust-lang.org/", entry)).toMatchObject({
            content: "https://doc.rust-lang.org/error_codes/E0382.html",
        });
        expect(formatErrorCode("file:///rust-docs/", entry).content).toBe(
            "file:///rust-docs/error_codes/E0382.html",
        );
        const description = formatErrorCode("https://doc.rust-lang.org/", entry).description;
        expect(description).toContain("<match>E0382</match>");
        expect(description).toContain("moved elsewhere");
        for (const code of MISSING_NEIGHBORS) {
            expect(description).not.toContain(code);
        }
    });
});
