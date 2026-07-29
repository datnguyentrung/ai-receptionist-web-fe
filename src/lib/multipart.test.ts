import { describe, expect, it } from "vitest";
import { toMultipartFormData } from "./multipart";

describe("toMultipartFormData", () => {
  it("serializes JSON into the data part and includes the optional file", async () => {
    const image = new File(["image"], "portrait.webp", {
      type: "image/webp",
    });
    const formData = toMultipartFormData({ fullName: "Nguyễn Văn A" }, image);
    const data = formData.get("data");

    expect(data).toBeInstanceOf(Blob);
    expect(await (data as Blob).text()).toBe('{"fullName":"Nguyễn Văn A"}');
    expect(formData.get("file")).toBe(image);
  });

  it("does not add a file part when no image is selected", () => {
    const formData = toMultipartFormData({ fullName: "Nguyễn Văn A" });

    expect(formData.has("data")).toBe(true);
    expect(formData.has("file")).toBe(false);
  });
});
