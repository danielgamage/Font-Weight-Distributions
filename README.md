# Font Weight Distributions

## Building Data
This tool uses a script (`npm run fetch`) to collect `.designspace` files hosted on GitHub and parse them for interpolation data. It fetches the result of a query and pages through the results until the end. It writes the result to a file (`fonts.js`), which is ignored by git. To run this site locally, you'll first need to run `npm run fetch` to collect this data.

If you'd like to fetch a new dataset, you must have a `config.js` file in the `scripts/` folder next to `getData.js`. It should have a structure like this:

```
module.exports = {
  "token": "YOUR_TOKEN_GOES_HERE"
}
```

You must [register an application](https://github.com/blog/1509-personal-api-tokens) with github to get your own token.
