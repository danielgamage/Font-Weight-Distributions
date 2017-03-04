const util = require('util')
const axios = require('axios')
const fs = require('fs')
const ProgressBar = require('progress')
const blacklist = require('../src/data/blacklist.js')
const removeDuplicates = require('../src/utils/removeDuplicates.js')
const parser = require('xml2json')

// YOU MUST SUPPLY YOUR OWN TOKEN FILE
const config = require('./config.js')

var options = {
  headers: {
    "User-Agent": `interpolations-datafetcher`,
    "Authorization": `token ${config.token}`
  }
}

const glyphsSearchURL    = 'https://api.github.com/search/code?q=interpolationWeight+extension:glyphs'
let url = 'https://api.github.com/search/code?q=weight+extension:designspace'

const getLink = (header, rel = 'next') => {
  const replacement = `<(.*?)>(?=; rel="${rel}")`
  const regex = new RegExp(replacement)
  const link = header.match(regex) && header.match(regex)[1]
  return link
}

async function getData(url) {
  try {
    let families = []
    let page = 1
    while (url) {
      console.log(`Working on page ${page}...`)
      const searchResults = await axios(url, options)
      url = getLink(searchResults.headers.link)

      const dedupedItems = removeDuplicates(searchResults.data.items, 'repository.full_name')
      console.log(`Deduped ${searchResults.data.items.length - dedupedItems.length} items`)

      const filteredItems = dedupedItems.filter(el => (
        blacklist.indexOf(el.repository.full_name) === -1
      ))
      console.log(`Filtered out ${dedupedItems.length - filteredItems.length} blacklisted items`)

      const progress = new ProgressBar('Fetching files [:bar] :percent \n', {total: dedupedItems.length})

      const familiesPage = Promise.all(filteredItems.map(async (el) => {
        const file = await axios(el.url, options)
        const fontFamily = (url === glyphsSearchURL) ? parseGlyphsFile(file.data, el) : parseDesignSpaceFile(file.data, el)

        // update progress bar
        progress.tick()

        console.log(await fontFamily)
        return await fontFamily
      })).then(result => result.filter((el) => (
        // remove nulls
        el
      )).filter((el) => (
        // remove test fonts
        !(el.name.match(/test/i))
      )).filter(el => (
        // remove fonts with only one interpolation
        el.interpolations.length > 1
      )))
      families.push(await familiesPage)
      page++
    }
    // flatten pages
    const familiesFlattened = families.reduce( ( acc, cur ) => acc.concat(cur), [] )
    // dedupe font families one last time
    return removeDuplicates(familiesFlattened, 'name')
  } catch (err) {
    console.log('failed', err)
  }
}

const parseDesignSpaceFile = (fileData, originalQueryMatch) => {
  const file = new Buffer(fileData.content, 'base64').toString('ascii')
  const fileObject = parser.toJson(file, {object: true, coerce: true, arrayNotation: ['instance', 'dimension']})

  const instances = fileObject.designspace.instances.instance
  if (instances && instances.length > 1) {
    const familyName = instances[0].familyname

    const interpolations = instances.map(instance => {
      const weight = instance.location.dimension.filter(el => el.name.toLowerCase() === "weight")[0].xvalue
      return {
        "style": instance.stylename,
        "weight": weight
      }
    })
    const obj = {
      "name": familyName,
      "url": originalQueryMatch.repository.html_url,
      "interpolations": removeDuplicates(interpolations, "weight")
    }
    return obj
  } else {
    return null
  }
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
    "interpolations": removeDuplicates(instances, "weight")
  }
  return obj
}

const writeToDisk = (data) => {
  const content = `module.exports = ${JSON.stringify(data, null, '\t')}`
  console.log("Writing data to disk...")
  fs.writeFile(`${__dirname}/../src/data/fonts.js`, content, function(err) {
    if(err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

async function init() {
  // const glyphsFonts      = await getData(glyphsSearchURL)
  const designSpaceFonts = await getData(url)

  // writeToDisk([...glyphsFonts, ...designSpaceFonts])
  writeToDisk([...designSpaceFonts])
}
init()
