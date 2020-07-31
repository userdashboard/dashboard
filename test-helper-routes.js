const dashboard = require('./index.js')

module.exports = {
  requireVerification: {
    api: {
      patch: async (req) => {
        if (process.env.NODE_ENV !== 'testing') {
          throw new Error('invalid-route')
        }
        if (!req.query || !req.query.sessionid) {
          throw new Error('invalid-sessionid')
        }
        if (req.query.sessionid !== req.session.sessionid) {
          throw new Error('invalid-session')
        }
        const twentyFourHours = 24 * 60 * 60 * 1000
        await dashboard.StorageObject.setProperty(`${req.appid}/session/${req.session.sessionid}`, 'created', req.session.created - twentyFourHours)
        await dashboard.StorageObject.removeProperty(`${req.appid}/session/${req.session.sessionid}`, 'lastVerified')
      }
    }
  }
}
