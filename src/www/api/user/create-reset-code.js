const dashboard = require('../../../../index.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    if (!req.body || !req.body['secret-code']) {
      throw new Error('invalid-secret-code')
    }
    if (global.minimumResetCodeLength > req.body['secret-code'].length ||
      global.maximumResetCodeLength < req.body['secret-code'].length) {
      throw new Error('invalid-secret-code-length')
    }
    let dashboardEncryptionKey = global.dashboardEncryptionKey
    if (req.server) {
      dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
    }
    const secretCodeHash = await dashboard.Hash.sha512Hash(req.body['secret-code'], dashboardEncryptionKey)
    const codeid = `code_${await dashboard.UUID.generateID()}`
    const resetCodeInfo = {
      object: 'resetCode',
      accountid: req.query.accountid,
      codeid,
      secretCodeHash,
      created: dashboard.Timestamp.now
    }
    await dashboard.Storage.write(`${req.appid}/resetCode/${codeid}`, resetCodeInfo)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.account.accountid}`, 'resetCodeLastCreated', dashboard.Timestamp.now)
    await dashboard.StorageList.addMany({
      [`${req.appid}/resetCodes`]: codeid,
      [`${req.appid}/account/resetCodes/${req.query.accountid}`]: codeid
    })
    await dashboard.Storage.write(`${req.appid}/map/account/resetCodes/${req.query.accountid}/${secretCodeHash}`, codeid)
    return resetCodeInfo
  }
}
