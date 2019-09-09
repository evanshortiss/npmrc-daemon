'use strict'

const os = require('os')
const execa = require('execa')
const config = require('./config')

const getWirelessSSID = exports.getWirelessSSID = function () {
  const platform = os.platform()

  switch (platform) {
    case 'darwin':
      return osxGetNetworkSSID()
    default:
      throw new Error(`SSID lookup for platform ${platform} not implemented`)
  }
}

function osxGetNetworkSSID () {
  return execa('networksetup', ['-getairportnetwork', 'en0'])
    // Split "Current Wi-Fi Network: mynetwork" and return "mynetwork"
    .then(result => result.stdout.toString().split(': ')[1])
}

exports.isConnectdedToTriggerSSID = async () => {
  const ssid = await getWirelessSSID()
  const { triggerSSIDs } = config.getWorkSettings()

  return triggerSSIDs.find(t => t.toLowerCase() === ssid.toLowerCase())
}
