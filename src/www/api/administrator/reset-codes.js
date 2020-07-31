const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let index
    if (req.query.accountid) {
      index = `${req.appid}/account/resetCodes/${req.query.accountid}`
    } else {
      index = `${req.appid}/resetCodes`
    }
    let codeids
    if (req.query.all) {
      codeids = await dashboard.StorageList.listAll(index)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      codeids = await dashboard.StorageList.list(index, offset, limit)
    }
    if (!codeids || !codeids.length) {
      return null
    }
    req.cacheData = await dashboard.Storage.readMany(`${req.appid}/resetCode`, codeids)
    const resetCodes = []
    for (const codeid of codeids) {
      req.query.codeid = codeid
      const resetCode = await global.api.administrator.ResetCode.get(req)
      resetCodes.push(resetCode)
    }
    return resetCodes
  }
}
