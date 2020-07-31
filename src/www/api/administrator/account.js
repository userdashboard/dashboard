const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    let account
    if (req.cacheData && req.cacheData[req.query.accountid]) {
      account = req.cacheData[req.query.accountid]
    } else {
      account = await dashboard.Storage.read(`${req.appid}/account/${req.query.accountid}`)
    }
    if (!account) {
      throw new Error('invalid-accountid')
    }
    try {
      account = JSON.parse(account)
    } catch (error) {
    }
    if (!account || account.object !== 'account') {
      throw new Error('invalid-accountid')
    }
    delete (account.sessionKey)
    delete (account.usernameHash)
    delete (account.passwordHash)
    return account
  }
}
