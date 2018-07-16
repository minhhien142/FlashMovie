'use strict'

const aes = require('../aes')
const video = require('../video')
const escapeHtml = require('escape-html')

exports.index = (req, res, next) => {
  res.render('home.html', {videos: []})
}

exports.handleSearchVideos = (req, res, next) => {
  if (!req.query.q) { return res.render('home.html') }
  let q = escapeHtml(req.query.q)
  video
    .search(req.query.q)
    .then(videos => {
      return res.render('search.html', {
        q: q,
        videos: videos.map(video => {
        video.url = video.url.replace('.html', '')

          video.hash = new Buffer(
            aes.enc(video.provider + '|' + video.url, process.env.SECRET)
          ).toString('base64')
          // console.log(video)
          return video
        })
      })
    })
    .catch(function (err) {
      console.log(err)
      res.render('search.html', {
        q,
        videos: []
      })
    })
}

exports.watch = (req, res, next) => {
  if (!req.query.id) { return res.end('invalid id') }
  let id = []
  try {
    id = aes.dec(
      new Buffer(req.query.id, 'base64').toString('ascii'),
      process.env.SECRET
      // console.log(id)
    )
  } catch (err) {
    console.log(err)
    return res.end('ID không hợp lệ')
  }

  const [provider, url] = id.split('|')
  console.log('___________________________________')
  console.log(url)
  video
    .findMedias({provider, url})
    .then(medias => {
      return res.render('watch.html', {
        medias: medias.setting,
        video: medias.setting[0],
        epsList: medias.epsList
      })
    })
    .catch(console.log)
}

exports.changelog = (req, res, next) => {
  res.render('changelog.html')
}

exports.watchdemo = (req, res, next) =>{
  res.render('watchdemo.html');
}
