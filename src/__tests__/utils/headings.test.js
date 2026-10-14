import { addHeadingIds } from "utils/headings";

describe("addHeadingIds", () => {
  it("gives headings prefixed, unique ids and lists them", () => {
    const { html, headings } = addHeadingIds(
      "<h2>Setup</h2><p>x</p><h3>Cài đặt</h3><h2>Setup</h2><h4>Skip</h4>"
    );

    expect(headings).toEqual([
      { id: "h-setup", text: "Setup", level: 2 },
      { id: "h-cai-dat", text: "Cài đặt", level: 3 },
      { id: "h-setup-2", text: "Setup", level: 2 },
    ]);
    expect(html).toContain('<h2 id="h-setup">Setup</h2>');
    expect(html).toContain('<h2 id="h-setup-2">Setup</h2>');
  });

  it("can't clobber DOM globals", () => {
    const { headings } = addHeadingIds("<h2>cookie</h2>");

    expect(headings[0].id).toBe("h-cookie");
  });

  it("handles empty content", () => {
    expect(addHeadingIds("")).toEqual({ html: "", headings: [] });
  });
});
