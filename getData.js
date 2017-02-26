const axios = require('axios')
const fs = require('fs')

// YOU MUST SUPPLY YOUR OWN TOKEN FILE
const token = require('./token.js').default

var options = {
  headers: {
    "User-Agent": `interpolations-datafetcher`,
    "Authorization": `token ${token}`
  }
}

const searchURL = 'https://api.github.com/search/code?q=interpolationWeight+extension:glyphs'

async function getGlyphsData() {
  try {
    const searchResults = await axios(searchURL, options)
    const fontFamilies = Promise.all(searchResults.data.items.map(async (el) => {
      const file = await axios(el.url, options)
      const fontFamily = parseGlyphsFile(file.data.content)
      return fontFamily
    }))
    console.log(await fontFamilies)
    writeToDisk(await fontFamilies)
  } catch (err) {
    console.log('failed', err)
  }
}

getGlyphsData()

const writeToDisk = (data) => {
  const content = `module.exports = ${JSON.stringify(data, null, '\t')}`
  console.log("Writing data to disk...")
  fs.writeFile("./src/data/fonts.js", content, function(err) {
    if(err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

const parseGlyphsFile = (fileBuffer) => {
  const file = new Buffer(fileBuffer, 'base64').toString('ascii')
  const familyName = file.match(/familyName = "(.*)";/)
  const instanceMatches = file.match(/\{\n?((?:interpolationWeight|customParameters \= \([.\S\s]*?\);)[.\S\s]*?)(?:\}[,\n])/g)
  const instances = instanceMatches.map(instance => {
    const name = instance.match(/name \= (.*)\;/)
    const weightClass = instance.match(/weightClass \= (.*)\;/)
    const weight = instance.match(/interpolationWeight \= (\d*)\;/)
    return {
      "style": name && name[1],
      "weight": weight && weight[1]
    }
  })
  const obj = {
    "name": familyName && familyName[1],
    "interpolations": instances
  }
  return obj
}
