export const NOT_FOUND_SELECTOR =
  "#ud-root > div > main > div > div > section > div > div.font-bold.text-2xl.my-8";
export const TERM_WRAPPER_SELECTOR =
  "#ud-root > div > main > div > div > section > div:nth-child(1)";
export const TERM_SELECTOR = `${TERM_WRAPPER_SELECTOR} > div > div > h1 > a`;
export const DESCRIPTION_SELECTOR = `${TERM_WRAPPER_SELECTOR} > div > div.break-words.meaning.mb-4`;
export const EXAMPLE_SELECTOR = `${TERM_WRAPPER_SELECTOR} > div > div.break-words.example.italic.mb-4`;
export const AUTHOR_SELECTOR = `${TERM_WRAPPER_SELECTOR} > div > div.contributor.font-bold > a`;
export const DATE_SELECTOR = `${TERM_WRAPPER_SELECTOR} > div > div.contributor.font-bold`;
export const TERM_ID_SELECTOR = `${TERM_WRAPPER_SELECTOR} > a`;
