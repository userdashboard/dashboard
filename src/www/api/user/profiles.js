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
    let profileids
    if (req.query.all) {
      profileids = await storage.StorageList.listAll(`${req.appid}/account/profiles/${req.query.accountid}`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      profileids = await storage.StorageList.list(`${req.appid}/account/profiles/${req.query.accountid}`, offset, limit)
    }
    if (!profileids || !profileids.length) {
      return null
    }
    req.cacheData = await storage.Storage.readMany(`${req.appid}/profile`, profileids)
    const profiles = []
    for (const profileid of profileids) {
      req.query.profileid = profileid
      const profile = await global.api.user.Profile.get(req)
      profiles.push(profile)
    }
    return profiles
  }
}
