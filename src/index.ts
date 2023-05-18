import fetch from "node-fetch";
import * as cheerio from "cheerio";

export interface Term {
  found: boolean;
  term: string;
  id?: number;
  url?: string;
  description?: string;
  example?: string;
  createdAt?: Date;
  author?: {
    name: string;
    url: string;
  };
  thumbs?: {
    up: number;
    down: number;
  };
}

interface ElementAttrib {
  attribs: {
    [name: string]: string;
  };
}

const notFoundSelector =
  "#ud-root > div > main > div > div > section > div > div.font-bold.text-2xl.my-8";
const termWrapper =
  "#ud-root > div > main > div > div > section > div:nth-child(1)";
const termSelector = `${termWrapper} > div > div > h1 > a`;
const descriptionSelector = `${termWrapper} > div > div.break-words.meaning.mb-4`;
const exampleSelector = `${termWrapper} > div > div.break-words.example.italic.mb-4`;
const authorSelector = `${termWrapper} > div > div.contributor.font-bold > a`;
const dateSelector = `${termWrapper} > div > div.contributor.font-bold`;
const termIdSelector = `${termWrapper} > a`;

/* for markdown formatting */
const link =
  /<a class="autolink" href="(?<url>\/define\.php\?term=[\w%\/.-]+)">(?<text>[\w. '-]+)/gm;
const linkStr = "[$<text>](https://www.urbandictionary.com$<url>)";
const linkEnd = /<\/a>|\*/gm;

const newLine = /<br>/gm;
const termIdRegex = /[\w:\/.?]+defid=(?<termId>[\d]+)/;

function format(termData: Term, formatMarkdown = false): Term {
  const { found, description, example } = termData;

  if (found && description && example)
    return {
      ...termData,
      description: description
        .replace(newLine, "\n")
        .replace(link, formatMarkdown ? linkStr : "$<text>")
        .replace(linkEnd, ""),
      example: example
        .replace(newLine, "\n")
        .replace(link, formatMarkdown ? linkStr : "$<text>")
        .replace(linkEnd, ""),
    } as Term;
  else return termData;
}

/**
 * The function to fetch data for the `getTerm` and `getRandom` function
 */
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
    return { found: false, term: str } as Term;

  /* get the term name */
  const term = $(termSelector).html();

  /* get the term description */
  const description = $(descriptionSelector).html();

  /* get the example of the term */
  const example = $(exampleSelector).html();

  /* get the author of the term */
  const author = $(authorSelector);
  const name = author.html();
  const authorUrl = `https://www.urbandictionary.com${
    (author[0] as ElementAttrib).attribs.href
  }`;

  /* get when the term was created */
  const date = $(dateSelector);
  const dateString = (date.children()[0].next as { data: string }).data.trim();
  const createdAt = new Date(dateString);

  /* get the term id */
  const termId = $(termIdSelector);
  const id = Number(
    (termId[0] as ElementAttrib).attribs.href.replace(termIdRegex, "$<termId>")
  );

  /* get the term's thumbs up and down count */
  const thumbs = await fetch(
    `https://api.urbandictionary.com/v0/uncacheable?ids=${id}`
  )
    .then(
      async (x) =>
        (await x.json()) as {
          thumbs: { up: number; down: number }[];
        }
    )
    .then((x) => ({
      up: x.thumbs[0].up,
      down: x.thumbs[0].down,
    }));

  /* get the term's url */
  const url = `https://www.urbandictionary.com/define.php?term=${term}&defid=${id}`;

  return {
    found: true,
    term,
    id,
    url,
    description,
    example,
    createdAt,
    author: { name, url: authorUrl },
    thumbs,
  } as Term;
}

export async function getTerm(
  str: string,
  formatMarkdown: boolean
): Promise<Term>;
export async function getTerm(
  str: string[],
  formatMarkdown: boolean
): Promise<Term[]>;
/**
 * Get a term with its description and the example from the urban dictionary
 * @param {string} str - The term name
 * @param {boolean} formatMarkdown - Whether to format the term description and the example for markdown
 * @example await getTerm("urban");
 */
export async function getTerm(
  str: string | string[],
  formatMarkdown = false
): Promise<Term | Term[]> {
  if (!str || str.length === 0) throw new Error("Provide a term to search for");
  if (typeof formatMarkdown !== "boolean")
    throw new Error("Format markdown option needs to be a boolean");

  if (Array.isArray(str)) {
    const responses: Term[] = [];
    for (const query of str) {
      const termData = await get(query);
      responses.push(format(termData, formatMarkdown));
    }
    return responses;
  }

  const termData = await get(str);

  return format(termData, formatMarkdown);
}

/**
 * Get a random term with its description and the example from the urban dictionary
 * @param {boolean} formatMarkdown - Whether to format the term description and the example for markdown
 * @example await getRandom();
 */
export async function getRandom(formatMarkdown = false) {
  if (typeof formatMarkdown !== "boolean")
    throw new Error("Format markdown option needs to be a boolean");

  const termData = await get("", true);

  return format(termData, formatMarkdown);
}
