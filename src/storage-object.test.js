/* eslint-env mocha */
const assert = require('assert')

describe('internal-api/storage-object', () => {
  let storage, storageObject
  before(async () => {
    const Storage = require('./storage.js')
    storage = await Storage.setup()
    const StorageObject = require('./storage-object.js')
    storageObject = await StorageObject.setup(storage)
  })
  describe('getProperties', async () => {
    it('should return string properties', async () => {
      const testObject = {
        one: '1',
        two: '2'
      }
      await storageObject.setProperties('test-object/id', testObject)
      const object = await storageObject.getProperties('test-object/id', Object.keys(testObject))
      assert.strictEqual(object.one, testObject.one)
      assert.strictEqual(object.two, testObject.two)
    })

    it('should return int properties', async () => {
      const testObject = {
        one: 1,
        two: 2
      }
      await storageObject.setProperties('test-object/id', testObject)
      const object = await storageObject.getProperties('test-object/id', ['one', 'two'])
      assert.strictEqual(object.one, testObject.one)
      assert.strictEqual(object.two, testObject.two)
    })

    it('should return float properties', async () => {
      const testObject = {
        one: 1.1,
        two: 2.2
      }
      await storageObject.setProperties('test-object/id', testObject)
      const object = await storageObject.getProperties('test-object/id', ['one', 'two'])
      assert.strictEqual(object.one, testObject.one)
      assert.strictEqual(object.two, testObject.two)
    })

    it('should return boolean properties', async () => {
      const testObject = {
        one: true,
        two: false
      }
      await storageObject.setProperties('test-object/id', testObject)
      const object = await storageObject.getProperties('test-object/id', ['one', 'two'])
      assert.strictEqual(object.one, testObject.one)
      assert.strictEqual(object.two, testObject.two)
    })
  })

  describe('getProperty', () => {
    it('should return string property', async () => {
      await storageObject.setProperty('test-object/id', 'property', 'thing')
      const property = await storageObject.getProperty('test-object/id', 'property')
      assert.strictEqual(property, 'thing')
    })

    it('should return int property', async () => {
      await storageObject.setProperty('test-object/id', 'property', 12)
      const property = await storageObject.getProperty('test-object/id', 'property')
      assert.strictEqual(property, 12)
    })

    it('should return float property', async () => {
      await storageObject.setProperty('test-object/id', 'property', 1.31)
      const property = await storageObject.getProperty('test-object/id', 'property')
      assert.strictEqual(property, 1.31)
    })

    it('should return boolean property', async () => {
      await storageObject.setProperty('test-object/id', 'property', true)
      const property = await storageObject.getProperty('test-object/id', 'property')
      assert.strictEqual(property, true)
    })
  })

  describe('removeProperty', () => {
    it('should delete properties', async () => {
      await storageObject.setProperties('test-object/id', { one: true, two: 'thing', three: 8 })
      await storageObject.removeProperties('test-object/id', ['one', 'two'])
      const object = await storageObject.getProperties('test-object/id', ['one', 'two', 'three'])
      assert.strictEqual(object.one, undefined)
      assert.strictEqual(object.two, undefined)
      assert.strictEqual(object.three, 8)
    })
  })

  describe('removeProperties', () => {
    it('should delete properties', async () => {
      await storageObject.setProperty('test-object/id', 'property', true)
      await storageObject.removeProperty('test-object/id', 'property')
      const property = await storageObject.getProperty('test-object/id', 'property')
      assert.strictEqual(property, undefined)
    })
  })

  describe('setProperty', () => {
    it('should set string property', async () => {
      await storageObject.setProperty('test-object/id', 'property', 'thing')
      const property = await storageObject.getProperty('test-object/id', 'property')
      assert.strictEqual(property, 'thing')
    })

    it('should set int property', async () => {
      await storageObject.setProperty('test-object/id', 'property', 12)
      const property = await storageObject.getProperty('test-object/id', 'property')
      assert.strictEqual(property, 12)
    })

    it('should set float property', async () => {
      await storageObject.setProperty('test-object/id', 'property', 1.31)
      const property = await storageObject.getProperty('test-object/id', 'property')
      assert.strictEqual(property, 1.31)
    })

    it('should set boolean property', async () => {
      await storageObject.setProperty('test-object/id', 'property', true)
      const property = await storageObject.getProperty('test-object/id', 'property')
      assert.strictEqual(property, true)
    })
  })

  describe('setProperties', () => {
    it('should set string properties', async () => {
      const testObject = {
        one: '1',
        two: '2'
      }
      await storageObject.setProperties('test-object/id', testObject)
      const object = await storageObject.getProperties('test-object/id', Object.keys(testObject))
      assert.strictEqual(object.one, testObject.one)
      assert.strictEqual(object.two, testObject.two)
    })

    it('should set int properties', async () => {
      const testObject = {
        one: 1,
        two: 2
      }
      await storageObject.setProperties('test-object/id', testObject)
      const object = await storageObject.getProperties('test-object/id', ['one', 'two'])
      assert.strictEqual(object.one, testObject.one)
      assert.strictEqual(object.two, testObject.two)
    })

    it('should set float properties', async () => {
      const testObject = {
        one: 1.1,
        two: 2.2
      }
      await storageObject.setProperties('test-object/id', testObject)
      const object = await storageObject.getProperties('test-object/id', ['one', 'two'])
      assert.strictEqual(object.one, testObject.one)
      assert.strictEqual(object.two, testObject.two)
    })

    it('should set boolean properties', async () => {
      const testObject = {
        one: true,
        two: false
      }
      await storageObject.setProperties('test-object/id', testObject)
      const object = await storageObject.getProperties('test-object/id', ['one', 'two'])
      assert.strictEqual(object.one, testObject.one)
      assert.strictEqual(object.two, testObject.two)
    })
  })
})
