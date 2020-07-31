const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    return dashboard.StorageList.count(`${req.appid}/administrator/accounts`)
  }
}
