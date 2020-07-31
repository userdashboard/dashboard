const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    let index
    if (req.query && req.query.accountid) {
      index = `${req.appid}/account/sessions/${req.query.accountid}`
    } else {
      index = `${req.appid}/sessions`
    }
    return dashboard.StorageList.count(index)
  }
}
