const Storage = require('./storage.js')
const util = require('util')

module.exports = {
  getProperties: util.promisify(getProperties),
  getProperty: util.promisify(getProperty),
  removeProperty: util.promisify(removeProperty),
  removeProperties: util.promisify(removeProperties),
  setProperty: util.promisify(setProperty),
  setProperties: util.promisify(setProperties)
}

/**
 * Retrieves multiple property from the object
 * @param {string} objectid - the object
 * @param {string} array - array of properties
 */
function getProperties (objectid, array, callback) {
  if (!objectid || !objectid.length) {
    throw new Error('invalid-objectid')
  }
  if (!array || !array.length) {
    throw new Error('invalid-array')
  }
  return Storage.read(objectid, array).then((error, data) => {
    if (error) {
      return callback(error)
    }
    if (!data || !data.length) {
      return
    }
    data = JSON.parse(data)
    const object = {}
    for (const key in data) {
      if (array.indexOf(key) === -1) {
        continue
      }
      object[key] = data[key]
    }
    return callback(null, object)
  })
}

/**
 * Retrieves a property from the object
 * @param {string} objectid - the object
 * @param {string} property - name of property
 */
function getProperty (objectid, property, callback) {
  if (!objectid || !objectid.length) {
    throw new Error('invalid-objectid')
  }
  if (!property || !property.length) {
    throw new Error('invalid-property')
  }
  return Storage.read(objectid).then((error, data) => {
    if (error) {
      return callback(error)
    }
    if (!data || !data.length) {
      return
    }
    data = JSON.parse(data)
    const value = data[property]
    if (value === undefined || value === null) {
      return
    }
    return callback(null, value)
  })
}

/**
 * Attaches multiple properties and values to the object
 * @param {string} objectid - the object
 * @param {string} hash - hash of properties
 */
function setProperties (objectid, properties, callback) {
  if (!objectid || !objectid.length) {
    throw new Error('invalid-objectid')
  }
  if (!properties) {
    throw new Error('invalid-properties')
  }
  const keys = Object.keys(properties)
  if (!keys.length) {
    throw new Error('invalid-properties')
  }
  return Storage.read(objectid).then((error, data) => {
    if (error) {
      return callback(error)
    }
    data = JSON.parse(data)
    for (const property in properties) {
      if (properties[property] === undefined || properties[property] === null || properties[property] === '') {
        delete (data[property])
      } else {
        data[property] = properties[property]
      }
    }
    return Storage.write(objectid, data, callback)
  })
}

/**
 * Attaches a property and value to the object
 * @param {string} objectid - the object
 * @param {string} property - the field
 * @param {string} value - the value
 */
function setProperty (objectid, property, value, callback) {
  if (!objectid || !objectid.length) {
    throw new Error('invalid-objectid')
  }
  if (!property || !property.length) {
    throw new Error('invalid-property')
  }
  if (value == null || value === undefined) {
    throw new Error('invalid-value')
  }
  return Storage.read(objectid).then((error, data) => {
    if (error) {
      return callback(error)
    }
    data = JSON.parse(data)
    data[property] = value
    return Storage.write(objectid, data, callback)
  })
}

/**
 * Removes multiple properties from the object
 * @param {string} objectid - the object
 * @param {string} array - array of properties
 */
function removeProperties (objectid, array, callback) {
  if (!objectid || !objectid.length) {
    throw new Error('invalid-objectid')
  }
  if (!array || !array.length) {
    throw new Error('invalid-array')
  }
  return Storage.read(objectid).then((error, data) => {
    if (error) {
      return callback(error)
    }
    if (!data) {
      return
    }
    data = JSON.parse(data)
    for (const item of array) {
      delete (data[item])
    }
    return Storage.write(objectid, data, callback)
  })
}

/**
 * Removes a property from the object
 * @param {string} objectid - the object
 * @param {string} property - the field
 */
function removeProperty (objectid, property, callback) {
  if (!objectid || !objectid.length) {
    throw new Error('invalid-objectid')
  }
  if (!property || !property.length) {
    throw new Error('invalid-property')
  }
  return Storage.read(objectid).then((error, data) => {
    if (error) {
      return callback(error)
    }
    if (!data) {
      return
    }
    data = JSON.parse(data)
    delete (data[property])
    return Storage.write(objectid, data, callback)
  })
}
