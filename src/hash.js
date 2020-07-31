const bcrypt = require('./bcrypt.js')
const crypto = require('crypto')
const util = require('util')

module.exports = {
  sha512Hash,
  sha512HashCompare,
  bcryptHashCompare: util.promisify(bcryptHashCompare),
  bcryptHashHash: util.promisify(bcryptHashHash)
}

function sha512HashCompare (text, hash, alternativeDashboardEncryptionKey) {
  const textHash = sha512Hash(text, alternativeDashboardEncryptionKey)
  return textHash === hash
}

const fixedCache = {}
const fixedCacheItems = []

function sha512Hash (text, alternativeDashboardEncryptionKey) {
  const cacheKey = `${text}:${alternativeDashboardEncryptionKey | ''}`
  const cached = fixedCache[cacheKey]
  if (cached) {
    return cached
  }
  const hash = crypto.createHash('sha512')
  const finalText = text + ':' + (alternativeDashboardEncryptionKey || global.dashboardEncryptionKey)
  const data = hash.update(finalText, 'utf-8')
  const hashed = data.digest('hex')
  fixedCache[cacheKey] = hashed
  fixedCacheItems.unshift(cacheKey)
  if (fixedCacheItems.length > 10000) {
    const removed = fixedCacheItems.pop()
    delete (fixedCache[removed])
  }
  return hashed
}

const randomCache = {}
const randomCacheItems = []

function bcryptHashCompare (text, hash, alternativeDashboardEncryptionKey, callback) {
  if (!callback) {
    callback = alternativeDashboardEncryptionKey
    alternativeDashboardEncryptionKey = null
  }
  const cacheKey = `${text}:${hash}:${alternativeDashboardEncryptionKey}`
  const cached = randomCache[cacheKey]
  if (cached === true || cached === false) {
    return callback(null, cached)
  }
  const key = alternativeDashboardEncryptionKey || global.dashboardEncryptionKey || ''
  return bcrypt.compare(text + key, hash, (error, match) => {
    if (error) {
      return callback(error)
    }
    randomCache[cacheKey] = match
    randomCacheItems.unshift(cacheKey)
    if (randomCacheItems.length > 10000) {
      const removed = randomCacheItems.pop()
      delete (randomCache[removed])
    }
    return callback(null, match)
  })
}

function bcryptHashHash (text, alternativeDashboardEncryptionKey, callback) {
  if (!callback) {
    callback = alternativeDashboardEncryptionKey
    alternativeDashboardEncryptionKey = null
  }
  const key = alternativeDashboardEncryptionKey || global.dashboardEncryptionKey || ''
  return bcrypt.genSalt(global.bcryptWorkloadFactor, (error, salt) => {
    if (error) {
      return callback(error)
    }
    return bcrypt.hash(text + key, salt, null, callback)
  })
}
