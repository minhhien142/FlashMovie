// document['domain'] + '4590481877' + _0x55bax2b
'use strict'

const qs = require('querystring')
const aes = require('../aes')
const got = require('got')
const parse = require('fast-json-parse')
const cheerio = require('cheerio')
const provider = 'BL'
const DOMAIN = 'http://bilutv.com/'

const gotOptions = {
  headers: {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2977.0 Safari/537.36',
    'referer': DOMAIN
  },
  timeout: 10000,
  retries: 2
}

exports.search = (dork) => {
  const q = qs.escape(dork)
  return new Promise(resolve => {
    _search(q)
      .then(result => resolve(result))
      .catch(err => {
        console.log(err)
        resolve([])
      })
  })
}

const _search = (q) => {
  return got(`${DOMAIN}tim-kiem.html?q=${q}`)
    .then(response => cheerio.load(response.body))
    .then(
      $ => $('.list-film')
        .find('.film-item ')
        .map((idx, elem) => {
          const provider = 'BL'
          const id = $(elem).find('a').attr('href').replace('.html', '').split('-').slice(-1).pop()
          const url = $(elem).find('a').attr('href').replace('/phim/', 'xem-phim/phim-')
          const title = $(elem).find('a').attr('title')
          const thumb = $(elem).find('img').attr('data-original')
          return {
            provider,
            id,
            title,
            url,
            thumb
          }
        })
        .get()
    )
}

// /xem-phim/phim-gai-goi-berlin-3224.html
exports.findMedias = (url) => {
  // url = url.replace('.html', '')
  console.log(url)
  return got(`${DOMAIN}${url}`, gotOptions)
    .then(reponse => extractMedia(reponse.body))
    // .then(playerSetting => playerSetting.sources.map(video => ({
    .then(playerSetting =>{ 
      console.log(playerSetting.value)
      var setting = playerSetting.value.sources.map(video => ({
      provider,
      'id': playerSetting.value.modelId,
      'title': playerSetting.value.title,
      'thumb': playerSetting.value.poster,
      'url': decodeUrl(video.file, 'bilutv.com' + '4590481877' + playerSetting.value.modelId),
      'resolution': parseFloat(video.label),
      'label': video.label
      }))

      // console.log(setting)
      return {
        setting: setting,
        epsList: playerSetting.epsList
      }

  })
}

function extractMedia (body) {

  // haha
  var epsList = []
  var $ = cheerio.load(body)
  var ds = $(body).find('#list_episodes li a')
  ds.each(function (i, e){
    var url = e["attribs"]["href"].substr(18)
    var hash = new Buffer(
            aes.enc('BL' + '|' + url, process.env.SECRET)
          ).toString('base64')
          
    epsList.push({ text: $(this).text(), url: url, hash: hash  })
  })
  console.log(epsList)

  //haha
  const beginSlice = body.indexOf('var playerSetting = {') + 20
  const endSlice = body.indexOf('};') + 1
  const result = parse(
    body.slice(beginSlice, endSlice).trim()
  )
  if (result.err) {
    return {
      sources: []
    }
  }

  return {value: result.value, epsList: epsList}
  // return result.value
}

// decode url using the password
const decodeUrl = (url, password) => {
  return aes.dec(url, password)
}
