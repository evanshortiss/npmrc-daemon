#!/usr/bin/env node

'use strict'

const log = require('barelog').withoutTimestamps
const yargs = require('yargs')
const cert = require('../lib/ca-cert')
const npmrc = require('../lib/npmrc')
const config = require('../lib/config')
const daemon = require('../lib/daemon')

yargs.help(
  true,
  'npmrcd \n' +
  '\n' +
  '  Automatically switch between npm registries based on availability.\n\n' +
  '\n' +
  'Example:\n\n' +
  '  # Create a "work" and "default" profile, then setup the daemon\n' +
  '  # Also, configure the daemon to switch if on "Acme Guest" WiFi\n' +
  '  # SSID. Multiple "triggerssid" flags are supported :\n' +
  '  $ npmrcd setup --registry $URL --cafile $PATH --triggerssid "Acme Guest" \n\n' +
  '  # Remove the daemon (doesn\'t remove .npmrc files) \n' +
  '  $ npmrcd remove'
)

const argv = yargs.argv

if (!argv.registry) {
  log('\nPlease supply a --registry parameter for your registry URL\n')
  process.exit(1)
}

;(async function main () {
  // (Re)initialise the ~/.npmrcd directory
  config.initialise(argv.force)

  // The CA file is optional, so copy/download it if necessary
  let caFilepath = null
  if (argv.cafile) {
    try {
      caFilepath = await cert.setup(argv.cafile)
    } catch (e) {
      log(`Failed to download/copy the CA from ${argv.cafile} to ${cert.generateCaFilepath(argv.cafile)}`)
      log(e)
      process.exit(1)
    }
  }

  log(`Writing settings to ${config.getConfigDirectory()}`)
  config.setWorkSettings(
    argv.registry,
    caFilepath,
    formatTriggerSSIDs(argv.triggerssid)
  )

  await npmrc.setupProfiles(argv.registry, caFilepath)
  await npmrc.enableDefaultProfile()
  await daemon.setup()
})()

/**
 * Even if a single trigger ssid is given we need to pass an array to config
 * @param {String|String[]|undefined} triggers
 */
function formatTriggerSSIDs (triggers = []) {
  if (Array.isArray(triggers)) {
    return triggers
  } else {
    return [triggers]
  }
}
