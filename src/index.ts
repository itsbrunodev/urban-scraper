import { request } from "undici";
import * as cheerio from "cheerio";

export interface Term {
  found: boolean;
  term?: string;
  description?: string;
  example?: string;
}

const notFoundSelector =
  "#ud-root > div > main > div > div > section > div > div.font-bold.text-2xl.my-8";
const termSelector =
  "#ud-root > div > main > div > div > section > div:nth-child(1) > div > div > h1 > a";
const descriptionSelector =
  "#ud-root > div > main > div > div.flex.flex-col.mx-0.gap-4 > section > div:nth-child(1) > div > div.break-words.meaning.mb-4";
const exampleSelector =
  "#ud-root > div > main > div > div.flex.flex-col.mx-0.gap-4 > section > div:nth-child(1) > div > div.break-words.example.italic.mb-4";

/* for markdown formatting */
const link =
  /<a class="autolink" href="(?<url>\/define\.php\?term=[\w%\/.-]+)">(?<text>[\w. '-]+)/gm;
const linkStr = "[$<text>](https://www.urbandictionary.com$<url>)";
const linkEnd = /<\/a>|\*/gm;

const newLine = /<br>/gm;

function format(termData: Term, formatMarkdown = false): Term {
  const { found, description, example } = termData;

  if (found) {
    const obj: Term = {
      ...termData,
      description: description.replace(newLine, "\n"),
      example: example.replace(newLine, "\n"),
    };

    if (formatMarkdown) {
      obj.description = obj.description
        .replace(link, linkStr)
        .replace(linkEnd, "");
      obj.example = obj.example.replace(link, linkStr).replace(linkEnd, "");
    }

    return obj;
  } else return termData;
}

async function get(str: string, random = false) {
  const url = `https://www.urbandictionary.com/${
    random ? `random.php` : `define.php?term=${str}`
  }`;

  const { body } = await request(url, {
    maxRedirections: 1 /* this is only set to 1 because sometimes urban redirects you to another term */,
  });

  const html = await body.text();
  const $ = cheerio.load(html);

  /* check if the term wasn't found */
  const notFound = $(notFoundSelector).html();

  if (notFound.startsWith("Sorry, we couldn't find:"))
    return { found: false } as Term;

  /* get the term name */
  const term = $(termSelector).html();

  /* get the term description */
  const description = $(descriptionSelector).html();

  /* get the example of the term */
  const example = $(exampleSelector).html();

  return {
    found: true,
    term,
    description,
    example,
  };
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
    throw new Error("Format markdown options needs to be a boolean");

  const termData = await get(str);

  return format(termData, formatMarkdown);
}

/**
 * Get a random term with its description and the example from the urban dictionary
 * @param {boolean} formatMarkdown - Wether to format the term description and the example for markdown
 * @example await getTerm("urban")
 */
export async function getRandom(formatMarkdown = false) {
  if (typeof formatMarkdown !== "boolean")
    throw new Error("Format markdown options needs to be a boolean");

  const termData = await get("", true);

  return format(termData, formatMarkdown);
}
