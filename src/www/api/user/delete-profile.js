const dashboard = require('../../../../index.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.profileid) {
      throw new Error('invalid-profileid')
    }
    if (req.query.profileid === req.account.profileid) {
      throw new Error('invalid-profile')
    }
    const profile = await global.api.user.Profile.get(req)
    if (!profile) {
      throw new Error('invalid-profileid')
    }
    await dashboard.Storage.delete(`${req.appid}/profile/${req.query.profileid}`)
    await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.account.accountid}`, 'profileLastDeleted', dashboard.Timestamp.now)
    await dashboard.StorageList.remove(`${req.appid}/profiles`, req.query.profileid)
    await dashboard.StorageList.remove(`${req.appid}/account/profiles/${req.account.accountid}`, req.query.profileid)
    return true
  }
}
