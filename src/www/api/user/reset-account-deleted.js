const dashboard = require('../../../../index.js')

module.exports = {
  auth: false,
  patch: async (req) => {
    if (!req.body) {
      throw new Error('invalid-username')
    }
    if (!req.body.username) {
      throw new Error('invalid-username')
    }
    if (!req.body.username || !req.body.username.length) {
      throw new Error('invalid-username')
    }
    if (global.minimumUsernameLength > req.body.username.length) {
      throw new Error('invalid-username-length')
    }
    if (!req.body.password || !req.body.password.length) {
      throw new Error('invalid-password')
    }
    if (global.minimumPasswordLength > req.body.password.length) {
      throw new Error('invalid-password-length')
    }
    let dashboardEncryptionKey = global.dashboardEncryptionKey
    if (req.server) {
      dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
    }
    const usernameHash = await dashboard.Hash.sha512Hash(req.body.username, dashboardEncryptionKey)
    const accountid = await dashboard.Storage.read(`${req.appid}/map/usernames/${usernameHash}`)
    if (!accountid) {
      throw new Error('invalid-username')
    }
    const passwordHash = await dashboard.StorageObject.getProperty(`${req.appid}/account/${accountid}`, 'passwordHash')
    const validPassword = await dashboard.Hash.bcryptHashCompare(req.body.password, passwordHash, dashboardEncryptionKey)
    if (!validPassword) {
      throw new Error('invalid-password')
    }
    const query = req.query
    req.query = { accountid }
    const account = await global.api.administrator.Account.get(req)
    if (!account) {
      throw new Error('invalid-account')
    }
    if (!account.deleted) {
      throw new Error('invalid-account')
    }
    if (account.deleted < dashboard.Timestamp.now) {
      throw new Error('invalid-account')
    }
    await dashboard.StorageObject.removeProperty(`${req.appid}/account/${account.accountid}`, 'deleted')
    await dashboard.StorageList.remove(`${req.appid}/deleted/accounts`, account.accountid)
    req.account = account
    const accountNow = await global.api.user.Account.get(req)
    req.query = query
    return accountNow
  }
}
