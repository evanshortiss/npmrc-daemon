'use strict'

const notifier = require('node-notifier')
const delay = require('delay')
const log = require('barelog')

module.exports = async ({ title, message }) => {
  log(`showing notification with title ${title}, and message "${message}"`)

  notifier.notify({
    wait: true,
    sound: 'Glass',
    title,
    message
  })

  // This is hack required to ensure the notificaton is displayed. Yuck
  await delay(5000)
}
