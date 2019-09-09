const fs = require('fs')
const log = require('barelog').withoutTimestamps
const rimraf = require('rimraf').sync
const { homedir } = require('os')
const { resolve } = require('path')

const CONFIG_FOLDER_LOCATION = resolve(homedir(), '.npmrc-daemon')
const NPMRCS_FOLDER_LOCATION = resolve(homedir(), '.npmrcs')
const CONFIG_FILE_LOCATION = resolve(CONFIG_FOLDER_LOCATION, 'config.json')

function createConfigIfNotPresent () {
  const exists = fs.existsSync(CONFIG_FOLDER_LOCATION)

  if (!exists) {
    fs.mkdirSync(CONFIG_FOLDER_LOCATION)
    fs.writeFileSync(
      CONFIG_FILE_LOCATION,
      JSON.stringify(generateConfigFileJson(), null, 2)
    )
  }
}

function generateConfigFileJson (registry = null, cafile = null, triggerSSIDs = []) {
  return {
    worksSettings: {
      cafile,
      registry,
      triggerSSIDs
    }
  }
}

exports.initialise = (force = false) => {
  const exists = fs.existsSync(CONFIG_FOLDER_LOCATION)
  const originalNpmrcPath = resolve(homedir(), '.npmrc')
  const backupNpmrcPath = resolve(homedir(), '.npmrc.backup')

  // Backup the old profile just in case
  if (fs.existsSync(originalNpmrcPath)) {
    log(`Backing up ${originalNpmrcPath} to ${backupNpmrcPath}`)
    fs.copyFileSync(
      originalNpmrcPath,
      backupNpmrcPath
    )
  }

  if (exists && force) {
    rimraf(CONFIG_FOLDER_LOCATION)
    rimraf(NPMRCS_FOLDER_LOCATION)
    createConfigIfNotPresent()
  } else if (!exists) {
    createConfigIfNotPresent()
  } else {
    log('An existing .npmrcd config exists. Run this command with "--force" to overwrite it.')
    process.exit(1)
  }
}

exports.getConfigDirectory = () => CONFIG_FOLDER_LOCATION

exports.getWorkSettings = () => {
  createConfigIfNotPresent()
  return JSON.parse(fs.readFileSync(CONFIG_FILE_LOCATION)).worksSettings
}

/**
 * Sets the work registry settings in the ~/.npmrcd config
 * @param {String} registry
 * @param {String} cafile
 * @param {String[]} triggerSSIDs
 */
exports.setWorkSettings = (registry, cafile, triggerSSIDs) => {
  createConfigIfNotPresent()

  fs.writeFileSync(
    resolve(CONFIG_FILE_LOCATION),
    JSON.stringify(
      generateConfigFileJson(registry, cafile, triggerSSIDs),
      null,
      2
    )
  )
}
