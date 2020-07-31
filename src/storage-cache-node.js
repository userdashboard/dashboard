const cache = {}
const cacheList = []

module.exports = {
  get: async (key) => {
    const value = cache[key] ? '' + cache[key] : undefined
    return value
  },
  set: async (key, value) => {
    if (cache[key] === undefined) {
      cacheList.push(key)
    }
    cache[key] = value
    cacheList.unshift(key)
    if (cacheList.length > 100000) {
      const remove = cacheList.pop()
      delete (cache[remove])
    }
  },
  remove: async (key) => {
    delete cache[key]
  }
}
