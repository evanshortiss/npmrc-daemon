'use strict'

const log = require('barelog').withoutTimestamps
const execa = require('execa')
const { resolve } = require('path')

const NPMRC_BIN_PATH = resolve(__dirname, '../node_modules/.bin/npmrc')

exports.enableWorkProfile = async () => {
  const { stdout } = await execa(NPMRC_BIN_PATH, ['work'])

  return stdout.indexOf('is already') === -1
}

exports.enableDefaultProfile = async () => {
  const { stdout } = await execa(NPMRC_BIN_PATH, ['default'])

  return stdout.indexOf('is already') === -1
}

exports.setupProfiles = async (registryUrl, caFilepath) => {
  // Remove existing preferences for default - i.e use regular npmjs.org
  log('Creating "default" npmrc profile that uses the default npmjs.org registry')
  await execa(NPMRC_BIN_PATH, ['default'])
  await execa('npm', ['config', 'delete', 'registry'])
  await execa('npm', ['config', 'delete', 'cafile'])

  // Create a work profile and configure with work registry
  log(`Creating "work" npmrc profile that uses registry at ${registryUrl}`)
  await execa(NPMRC_BIN_PATH, ['-c', 'work'])
  await execa('npm', ['config', 'set', 'registry', registryUrl])
  if (caFilepath) {
    await execa('npm', ['config', 'set', 'cafile', caFilepath])
  }
}
