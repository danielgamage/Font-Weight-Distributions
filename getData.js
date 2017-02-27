const axios = require('axios')
const fs = require('fs')
const ProgressBar = require('progress')
const blacklist = require('./src/data/blacklist.js')
const removeDuplicates = require('./src/utils/removeDuplicates.js')

// YOU MUST SUPPLY YOUR OWN TOKEN FILE
const config = require('./config.js')

var options = {
  headers: {
    "User-Agent": `interpolations-datafetcher`,
    "Authorization": `token ${config.token}`
  }
}

const searchURL = 'https://api.github.com/search/code?q=interpolationWeight+extension:glyphs'

const getLink = (header, rel = 'next') => {
  const replacement = `<(.*?)>(?=; rel="${rel}")`
  const regex = new RegExp(replacement)
  const link = header.match(regex) && header.match(regex)[1]
  return link
}

async function getGlyphsData() {
  try {
    const searchResults = await axios(searchURL, options)
    // console.log(getLink(searchResults.headers.link))

    const dedupedItems = removeDuplicates(searchResults.data.items, 'repository.full_name')
    console.log(`Deduped ${searchResults.data.items.length - dedupedItems.length} items`)

    const filteredItems = dedupedItems.filter(el => {
      return (blacklist.indexOf(el.repository.full_name) === -1)
    })
    console.log(`Filtered out ${dedupedItems.length - filteredItems.length} blacklisted items`)

    const progress = new ProgressBar('Fetching files [:bar] :percent', {total: dedupedItems.length})

    const fontFamilies = Promise.all(filteredItems.map(async (el) => {
      const file = await axios(el.url, options)
      const fontFamily = parseGlyphsFile(file.data, el)
      progress.tick()
      return fontFamily
    }))
    console.log(await fontFamilies)
    writeToDisk(await fontFamilies)
  } catch (err) {
    console.log('failed', err)
  }
}

const parseGlyphsFile = (fileData, originalQueryMatch) => {
  const file = new Buffer(fileData.content, 'base64').toString('ascii')
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
    "url": originalQueryMatch.repository.html_url,
    "interpolations": instances
  }
  return obj
}

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

getGlyphsData()
