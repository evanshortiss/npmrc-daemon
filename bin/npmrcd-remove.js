#!/usr/bin/env node

'use strict'

const log = require('barelog').withoutTimestamps
const daemon = require('../lib/daemon')

;(async function main () {
  log('Removing npmrc daemon.')
  await daemon.remove()
  log('Successfully removed. Your .npmrc configs are available in ~/.npmrcs')
})()
