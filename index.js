let defaultSessionKey
if (process.env.NODE_ENV !== 'production') {
  defaultSessionKey = 'dashboard-session-key'
}
global.host = process.env.HOST || 'localhost'
global.port = parseInt(process.env.PORT || '8000', 10)
if (process.env.DASHBOARD_SERVER) {
  global.dashboardServer = process.env.DASHBOARD_SERVER
} else {
  const protocol = global.port === 443 ? 'https' : 'http'
  global.dashboardServer = `${protocol}://${global.host}:${global.port}`
}
global.applicationServer = process.env.APPLICATION_SERVER
global.applicationServerToken = process.env.APPLICATION_SERVER_TOKEN
if (global.applicationServer && !global.applicationServerToken) {
  throw new Error('Invalid APPLICATION_SERVER_TOKEN')
}
global.dashboardSessionKey = process.env.DASHBOARD_SESSION_KEY || defaultSessionKey
global.bcryptWorkloadFactor = parseInt(process.env.BCRYPT_WORKLOAD_FACTOR || '10', 10)
if (!global.dashboardSessionKey) {
  throw new Error('Invalid DASHBOARD_SESSION_KEY')
}
if (process.env.ENCRYPTION_SECRET &&
  process.env.ENCRYPTION_SECRET.length !== 32) {
  throw new Error('Invalid ENCRYPTION_SECRET length (32)')
}
if (process.env.ENCRYPTION_SECRET &&
   (!process.env.ENCRYPTION_SECRET_IV ||
  process.env.ENCRYPTION_SECRET_IV.length !== 16)) {
  throw new Error('Invalid ENCRYPTION_SECRET_IV length (16)')
}
if (process.env.ENCRYPTION_SECRET) {
  global.encryptionSecret = process.env.ENCRYPTION_SECRET
  global.encryptionSecretIV = process.env.ENCRYPTION_SECRET_IV
}
global.disableRegistration = process.env.DISABLE_REGISTRATION === 'true'
global.requireProfile = process.env.REQUIRE_PROFILE === 'true'
global.profileFields = ['display-name', 'display-email', 'contact-email', 'full-name', 'dob', 'phone', 'occupation', 'location', 'company-name', 'website']
global.profileFieldMap = {}
for (const field of global.profileFields) {
  if (field === 'full-name') {
    global.profileFieldMap['first-name'] = 'firstName'
    global.profileFieldMap['last-name'] = 'lastName'
    continue
  }
  let displayName = field
  if (displayName.indexOf('-') > -1) {
    displayName = displayName.split('-')
    if (displayName.length === 1) {
      displayName = displayName[0]
    } else if (displayName.length === 2) {
      displayName = displayName[0] + displayName[1].substring(0, 1).toUpperCase() + displayName[1].substring(1)
    } else if (displayName.length === 3) {
      displayName = displayName[0] + displayName[1].substring(0, 1).toUpperCase() + displayName[1].substring(1) + displayName[2].substring(0, 1).toUpperCase() + displayName[2].substring(1)
    }
  }
  global.profileFieldMap[field] = displayName
}

if (!process.env.USER_PROFILE_FIELDS) {
  global.userProfileFields = [
    'contact-email',
    'full-name'
  ]
} else {
  global.userProfileFields = process.env.USER_PROFILE_FIELDS.split(',')
}
global.appid = process.env.APPID || process.env.DOMAIN || 'dashboard'
global.allowPublicAPI = process.env.ALLOW_PUBLIC_API === 'true'
global.domain = process.env.DOMAIN || ''
global.idLength = parseInt(process.env.ID_LENGTH || '8', 10)
global.minimumUsernameLength = parseInt(process.env.MINIMUM_USERNAME_LENGTH || '1', 6)
global.maximumUsernameLength = parseInt(process.env.MAXIMUM_USERNAME_LENGTH || '50', 10)
global.minimumPasswordLength = parseInt(process.env.MINIMUM_PASSWORD_LENGTH || '1', 6)
global.maximumPasswordLength = parseInt(process.env.MAXIMUM_PASSWORD_LENGTH || '50', 10)
global.minimumResetCodeLength = parseInt(process.env.MINIMUM_RESET_CODE_LENGTH || '10', 6)
global.maximumResetCodeLength = parseInt(process.env.MAXIMUM_RESET_CODE_LENGTH || '50', 10)
global.minimumProfileFirstNameLength = parseInt(process.env.MINIMUM_PROFILE_FIRST_NAME_LENGTH || '1', 10)
global.maximumProfileFirstNameLength = parseInt(process.env.MAXIMUM_PROFILE_FIRST_NAME_LENGTH || '50', 10)
global.minimumProfileLastNameLength = parseInt(process.env.MINIMUM_PROFILE_LAST_NAME_LENGTH || '1', 10)
global.maximumProfileLastNameLength = parseInt(process.env.MAXIMUM_PROFILE_LAST_NAME_LENGTH || '50', 10)
global.minimumProfileDisplayNameLength = parseInt(process.env.MINIMUM_PROFILE_DISPLAY_NAME_LENGTH || '1', 1)
global.maximumProfileDisplayNameLength = parseInt(process.env.MAXIMUM_PROFILE_DISPLAY_NAME_LENGTH || '50', 10)
global.minimumProfileCompanyNameLength = parseInt(process.env.MINIMUM_PROFILE_COMPANY_NAME_LENGTH || '1', 1)
global.maximumProfileCompanyNameLength = parseInt(process.env.MAXIMUM_PROFILE_COMPANY_NAME_LENGTH || '50', 10)
global.deleteDelay = parseInt(process.env.DELETE_DELAY || '7', 10)
global.pageSize = parseInt(process.env.PAGE_SIZE || '10', 10)
global.sessionVerificationDelay = parseInt(process.env.SESSION_VERIFICATION_DELAY || '14400', 10)

let Server

const dashboard = module.exports = {
  Format: require('./src/format.js'),
  Hash: require('./src/hash.js'),
  HTML: require('./src/html.js'),
  Response: require('./src/response.js'),
  Timestamp: require('./src/timestamp.js'),
  UUID: require('./src/uuid.js'),
  start: async (applicationPath) => {
    const API = require('./src/api.js')
    const PackageJSON = require('./src/package-json.js')
    const Sitemap = require('./src/sitemap.js')
    const documentation = require('./documentation.js')
    global.applicationPath = global.applicationPath || applicationPath
    global.packageJSON = PackageJSON.merge()
    global.sitemap = Sitemap.generate()
    global.api = API.generate()
    if (process.env.GENERATE_SITEMAP_TXT !== 'false') {
      documentation.writeSitemap()
    }
    if (process.env.GENERATE_API_TXT !== 'false') {
      documentation.writeAPI()
    }
    if (process.env.GENERATE_ENV_TXT !== 'false') {
      documentation.writeEnvironment()
    }
    if (!dashboard.Storage) {
      await dashboard.setup()
    }
    Server = require('./src/server.js')
    await Server.start()
    if (process.env.EXIT_ON_START) {
      dashboard.stop()
      return process.exit(0)
    }
  },
  stop: () => {
    if (!Server) {
      return
    }
    const Timestamp = require('./src/timestamp.js')
    clearInterval(Timestamp.interval)
    delete (Timestamp.interval)
    return Server.stop()
  },
  setup: async () => {
    const Log = require('./src/log.js')('dashboard')
    Log.info('setting up storage')
    const Storage = require('./src/storage.js')
    const storage = await Storage.setup()
    const StorageList = require('./src/storage-list.js')
    const storageList = await StorageList.setup(storage)
    const StorageObject = require('./src/storage-object.js')
    const storageObject = await StorageObject.setup(storage)
    module.exports.Storage = storage
    module.exports.StorageList = storageList
    module.exports.StorageObject = storageObject
    Log.info('setting up module storage')
    if (global.packageJSON.dashboard.modules && global.packageJSON.dashboard.modules.length) {
      for (const addition of global.packageJSON.dashboard.modules) {
        Log.info('setting up module', addition)
        if (addition.setup) {
          try {
            await addition.setup()
          } catch (error) {
            Log.error(error)
          }
        }
      }
    }
    Log.info('finished setting up')
  }
}
