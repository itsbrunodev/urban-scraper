## urban-scraper

A package that scrapes the [Urban Dictionary](https://www.urbandictionary.com/).

### Installation
```
npm install urban-scraper
```

### Usage
```js
// get a specific term
await getTerm("urban")

// get a specific term with markdown formatting
await getTerm("urban", true)

// get a random term
await getRandom()
```