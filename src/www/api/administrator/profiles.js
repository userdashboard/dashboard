const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let index
    if (req.query.accountid) {
      index = `${req.appid}/account/profiles/${req.query.accountid}`
    } else {
      index = `${req.appid}/profiles`
    }
    const storage = req.storage || dashboard
    let profileids
    if (req.query.all) {
      profileids = await storage.StorageList.listAll(index)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      profileids = await storage.StorageList.list(index, offset, limit)
    }
    if (!profileids || !profileids.length) {
      return null
    }
    req.cacheData = await storage.Storage.readMany(`${req.appid}/profile`, profileids)
    const profiles = []
    for (const profileid of profileids) {
      req.query.profileid = profileid
      const profile = await global.api.administrator.Profile.get(req)
      profiles.push(profile)
    }
    return profiles
  }
}
