import { getTerm } from "../src";
import { Term } from "../src/types";

describe("getTerm function", () => {
  it("without markdown formatting", () => {
    getTerm("urban").then((term) => {
      expect(term).toMatchObject({
        found: true,
        term: "Urban",
        id: 11468038,
        url: "https://www.urbandictionary.com/define.php?term=Urban&defid=11468038",
        description: "when ur too lazy to type out urban dictionary",
        example:
          'I wonder how urban dictionary is defined in the urban dictionary. hmmm. "urban....clicks enter"',
        createdAt: new Date("2017-04-21T22:00:00.000Z"),
        author: {
          name: "fghjkm",
          url: "https://www.urbandictionary.com/author.php?author=fghjkm",
        },
        thumbs: expect.any(Object),
      } as Term);
    });
  });
  it("with markdown formatting", () => {
    getTerm("urban", { formatMarkdown: true }).then((term) => {
      expect(term).toMatchObject({
        found: true,
        term: "Urban",
        id: 11468038,
        url: "https://www.urbandictionary.com/define.php?term=Urban&defid=11468038",
        description:
          "when ur too [lazy](https://www.urbandictionary.com/define.php?term=lazy) to [type out](https://www.urbandictionary.com/define.php?term=type%20out) [urban dictionary](https://www.urbandictionary.com/define.php?term=urban%20dictionary)",
        example:
          'I wonder how urban dictionary is defined in [the urban dictionary](https://www.urbandictionary.com/define.php?term=the%20urban%20dictionary). [hmmm](https://www.urbandictionary.com/define.php?term=hmmm). "urban....[clicks enter](https://www.urbandictionary.com/define.php?term=clicks%20enter)"',
        createdAt: new Date("2017-04-21T22:00:00.000Z"),
        author: {
          name: "fghjkm",
          url: "https://www.urbandictionary.com/author.php?author=fghjkm",
        },
        thumbs: expect.any(Object),
      } as Term);
    });
  });
});
