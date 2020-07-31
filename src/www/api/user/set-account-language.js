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
    if (!req.body || !req.body.language) {
      throw new Error('invalid-language')
    }
    for (const language of global.languages) {
      if (language.code === req.body.language) {
        await dashboard.StorageObject.setProperty(`${req.appid}/account/${req.query.accountid}`, 'language', req.body.language)
        req.account.language = req.body.language
        return req.account
      }
    }
    throw new Error('invalid-language')
  }
}
