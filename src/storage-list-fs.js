const fs = require('fs')
const util = require('util')

module.exports = {
  setup: async () => {
    const container = {
      add: util.promisify(add),
      addMany: util.promisify(addMany),
      count: util.promisify(count),
      exists: util.promisify(exists),
      list: util.promisify(list),
      listAll: util.promisify(listAll),
      remove: util.promisify(remove)
    }
    return container
  }
}

let writeFile = fs.writeFile
if (process.env.NODE_ENV === 'testing') {
  writeFile = (filepath, contents, callback) => {
    return fs.writeFile(filepath, contents, () => {
      return setTimeout(callback, 1000)
    })
  }
}

let storagePath
if (!process.env.STORAGE) {
  storagePath = process.env.STORAGE_PATH || `${global.applicationPath}/data`
  if (!fs.existsSync(storagePath)) {
    createFolder(storagePath)
  }
  storagePath += '/list'
  if (!fs.existsSync(storagePath)) {
    createFolder(storagePath)
  }
}
const statCache = {}
const statCacheItems = []

function exists (path, itemid, callback) {
  return fs.access(`${storagePath}/${path}/${itemid}`, fs.constants.F_OK | fs.constants.W_OK, (error) => {
    return callback(null, error === null || error === undefined)
  })
}

function add (path, itemid, callback) {
  createFolder(`${storagePath}/${path}`)
  return writeFile(`${storagePath}/${path}/${itemid}`, '', callback)
}

function addMany (items, callback) {
  const paths = Object.keys(items)
  function nextItem () {
    if (!paths.length) {
      return callback()
    }
    const path = paths.shift()
    const itemid = items[path]
    createFolder(`${storagePath}/${path}`)
    return fs.writeFile(`${storagePath}/${path}/${itemid}`, '', () => {
      return nextItem()
    })
  }
  return nextItem()
}

function count (path, callback) {
  return fs.access(`${storagePath}/${path}`, fs.constants.F_OK | fs.constants.W_OK, (error) => {
    if (error) {
      return callback(null, 0)
    }
    return fs.readdir(`${storagePath}/${path}`, (error, itemids) => {
      if (error) {
        return callback(error)
      }
      if (!itemids || !itemids.length) {
        return callback(null, 0)
      }
      return callback(null, itemids.length)
    })
  })
}

function listAll (path, callback) {
  return fs.access(`${storagePath}/${path}`, fs.constants.F_OK | fs.constants.W_OK, (error) => {
    if (error) {
      return callback()
    }
    return fs.readdir(`${storagePath}/${path}`, (error, itemids) => {
      if (error) {
        return callback(error)
      }
      if (!itemids || !itemids.length) {
        return callback()
      }
      return cacheItemStats(path, itemids, (error, itemids) => {
        if (error) {
          return callback(error)
        }
        sortByCachedItemStats(path, itemids)
        return callback(null, itemids)
      })
    })
  })
}

function list (path, offset, pageSize, callback) {
  offset = offset || 0
  if (pageSize === null || pageSize === undefined) {
    pageSize = global.pageSize
  }
  if (offset < 0) {
    throw new Error('invalid-offset')
  }
  return fs.access(`${storagePath}/${path}`, fs.constants.F_OK | fs.constants.W_OK, (error) => {
    if (error) {
      return callback()
    }
    return fs.readdir(`${storagePath}/${path}`, (error, itemids) => {
      if (error) {
        return callback(error)
      }
      if (!itemids || !itemids.length) {
        return callback()
      }
      return cacheItemStats(path, itemids, (error, itemids) => {
        if (error) {
          return callback(error)
        }
        sortByCachedItemStats(path, itemids)
        if (offset) {
          itemids.splice(0, offset)
        }
        if (!itemids.length) {
          return callback()
        }
        if (pageSize > 0) {
          itemids.splice(pageSize, itemids.length - pageSize)
        }
        if (!itemids.length) {
          return callback()
        }
        return callback(null, itemids)
      })
    })
  })
}

function sortByCachedItemStats (path, items) {
  items.sort((file1, file2) => {
    const stat1 = statCache[`${storagePath}/${path}/${file1}`]
    const stat2 = statCache[`${storagePath}/${path}/${file2}`]
    const time1 = stat1.mtime.getTime()
    const time2 = stat2.mtime.getTime()
    return time1 < time2 ? 1 : -1
  })
}

function cacheItemStats (path, itemids, callback) {
  let index = 0
  function nextItem () {
    const item = itemids[index]
    const fullPath = `${storagePath}/${path}/${item}`
    const cached = statCache[fullPath]
    if (cached) {
      index++
      if (index < itemids.length) {
        return nextItem()
      }
      return callback(null, itemids)
    }
    return fs.stat(fullPath, (error, stat) => {
      if (error) {
        return callback(error)
      }
      statCache[fullPath] = stat
      statCacheItems.unshift(fullPath)
      if (statCacheItems.length > 1000000) {
        statCacheItems.pop()
      }
      index++
      if (index < itemids.length) {
        return nextItem()
      }
      return callback(null, itemids)
    })
  }
  return nextItem()
}

function remove (path, itemid, callback) {
  return exists(path, itemid, (_, exists) => {
    if (!exists) {
      return callback()
    }
    delete (statCache[`${storagePath}/${path}/${itemid}`])
    statCacheItems.splice(statCacheItems.indexOf(`${storagePath}/${path}/${itemid}`), 1)
    return fs.unlink(`${storagePath}/${path}/${itemid}`, callback)
  })
}

function createFolder (path) {
  const nestedParts = path.split('/')
  let nestedPath = ''
  for (const part of nestedParts) {
    nestedPath += `/${part}`
    if (!fs.existsSync(nestedPath)) {
      fs.mkdirSync(nestedPath)
    }
  }
}
