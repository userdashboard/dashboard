let storageCache
if (process.env.CACHE) {
  if (process.env.CACHE === 'node') {
    storageCache = require('./storage-cache-node.js')
  } else {
    storageCache = require(process.env.CACHE)
  }
}

module.exports = {
  get: async (key) => {
    if (!storageCache) {
      return
    }
    if (!key || !key.length) {
      throw new Error('invalid-key')
    }
    return storageCache.get(key)
  },
  set: async (key, value) => {
    if (!storageCache) {
      return
    }
    if (!key || !key.length) {
      throw new Error('invalid-key')
    }
    return storageCache.set(key, value)
  },
  remove: async (key) => {
    if (!storageCache) {
      return
    }
    if (!key || !key.length) {
      throw new Error('invalid-key')
    }
    return storageCache.remove(key)
  }
}

if (process.env.NODE_ENV === 'testing') {
  module.exports.setStorageCache = () => {
    if (process.env.CACHE && process.env.CACHE !== 'node') {
      storageCache = require(process.env.CACHE)
    } else {
      storageCache = require('./storage-cache-node.js')
    }
  }
  module.exports.unsetStorageCache = () => {
    if (process.env.CACHE) {
      return
    }
    storageCache = null
  }
}
