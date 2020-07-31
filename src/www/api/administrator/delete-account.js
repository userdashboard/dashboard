const dashboard = require('../../../../index.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.administrator.Account.get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    await dashboard.Storage.delete(`${req.appid}/account/${req.query.accountid}`)
    await dashboard.StorageList.remove(`${req.appid}/accounts`, req.query.accountid)
    if (account.administrator) {
      await dashboard.StorageList.remove(`${req.appid}/administrator/accounts`, req.query.accountid)
    }
    if (account.deleted) {
      await dashboard.StorageList.remove(`${req.appid}/deleted/accounts`, req.query.accountid)
    }
    return true
  }
}
