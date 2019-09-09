#!/usr/bin/env node

const log = require('barelog')
const daemon = require('../lib/daemon')

/**
 * This is the script run by the daemon to determine which profile
 * should be enabled
 */
;(async function main () {
  log(`Running the npmrc daemon with PID ${process.pid}`)

  try {
    await daemon.run()
    log('daemon run completed successfully')
    process.exit(0)
  } catch (e) {
    log('error running daemon:', e)
    process.exit(1)
  }
})()
