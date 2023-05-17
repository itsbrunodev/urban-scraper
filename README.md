## urban-scraper

A package that scrapes the [Urban Dictionary](https://www.urbandictionary.com/).

### Installation

```
npm install urban-scraper
```

### Usage

```js
// get a specific term
await getTerm("urban");

// get a specific term with markdown formatting
await getTerm("urban", true);

// get a random term
await getRandom();
```

### Example response

```js
{
  found: true,
  term: "Urban",
  id: 11468038,
  description: "when ur too lazy to type out urban dictionary",
  example: 'I wonder how urban dictionary is defined in the urban dictionary. hmmm. "urban....clicks enter"',
  createdAt: 2017-04-21T22:00:00.000Z,
  author: {
    name: "fghjkm",
    url: "https://www.urbandictionary.com/author.php?author=fghjkm"
  },
  thumbs: { up: 8183, down: 911 }
}
```
