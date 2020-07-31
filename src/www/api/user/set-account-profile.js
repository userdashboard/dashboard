const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-accountid')
    }
    if (!req.body || !req.body.profileid) {
      throw new Error('invalid-profileid')
    }
    req.query.profileid = req.body.profileid
    const profile = await global.api.user.Profile.get(req)
    if (!profile) {
      throw new Error('invalid-profileid')
    }
    const profileFields = req.userProfileFields || global.userProfileFields
    const accountProperties = {
      profileid: req.query.profileid
    }
    for (const field of profileFields) {
      const displayName = global.profileFieldMap[field]
      switch (field) {
        case 'full-name':
          accountProperties.firstName = req.body['first-name']
          accountProperties.lastName = req.body['last-name']
          continue
        case 'contact-email':
          accountProperties.contactEmail = req.body[field]
          continue
        case 'display-email':
          accountProperties.displayName = req.body[field]
          continue
        case 'display-name':
          accountProperties.displayName = req.body[field]
          continue
        case 'company-name':
          accountProperties.companyName = req.body[field]
          continue
        case 'dob':
          accountProperties.dob = dashboard.Format.date(req.body.dob)
          continue
        default:
          accountProperties[displayName] = req.body[field]
          continue
      }
    }
    await dashboard.StorageObject.setProperties(`${req.appid}/account/${req.query.accountid}`, accountProperties)
    return global.api.user.Account.get(req)
  }
}
