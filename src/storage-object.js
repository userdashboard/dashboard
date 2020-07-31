module.exports = {
  setup: async (storage) => {
    const container = {
      getProperties: async (objectid, array) => {
        if (!objectid || !objectid.length) {
          throw new Error('invalid-objectid')
        }
        if (!array || !array.length) {
          throw new Error('invalid-array')
        }
        let data = await storage.read(objectid, array)
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
        return object
      },
      getProperty: async (objectid, property) => {
        if (!objectid || !objectid.length) {
          throw new Error('invalid-objectid')
        }
        if (!property || !property.length) {
          throw new Error('invalid-property')
        }
        let data = await storage.read(objectid)
        if (!data || !data.length) {
          return
        }
        data = JSON.parse(data)
        const value = data[property]
        if (value === undefined || value === null) {
          return
        }
        return value
      },
      removeProperty: async (objectid, property) => {
        if (!objectid || !objectid.length) {
          throw new Error('invalid-objectid')
        }
        if (!property || !property.length) {
          throw new Error('invalid-property')
        }
        let data = await storage.read(objectid)
        if (!data) {
          return
        }
        data = JSON.parse(data)
        delete (data[property])
        return storage.write(objectid, data)
      },
      removeProperties: async (objectid, array) => {
        if (!objectid || !objectid.length) {
          throw new Error('invalid-objectid')
        }
        if (!array || !array.length) {
          throw new Error('invalid-array')
        }
        let data = await storage.read(objectid)
        if (!data) {
          return
        }
        data = JSON.parse(data)
        for (const item of array) {
          delete (data[item])
        }
        return storage.write(objectid, data)
      },
      setProperty: async (objectid, property, value) => {
        if (!objectid || !objectid.length) {
          throw new Error('invalid-objectid')
        }
        if (!property || !property.length) {
          throw new Error('invalid-property')
        }
        if (value == null || value === undefined) {
          throw new Error('invalid-value')
        }
        let data = await storage.read(objectid) || '{}'
        data = JSON.parse(data)
        data[property] = value
        return storage.write(objectid, data)
      },
      setProperties: async (objectid, properties) => {
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
        let data = await storage.read(objectid) || '{}'
        data = JSON.parse(data)
        for (const property in properties) {
          if (properties[property] === undefined || properties[property] === null || properties[property] === '') {
            delete (data[property])
          } else {
            data[property] = properties[property]
          }
        }
        return storage.write(objectid, data)
      }
    }
    return container
  }
}
