const dashboard = require('../../../../index.js')

module.exports = {
  auth: false,
  post: async (req) => {
    if (!req || !req.body) {
      throw new Error('invalid-username')
    }
    if (!req.body.username || !req.body.username.length) {
      throw new Error('invalid-username')
    }
    if (!req.body.password || !req.body.password.length) {
      throw new Error('invalid-password')
    }
    if (global.minimumUsernameLength > req.body.username.length ||
        global.maximumUsernameLength < req.body.username.length) {
      throw new Error('invalid-username-length')
    }
    if (global.minimumPasswordLength > req.body.password.length ||
        global.maximumPasswordLength < req.body.password.length) {
      throw new Error('invalid-password-length')
    }
    if (global.requireProfile) {
      const profileFields = req.userProfileFields || global.userProfileFields
      for (const field of profileFields) {
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
            continue
          case 'contact-email':
            if (!req.body[field] || req.body[field].indexOf('@') < 1) {
              throw new Error(`invalid-${field}`)
            }
            continue
          case 'display-email':
            if (!req.body[field] || req.body[field].indexOf('@') < 1) {
              throw new Error(`invalid-${field}`)
            }
            continue
          case 'display-name':
            if (!req.body[field] || !req.body[field].length) {
              throw new Error(`invalid-${field}`)
            }
            if (global.minimumProfileDisplayNameLength > req.body[field].length ||
              global.maximumProfileDisplayNameLength < req.body[field].length) {
              throw new Error('invalid-display-name-length')
            }
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
            } catch (error) {
              throw new Error(`invalid-${field}`)
            }
            continue
          default:
            if (!req.body || !req.body[field]) {
              throw new Error(`invalid-${field}`)
            }
            continue
        }
      }
    }
    const accountid = `account_${await dashboard.UUID.generateID()}`
    let dashboardEncryptionKey = global.dashboardEncryptionKey
    if (req.server) {
      dashboardEncryptionKey = req.server.dashboardEncryptionKey || dashboardEncryptionKey
    }
    const usernameHash = await dashboard.Hash.sha512Hash(req.body.username, dashboardEncryptionKey)
    const passwordHash = await dashboard.Hash.bcryptHashHash(req.body.password, dashboardEncryptionKey)
    const accountInfo = {
      object: 'account',
      accountid: accountid,
      usernameHash: usernameHash,
      passwordHash: passwordHash,
      sessionKey: dashboard.UUID.random(64),
      sessionKeyNumber: 1,
      created: dashboard.Timestamp.now
    }
    const otherUsersExist = await dashboard.StorageList.list(`${req.appid}/accounts`, 0, 1)
    if (!otherUsersExist) {
      accountInfo.administrator = dashboard.Timestamp.now
      accountInfo.owner = dashboard.Timestamp.now
    }
    await dashboard.Storage.write(`${req.appid}/map/usernames/${usernameHash}`, accountid)
    await dashboard.Storage.write(`${req.appid}/account/${accountid}`, accountInfo)
    const indexing = {
      [`${req.appid}/accounts`]: accountid
    }
    if (!otherUsersExist) {
      indexing[`${req.appid}/administrator/accounts`] = accountid
    }
    await dashboard.StorageList.addMany(indexing)
    req.query = req.query || {}
    req.query.accountid = accountid
    req.body.default = 'true'
    req.account = accountInfo
    if (global.requireProfile) {
      const profile = await global.api.user.CreateProfile.post(req)
      for (const x in profile) {
        accountInfo[x] = accountInfo[x] || profile[x]
      }
    }
    return accountInfo
  }
}
