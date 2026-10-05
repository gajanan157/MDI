import { describe, expect, it } from "vitest";
import {
  isAllowedSupportingDocument,
  SUPPORTING_DOCUMENT_ACCEPT,
} from "../shared";

function fakeFile(name: string, type = ""): File {
  return new File(["x"], name, { type });
}

describe("supporting document upload – EML support", () => {
  it("lists .eml and message/rfc822 in the accept string", () => {
    expect(SUPPORTING_DOCUMENT_ACCEPT).toContain(".eml");
    expect(SUPPORTING_DOCUMENT_ACCEPT).toContain("message/rfc822");
  });

  it("accepts a .eml file by extension", () => {
    expect(isAllowedSupportingDocument(fakeFile("mail.eml"))).toBe(true);
    expect(isAllowedSupportingDocument(fakeFile("MAIL.EML"))).toBe(true);
  });

  it("accepts a .eml file by MIME type when the name has no extension", () => {
    expect(isAllowedSupportingDocument(fakeFile("mail", "message/rfc822"))).toBe(true);
  });

  it("still accepts the other supported formats", () => {
    expect(isAllowedSupportingDocument(fakeFile("a.pdf"))).toBe(true);
    expect(isAllowedSupportingDocument(fakeFile("a.docx"))).toBe(true);
    expect(isAllowedSupportingDocument(fakeFile("a.jpeg"))).toBe(true);
  });

  it("rejects an unsupported format", () => {
    expect(isAllowedSupportingDocument(fakeFile("a.txt"))).toBe(false);
    expect(isAllowedSupportingDocument(fakeFile("a", "text/plain"))).toBe(false);
  });
});
