'use strict'

const { lookup } = require('dns')
const { getWorkSettings } = require('./config')
const log = require('barelog')

exports.isNexusAvailable = async function () {
  return new Promise((resolve, reject) => {
    const regUrl = getWorkSettings().registry
    log(`performing dns lookup for ${regUrl}`)

    lookup(new URL(regUrl).hostname, (err) => {
      if (err && err.code === 'ENOTFOUND') {
        // ENOTFOUND means the DNS lookup was performed, but the hostname
        // could not be resolved so we're probably not on a work network
        log(`failed to resolve ${regUrl}`)
        resolve(false)
      } else if (err) {
        log(`error resolving ${regUrl}`)
        // Probably some other connectivity issue
        reject(err)
      } else {
        log(`succesfully resolved ${regUrl}`)
        resolve(true)
      }
    })
  })
}
