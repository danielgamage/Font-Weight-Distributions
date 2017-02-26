const axios = require('axios')

// YOU MUST SUPPLY YOUR OWN TOKEN FILE
const token = require('./token.js').default

var options = {
  headers: {
    "User-Agent": `interpolations-datafetcher`,
    "Authorization": `token ${token}`
  }
}

const glyphsURL = 'https://api.github.com/search/code?q=interpolationWeight+extension:glyphs'

async function getGlyphsData() {
  try {
    const searchResults = await axios(glyphsURL, options )
    const fontFamilies = searchResults.data.items.map(async (el) => {
      const file = await axios(el.url, options)
      const fontFamily = parseGlyphsFile(file.data.content)
      return fontFamily
    })
  } catch (err) {
    console.log('failed', err)
  }
}

getGlyphsData()

const parseGlyphsFile = (fileBuffer) => {
  const file = new Buffer(fileBuffer, 'base64').toString('ascii')
  console.log(file)
  const familyName = file.match(/familyName = "(.*)";/)[1]
  const instanceMatches = file.match(/\{\n?(interpolationWeight[.\S\s]*?)\}[,\n]/)
  // console.log(instanceMatches)
  const instances = instanceMatches.map(instance => {
    const name = instance.match(/name \= (.*)\;/)[1]
    const weight = instance.match(/interpolationWeight \= (\d*)\;/)[1]
    return { "style": name, "weight": weight }
  })
  const obj = {
    "name": familyName,
    "interpolations": instances
  }
  // console.log(obj)
  return obj
}
