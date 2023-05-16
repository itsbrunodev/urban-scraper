import fetch from "node-fetch";
import * as cheerio from "cheerio";

export interface Term {
  found: boolean;
  term?: string;
  id?: number;
  description?: string;
  example?: string;
  author?: {
    name: string;
    url: string;
  };
  createdAt?: Date;
}

const notFoundSelector =
  "#ud-root > div > main > div > div > section > div > div.font-bold.text-2xl.my-8";
const termSelector =
  "#ud-root > div > main > div > div > section > div:nth-child(1) > div > div > h1 > a";
const descriptionSelector =
  "#ud-root > div > main > div > div.flex.flex-col.mx-0.gap-4 > section > div:nth-child(1) > div > div.break-words.meaning.mb-4";
const exampleSelector =
  "#ud-root > div > main > div > div.flex.flex-col.mx-0.gap-4 > section > div:nth-child(1) > div > div.break-words.example.italic.mb-4";
const authorSelector =
  "#ud-root > div > main > div > div.flex.flex-col.mx-0.gap-4 > section > div:nth-child(1) > div > div.contributor.font-bold > a";
const dateSelector =
  "#ud-root > div > main > div > div.flex.flex-col.mx-0.gap-4 > section > div:nth-child(1) > div > div.contributor.font-bold";
const termIdSelector =
  "#ud-root > div > main > div > div.flex.flex-col.mx-0.gap-4 > section > div:nth-child(1) > a";

/* for markdown formatting */
const link =
  /<a class="autolink" href="(?<url>\/define\.php\?term=[\w%\/.-]+)">(?<text>[\w. '-]+)/gm;
const linkStr = "[$<text>](https://www.urbandictionary.com$<url>)";
const linkEnd = /<\/a>|\*/gm;

const newLine = /<br>/gm;
const termIdRegex = /[\w:\/.?]+defid=(?<termId>[\d]+)/;

function format(termData: Term, formatMarkdown = false): Term {
  const { found, description, example } = termData;

  if (found && description && example) {
    if (formatMarkdown) {
      return {
        ...termData,
        description: description
          .replace(newLine, "\n")
          .replace(link, linkStr)
          .replace(linkEnd, ""),
        example: example
          .replace(newLine, "\n")
          .replace(link, linkStr)
          .replace(linkEnd, ""),
      } as Term;
    }

    return {
      ...termData,
      description: description
        .replace(newLine, "\n")
        .replace(link, "$<text>")
        .replace(linkEnd, ""),
      example: example
        .replace(newLine, "\n")
        .replace(link, "$<text>")
        .replace(linkEnd, ""),
    } as Term;
  } else return termData;
}

async function get(str: string, random = false) {
  const termUrl = `https://www.urbandictionary.com/${
    random ? `random.php` : `define.php?term=${str}`
  }`;

  const html = await fetch(termUrl, { redirect: "follow" }).then(
    async (x) => await x.text()
  );

  const $ = cheerio.load(html);

  /* check if the term wasn't found */
  const notFound = $(notFoundSelector).html();

  if (notFound?.startsWith("Sorry, we couldn't find:"))
    return { found: false } as Term;

  /* get the term name */
  const term = $(termSelector).html();

  /* get the term description */
  const description = $(descriptionSelector).html();

  /* get the example of the term */
  const example = $(exampleSelector).html();

  /* get the author of the term */
  const author = $(authorSelector);
  const name = author.html();
  const url = `https://www.urbandictionary.com${author[0].attribs.href}`;

  /* get when the term was created */
  const date = $(dateSelector);
  const dateString = (date.children()[0].next as { data: string }).data.trim();
  const createdAt = new Date(dateString);

  /* get the term id */
  const termId = $(termIdSelector);
  const id = Number(termId[0].attribs.href.replace(termIdRegex, "$<termId>"));

  return {
    found: true,
    term,
    id,
    description,
    example,
    author: { name, url },
    createdAt,
  } as Term;
}

/**
 * Get a term with its description and the example from the urban dictionary
 * @param {string} str - The term name
 * @param {boolean} formatMarkdown - Wether to format the term description and the example for markdown
 * @example await getTerm("urban")
 */
export async function getTerm(
  str: string,
  formatMarkdown = false
): Promise<Term> {
  if (!str || str.length === 0 || typeof str !== "string")
    throw new Error("Provide a term to search for");
  if (typeof formatMarkdown !== "boolean")
    throw new Error("Format markdown option needs to be a boolean");

  const termData = await get(str);

  return format(termData, formatMarkdown);
}

/**
 * Get a random term with its description and the example from the urban dictionary
 * @param {boolean} formatMarkdown - Wether to format the term description and the example for markdown
 * @example await getRandom()
 */
export async function getRandom(formatMarkdown = false) {
  if (typeof formatMarkdown !== "boolean")
    throw new Error("Format markdown option needs to be a boolean");

  const termData = await get("", true);

  return format(termData, formatMarkdown);
}
