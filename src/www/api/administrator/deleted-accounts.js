const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let accountids
    if (req.query.all) {
      accountids = await dashboard.StorageList.listAll(`${req.appid}/deleted/accounts`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      accountids = await dashboard.StorageList.list(`${req.appid}/deleted/accounts`, offset, limit)
    }
    if (!accountids || !accountids.length) {
      return null
    }
    req.cacheData = await dashboard.Storage.readMany(`${req.appid}/account`, accountids)
    const accounts = []
    for (const accountid of accountids) {
      req.query.accountid = accountid
      const account = await global.api.administrator.Account.get(req)
      accounts.push(account)
    }
    return accounts
  }
}
