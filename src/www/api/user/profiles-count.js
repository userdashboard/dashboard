const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    const storage = req.storage || dashboard
    return storage.StorageList.count(`${req.appid}/account/profiles/${req.query.accountid}`)
  }
}
