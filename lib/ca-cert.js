'use strict'

const log = require('barelog').withoutTimestamps
const expandTilde = require('expand-tilde')
const { request } = require('https')
const { resolve, basename } = require('path')
const { createWriteStream, copyFileSync } = require('fs')
const { getConfigDirectory } = require('./config')

const generateCaFilepath = exports.generateCaFilepath = (caFile) => {
  // e.g "https://cert.acme.com/cert.crt" => "~/.npmrc-daemon/cert.crt"
  return resolve(
    getConfigDirectory(),
    basename(caFile)
  )
}

function isHttpEndpoint (cafile) {
  return cafile.indexOf('http') === 0
}

function downloadCaFile (cafile) {
  const filepath = generateCaFilepath(cafile)

  return new Promise((resolve, reject) => {
    const url = new URL(cafile)

    const req = request(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} - failed to fetch Root CA`))
      } else {
        res.pipe(createWriteStream(filepath))
        res.on('end', () => {
          log('Finished downloading Root CA')
          resolve(filepath)
        })
      }
    })

    req.on('error', (e) => reject(e.toString()))
    req.end()
  })
}

exports.setup = async (cafile) => {
  const filepath = generateCaFilepath(cafile)

  if (isHttpEndpoint(cafile)) {
    await downloadCaFile(cafile)
  } else {
    copyFileSync(expandTilde(cafile), filepath)
  }

  return filepath
}
