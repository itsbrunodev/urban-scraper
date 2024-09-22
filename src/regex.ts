export const LINK_START_REGEX =
  /<a class="autolink" href="(?<url>\/define\.php\?term=[\w%\/.-]+)">(?<text>[\w. '-]+)/gm;
export const LINK_STRING_REGEX =
  "[$<text>](https://www.urbandictionary.com$<url>)";
export const LINK_END_REGEX = /<\/a>|\*/gm;

export const NEW_LINE_REGEX = /<br>/gm;
export const TERM_ID_REGEX = /[\w:\/.?]+defid=(?<termId>[\d]+)/;
