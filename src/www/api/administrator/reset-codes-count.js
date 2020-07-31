const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    let index
    if (req.query && req.query.accountid) {
      index = `${req.appid}/account/resetCodes/${req.query.accountid}`
    } else {
      index = `${req.appid}/resetCodes`
    }
    return dashboard.StorageList.count(index)
  }
}
