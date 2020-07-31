const dashboard = require('../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.profileid) {
      throw new Error('invalid-profileid')
    }
    const storage = req.storage || dashboard
    let profile
    if (req.cacheData && req.cacheData[req.query.profileid]) {
      profile = req.cacheData[req.query.profileid]
    } else {
      profile = await storage.Storage.read(`${req.appid}/profile/${req.query.profileid}`)
    }
    if (!profile) {
      throw new Error('invalid-profileid')
    }
    try {
      profile = JSON.parse(profile)
    } catch (error) {
    }
    if (!profile || profile.object !== 'profile') {
      throw new Error('invalid-profileid')
    }
    if (profile.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    return profile
  }
}
