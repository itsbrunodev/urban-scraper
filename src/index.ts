import { Options, Term } from "./types";
import { format, get } from "./utils";

export { Options, Term };

export async function getTerm(query: string, options?: Options): Promise<Term>;
export async function getTerm(
  str: string[],
  options?: Options
): Promise<Term[]>;
/**
 * Get a term with its description and the example from the urban dictionary
 * @param {string} str - The term name
 * @param {boolean} formatMarkdown - Whether to format the term description and the example for markdown
 * @example await getTerm("urban");
 */
export async function getTerm(
  str: string | string[],
  options: Options = { formatMarkdown: false }
): Promise<Term | Term[]> {
  if (!str || str.length === 0) throw new Error("Provide a term to search for");
  if (typeof options.formatMarkdown !== "boolean")
    throw new Error("Format markdown option needs to be a boolean");

  if (Array.isArray(str)) {
    const responses: Term[] = [];
    for (const query of str) {
      const termData = await get(query);
      responses.push(format(termData, options.formatMarkdown));
    }
    return responses;
  }

  const termData = await get(str);

  return format(termData, options.formatMarkdown);
}

/**
 * Get a random term with its description and the example from the urban dictionary
 * @param {boolean} formatMarkdown - Whether to format the term description and the example for markdown
 * @example await getRandom();
 */
export async function getRandom(options: Options = { formatMarkdown: false }) {
  if (typeof options.formatMarkdown !== "boolean")
    throw new Error("Format markdown option needs to be a boolean");

  const termData = await get("", true);

  return format(termData, options.formatMarkdown);
}
