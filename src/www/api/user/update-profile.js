const dashboard = require('../../../../index.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.profileid) {
      throw new Error('invalid-profileid')
    }
    const profile = await global.api.user.Profile.get(req)
    if (!profile) {
      throw new Error('invalid-profileid')
    }
    req.body = req.body || {}
    const profileInfo = {}
    const profileFields = req.userProfileFields || global.userProfileFields
    const accountProperties = {}
    for (const field of profileFields) {
      const displayName = global.profileFieldMap[field]
      switch (field) {
        case 'full-name':
          if (!req.body['first-name'] || !req.body['first-name'].length) {
            throw new Error('invalid-first-name')
          }
          if (global.minimumProfileFirstNameLength > req.body['first-name'].length ||
            global.maximumProfileFirstNameLength < req.body['first-name'].length) {
            throw new Error('invalid-first-name-length')
          }
          if (!req.body['last-name'] || !req.body['last-name'].length) {
            throw new Error('invalid-last-name')
          }
          if (global.minimumProfileLastNameLength > req.body['last-name'].length ||
            global.maximumProfileLastNameLength < req.body['last-name'].length) {
            throw new Error('invalid-last-name-length')
          }
          profileInfo.firstName = accountProperties.firstName = req.body['first-name']
          profileInfo.lastName = accountProperties.lastName = req.body['last-name']
          continue
        case 'contact-email':
          if (!req.body[field] || req.body[field].indexOf('@') < 1) {
            throw new Error(`invalid-${field}`)
          }
          profileInfo.contactEmail = accountProperties.contactEmail = req.body[field]
          continue
        case 'display-email':
          if (!req.body[field] || req.body[field].indexOf('@') < 1) {
            throw new Error(`invalid-${field}`)
          }
          profileInfo.displayEmail = accountProperties.displayName = req.body[field]
          continue
        case 'display-name':
          if (!req.body[field] || !req.body[field].length) {
            throw new Error(`invalid-${field}`)
          }
          if (global.minimumProfileDisplayNameLength > req.body[field].length ||
            global.maximumProfileDisplayNameLength < req.body[field].length) {
            throw new Error('invalid-display-name-length')
          }
          profileInfo.displayName = accountProperties.displayName = req.body[field]
          continue
        case 'company-name':
          if (!req.body[field] || !req.body[field].length) {
            throw new Error(`invalid-${field}`)
          }
          if (global.minimumProfileCompanyNameLength > req.body[field].length ||
            global.maximumProfileCompanyNameLength < req.body[field].length) {
            throw new Error('invalid-company-name-length')
          }
          profileInfo.companyName = accountProperties.companyName = req.body[field]
          continue
        case 'dob':
          if (!req.body[field] || !req.body[field].length) {
            throw new Error(`invalid-${field}`)
          }
          try {
            const date = dashboard.Format.parseDate(req.body[field])
            if (!date || !date.getFullYear) {
              throw new Error(`invalid-${field}`)
            }
            profileInfo.dob = accountProperties.dob = dashboard.Format.date(date)
          } catch (error) {
            throw new Error(`invalid-${field}`)
          }
          continue
        default:
          if (!req.body[field]) {
            throw new Error(`invalid-${field}`)
          }
          profileInfo[displayName] = accountProperties[displayName] = req.body[field]
          continue
      }
    }
    const storage = req.storage || dashboard
    await storage.StorageObject.setProperties(`${req.appid}/profile/${req.query.profileid}`, profileInfo)
    if (req.query.profileid === req.account.profileid || req.body.default === 'true') {
      await storage.StorageObject.setProperties(`${req.appid}/account/${req.account.accountid}`, accountProperties)
    }
    for (const field in profileInfo) {
      profile[field] = profileInfo[field]
    }
    return profile
  }
}
