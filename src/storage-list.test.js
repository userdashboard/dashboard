/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../test-helper.js')

describe('internal-api/storage-list', function () {
  let storage, storageList
  before(async () => {
    const Storage = require('./storage.js')
    const StorageList = require('./storage-list.js')
    storage = await Storage.setup()
    storageList = await StorageList.setup(storage)
  })
  describe('StorageList#add', () => {
    it('should add string properties', async () => {
      await storageList.add('test-data', 'string')
      const objects = await storageList.list('test-data')
      assert.strictEqual(objects.length, 1)
      assert.strictEqual(objects[0], 'string')
    })

    it('should add int properties', async () => {
      await storageList.add('test-data', 3)
      const objects = await storageList.list('test-data')
      assert.strictEqual(objects.length, 1)
      assert.strictEqual(objects[0], 3)
    })

    it('should add float properties', async () => {
      await storageList.add('test-data', 1.4)
      const objects = await storageList.list('test-data')
      assert.strictEqual(objects.length, 1)
      assert.strictEqual(objects[0], 1.4)
    })

    it('should add boolean properties', async () => {
      await storageList.add('test-data', true)
      const objects = await storageList.list('test-data')
      assert.strictEqual(objects.length, 1)
      assert.strictEqual(objects[0], true)
    })
  })

  describe('StorageList#addMany', () => {
    it('should add multiple properties', async () => {
      await storageList.addMany({
        'test-data': 'string',
        'second-piece': 'value'
      })
      const object1 = await storageList.list('test-data')
      assert.strictEqual(object1.length, 1)
      assert.strictEqual(object1[0], 'string')
      const object2 = await storageList.list('second-piece')
      assert.strictEqual(object2.length, 1)
      assert.strictEqual(object2[0], 'value')
    })

    it('should skip duplicates', async () => {
      await storageList.add('test-data', 'first value')
      await storageList.addMany({
        'test-data': 'first value',
        'second-piece': 'value'
      })
      const object1 = await storageList.list('test-data')
      assert.strictEqual(object1.length, 1)
      assert.strictEqual(object1[0], 'first value')
      const object2 = await storageList.list('second-piece')
      assert.strictEqual(object2.length, 1)
      assert.strictEqual(object2[0], 'value')
    })
  })

  describe('StorageList#count', async () => {
    it('should count the items', async () => {
      await storageList.add('test-data', 1)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 2)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 3)
      await TestHelper.wait(1200)
      const count = await storageList.count('test-data')
      assert.strictEqual(count, 3)
    })

    it('should not count removed items', async () => {
      await storageList.add('test-data', 1)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 2)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 3)
      await TestHelper.wait(1200)
      await storageList.remove('test-data', 3)
      await TestHelper.wait(1200)
      const count = await storageList.count('test-data')
      assert.strictEqual(count, 2)
    })
  })

  describe('StorageList#remove', () => {
    it('should remove the item', async () => {
      await storageList.add('test-data', 1)
      await TestHelper.wait(1200)
      await storageList.remove('test-data', 1)
      await TestHelper.wait(1200)
      const count = await storageList.count('test-data')
      assert.strictEqual(count, 0)
    })
  })

  describe('StorageList#list', async () => {
    it('should change page size', async () => {
      global.pageSize = 3
      await storageList.add('test-data', 1)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 2)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 3)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 4)
      await TestHelper.wait(1200)
      const listed = await storageList.list('test-data')
      assert.strictEqual(listed.length, global.pageSize)
      assert.strictEqual(listed[0], 4)
      assert.strictEqual(listed[1], 3)
      assert.strictEqual(listed[2], 2)
    })

    it('should enforce offset', async () => {
      const offset = 1
      global.pageSize = 2
      await storageList.add('test-data', 1)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 2)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 3)
      await TestHelper.wait(1200)
      const listed = await storageList.list('test-data', offset)
      assert.strictEqual(listed.length, global.pageSize)
      assert.strictEqual(listed[0], 2)
      assert.strictEqual(listed[1], 1)
    })
  })

  describe('StorageList#listAll', async () => {
    it('should return all records', async () => {
      await storageList.add('test-data', 1)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 2)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 3)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 4)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 5)
      await TestHelper.wait(1200)
      await storageList.add('test-data', 6)
      await TestHelper.wait(1200)
      const listed = await storageList.listAll('test-data')
      assert.strictEqual(listed.length, 6)
      assert.strictEqual(listed[0], 6)
      assert.strictEqual(listed[1], 5)
      assert.strictEqual(listed[2], 4)
      assert.strictEqual(listed[3], 3)
      assert.strictEqual(listed[4], 2)
      assert.strictEqual(listed[5], 1)
    })
  })
})
