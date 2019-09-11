'use strict'

const { resolve, basename } = require('path')
const { readFileSync, writeFileSync } = require('fs')
const os = require('os')
const fs = require('fs')
const execa = require('execa')
const log = require('barelog')
const ssid = require('./ssid')
const nexus = require('./nexus')
const npmrc = require('./npmrc')
const notify = require('./notify')

const DAEMON_RUNNER_SCRIPT = resolve(__dirname, '../bin/npmrcd-daemon.js')

exports.remove = async function () {
  const platform = os.platform()

  if (platforms[platform]) {
    platforms[platform].remove()
  } else {
    throw new Error(`Daemon removal for platform ${platform} not implemented`)
  }
}

exports.setup = async function () {
  const platform = os.platform()

  if (platforms[platform]) {
    await platforms[platform].remove()
    await platforms[platform].setup()
  } else {
    throw new Error(`Daemon setup for platform ${platform} not implemented`)
  }
}

exports.run = async function () {
  log('checking network environment')

  const nexusIsAvailable = await nexus.isNexusAvailable()
  const onTriggerSSID = await ssid.isConnectdedToTriggerSSID()

  if (nexusIsAvailable || onTriggerSSID) {
    log(`switching to work profile. nexus accessible: ${nexusIsAvailable}. on trigger ssid: ${onTriggerSSID}`)
    const didChange = await npmrc.enableWorkProfile()

    if (didChange) {
      if (onTriggerSSID && nexusIsAvailable) {
        await notify({
          title: 'npmrcd',
          message: `Switched to "work" npmrc profile. Registry is accessible. WiFi SSID is "${onTriggerSSID}".`
        })
      } else if (onTriggerSSID && !nexusIsAvailable) {
        await notify({
          title: 'npmrcd',
          message: `Switched to "work" npmrc profile. Registry is currently not accessible. WiFi SSID is "${onTriggerSSID}".`
        })
      } else {
        await notify({
          title: 'npmrcd',
          message: 'Switched to "work" npmrc profile. Registry is accessible.'
        })
      }
    }
  } else {
    log('switching to default profile')
    const didChange = await npmrc.enableDefaultProfile()

    if (didChange) {
      await notify({
        title: 'npmrcd',
        message: 'Switched to "default" npmrc profile. Using public npm registry.'
      })
    }
  }
}

const platforms = {
  darwin: {
    location: resolve(os.homedir(), 'Library/LaunchAgents/com.npmrcd.plist'),
    setup: async () => {
      const tpl = readFileSync(
        resolve(__dirname, '../templates/', basename(platforms.darwin.location))
      )

      writeFileSync(
        platforms.darwin.location,
        tpl.toString()
          .replace('{{home}}', process.env.HOME)
          .replace('{{path}}', process.env.PATH)
          .replace('{{program}}', DAEMON_RUNNER_SCRIPT)
      )

      await execa('launchctl', ['load', '-w', platforms.darwin.location])
    },
    remove: async () => {
      if (fs.existsSync(platforms.darwin.location)) {
        await execa('launchctl', ['unload', '-w', platforms.darwin.location])
        fs.unlinkSync(platforms.darwin.location)
      }
    }
  }
}
