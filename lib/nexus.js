'use strict'

const { lookup } = require('dns')
const { getWorkSettings } = require('./config')

exports.isNexusAvailable = async function () {
  return new Promise((resolve, reject) => {
    lookup(new URL(getWorkSettings().registry).hostname, (err) => {
      if (err && err.code === 'ENOTFOUND') {
        // ENOTFOUND means the DNS lookup was performed, but the hostname
        // could not be resolved so we're probably not on a work network
        resolve(false)
      } else if (err) {
        // Probably some other connectivity issue
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}
