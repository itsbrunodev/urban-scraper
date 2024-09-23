## urban-scraper

A package for scraping terms and their definitions from the [Urban Dictionary](https://www.urbandictionary.com/).

### Installation

```
npm add urban-scraper
yarn add urban-scraper
pnpm add urban-scraper
```

### Usage

```js
// get a single term
await getTerm("urban");

// get multiple terms
await getTerm(["urban", "cool"]);

// get a specific term with markdown formatting
await getTerm("urban", { formatMarkdown: true });

// get multiple terms with markdown formatting
await getTerm(["urban", "cool"], { formatMarkdown: true });

// get a random term
await getRandom();

// get a random term with markdown formatting
await getRandom({ formatMarkdown: true });
```

### Example response

```js
{
  found: true,
  term: "Urban",
  id: 11468038,
  url: "https://www.urbandictionary.com/define.php?term=Urban&defid=11468038",
  description: "when ur too lazy to type out urban dictionary",
  example: 'I wonder how urban dictionary is defined in the urban dictionary. hmmm. "urban....clicks enter"',
  createdAt: 2017-04-22T00:00:00.000Z,
  author: {
    name: "fghjkm",
    url: "https://www.urbandictionary.com/author.php?author=fghjkm"
  },
  thumbs: { up: 8184, down: 911 }
}
```
