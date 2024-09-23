import {
  AUTHOR_SELECTOR,
  DATE_SELECTOR,
  DESCRIPTION_SELECTOR,
  EXAMPLE_SELECTOR,
  NOT_FOUND_SELECTOR,
  TERM_ID_SELECTOR,
  TERM_SELECTOR,
} from "./selectors";
import {
  LINK_END_REGEX,
  LINK_START_REGEX,
  LINK_STRING_REGEX,
  NEW_LINE_REGEX,
  TERM_ID_REGEX,
} from "./regex";
import { Term } from "./types";

import fetch from "node-fetch";
import * as cheerio from "cheerio";

/**
 * Formats the term data as markdown if `formatMarkdown` is true
 * @param termData
 * @param formatMarkdown
 * @returns
 */
export function format(termData: Term, formatMarkdown = false): Term {
  const { found, description, example } = termData;

  if (found && description && example)
    return {
      ...termData,
      description: description
        .replace(NEW_LINE_REGEX, "\n")
        .replace(
          LINK_START_REGEX,
          formatMarkdown ? LINK_STRING_REGEX : "$<text>"
        )
        .replace(LINK_END_REGEX, ""),
      example: example
        .replace(NEW_LINE_REGEX, "\n")
        .replace(
          LINK_START_REGEX,
          formatMarkdown ? LINK_STRING_REGEX : "$<text>"
        )
        .replace(LINK_END_REGEX, ""),
    } as Term;
  else return termData;
}

interface ElementAttrib {
  attribs: {
    [name: string]: string;
  };
}

/**
 * The function to fetch data for the `getTerm` and `getRandom` function
 * @param str The term to search for
 * @param random Whether to get a random term
 */
export async function get(str: string, random = false) {
  const termUrl = `https://www.urbandictionary.com/${
    random ? `random.php` : `define.php?term=${str}`
  }`;

  const html = await fetch(termUrl, { redirect: "follow" }).then(
    async (x) => await x.text()
  );

  const $ = cheerio.load(html);

  /* check if the term wasn't found */
  const notFound = $(NOT_FOUND_SELECTOR).html();

  if (notFound?.startsWith("Sorry, we couldn't find:"))
    return { found: false, term: str } as Term;

  /* get the term name */
  const term = $(TERM_SELECTOR).html();

  /* get the term description */
  const description = $(DESCRIPTION_SELECTOR).html();

  /* get the example of the term */
  const example = $(EXAMPLE_SELECTOR).html();

  /* get the author of the term */
  const author = $(AUTHOR_SELECTOR);
  const name = author.html();
  const authorUrl = `https://www.urbandictionary.com${
    (author[0] as ElementAttrib).attribs.href
  }`;

  /* get when the term was created */
  const date = $(DATE_SELECTOR);
  const dateString = (date.children()[0].next as { data: string }).data.trim();
  const createdAt = new Date(
    Date.UTC(
      new Date(dateString).getFullYear(),
      new Date(dateString).getMonth(),
      new Date(dateString).getDate(),
      new Date(dateString).getHours(),
      new Date(dateString).getMinutes(),
      new Date(dateString).getSeconds(),
      new Date(dateString).getMilliseconds()
    )
  );

  /* get the term id */
  const termId = $(TERM_ID_SELECTOR);
  const id = Number(
    (termId[0] as ElementAttrib).attribs.href.replace(
      TERM_ID_REGEX,
      "$<termId>"
    )
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
