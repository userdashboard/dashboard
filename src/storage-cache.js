const fs = require('fs')
const path = require('path')
let storageCache

if (process.env.CACHE) {
  if (process.env.CACHE === 'node') {
    storageCache = require('./storage-cache-node.js')
  } else {
    const storageCacheValue = process.env.CACHE
    const storagePath = path.join(__dirname, `node_modules/${storageCacheValue}/index.js`)
    if (fs.existsSync(storagePath)) {
      storageCache = require(storagePath)
    } else {
      const storagePath2 = path.join(global.applicationPath, `node_modules/${storageCacheValue}/index.js`)
      if (fs.existsSync(storagePath2)) {
        storageCache = require(storagePath2)
      }
    }
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
      const storageCacheValue = process.env.CACHE
      const storagePath = path.join(__dirname, `node_modules/${storageCacheValue}/index.js`)
      if (fs.existsSync(storagePath)) {
        storageCache = require(storagePath)
      } else {
        const storagePath2 = path.join(global.applicationPath, `node_modules/${storageCacheValue}/index.js`)
        if (fs.existsSync(storagePath2)) {
          storageCache = require(storagePath2)
        }
      }
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
