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
    let codeids
    if (req.query.all) {
      codeids = await dashboard.StorageList.listAll(`${req.appid}/account/resetCodes/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      codeids = await dashboard.StorageList.list(`${req.appid}/account/resetCodes/${req.query.accountid}`, offset, limit)
    }
    if (!codeids || !codeids.length) {
      return null
    }
    req.cacheData = await dashboard.Storage.readMany(`${req.appid}/resetCode`, codeids)
    const resetCodes = []
    for (const codeid of codeids) {
      req.query.codeid = codeid
      const resetCode = await global.api.user.ResetCode.get(req)
      resetCodes.push(resetCode)
    }
    return resetCodes
  }
}
