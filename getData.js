const util = require('util')
const axios = require('axios')
const fs = require('fs')
const ProgressBar = require('progress')
const blacklist = require('./src/data/blacklist.js')
const removeDuplicates = require('./src/utils/removeDuplicates.js')
const parser = require('xml2json')

// YOU MUST SUPPLY YOUR OWN TOKEN FILE
const config = require('./config.js')

var options = {
  headers: {
    "User-Agent": `interpolations-datafetcher`,
    "Authorization": `token ${config.token}`
  }
}

const glyphsSearchURL      = 'https://api.github.com/search/code?q=interpolationWeight+extension:glyphs'
const designSpaceSearchURL = 'https://api.github.com/search/code?q=weight+extension:designspace'

const getLink = (header, rel = 'next') => {
  const replacement = `<(.*?)>(?=; rel="${rel}")`
  const regex = new RegExp(replacement)
  const link = header.match(regex) && header.match(regex)[1]
  return link
}

async function getData(url) {
  try {
    const searchResults = await axios(url, options)
    // console.log(getLink(searchResults.headers.link))

    const dedupedItems = removeDuplicates(searchResults.data.items, 'repository.full_name')
    console.log(`Deduped ${searchResults.data.items.length - dedupedItems.length} items`)

    const filteredItems = dedupedItems.filter(el => (
      blacklist.indexOf(el.repository.full_name) === -1
    ))
    console.log(`Filtered out ${dedupedItems.length - filteredItems.length} blacklisted items`)

    const progress = new ProgressBar('Fetching files [:bar] :percent', {total: dedupedItems.length})

    const fontFamilies = Promise.all(filteredItems.map(async (el) => {
      const file = await axios(el.url, options)
      const fontFamily = (url === glyphsSearchURL) ? parseGlyphsFile(file.data, el) : parseDesignSpaceFile(file.data, el)

      progress.tick()

      console.log(await fontFamily)
      return await fontFamily
    }))
    return await fontFamilies
  } catch (err) {
    console.log('failed', err)
  }
}

const parseDesignSpaceFile = (fileData, originalQueryMatch) => {
  const file = new Buffer(fileData.content, 'base64').toString('ascii')
  const fileObject = parser.toJson(file, {object: true, coerce: true, arrayNotation: ['instance', 'dimension']})

  const familyName = fileObject.designspace.instances.instance[0].familyName

  const instances = fileObject.designspace.instances.instance.map(instance => {
    const weight = instance.location.dimension.filter(el => el.name.toLowerCase() === "weight")[0].xvalue
    return {
      "style": instance.stylename,
      "weight": weight
    }
  })
  const obj = {
    "name": familyName && familyName[1],
    "url": originalQueryMatch.repository.html_url,
    "interpolations": instances
  }
  return obj
}

const parseGlyphsFile = (fileData, originalQueryMatch) => {
  const file = new Buffer(fileData.content, 'base64').toString('ascii')
  const familyName = file.match(/familyName = "(.*)";/)
  const instanceMatches = file.match(/\{\n?((?:interpolationWeight|customParameters \= \([.\S\s]*?\);)[.\S\s]*?)(?:\}[,\n])/g)
  const instances = instanceMatches.map(instance => {
    const name = instance.match(/name \= (.*)\;\nweightClass/)
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

async function init() {
  const glyphsFonts      = await getData(glyphsSearchURL)
  const designSpaceFonts = await getData(designSpaceSearchURL)

  writeToDisk([...glyphsFonts, ...designSpaceFonts])
}
init()
