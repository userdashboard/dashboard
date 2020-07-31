/* eslint-env mocha */
const assert = require('assert')

describe('internal-api/storage', function () {
  let storage
  before(async () => {
    const Storage = require('./storage.js')
    storage = await Storage.setup()
  })

  describe('Storage#read', () => {
    it('should require file', async () => {
      let errorMessage
      try {
        await storage.read(null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-file')
    })

    it('should return file contents', async () => {
      await storage.write('test-read/1', { test: true })
      const file = await storage.read('test-read/1')
      assert.strictEqual(file, '{"test":true}')
    })
  })

  describe('Storage#readMany', () => {
    it('should require files array', async () => {
      let errorMessage
      try {
        await storage.readMany(null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-files')
      errorMessage = null
      try {
        await storage.readMany([])
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-files')
    })

    it('should return files contents', async () => {
      await storage.write('test/1', { test: 1 })
      await storage.write('test/2', { test: 2 })
      await storage.write('test/3', { test: 3 })
      const files = await storage.readMany('test', ['1', '2', '3'])
      assert.strictEqual(files['1'].test, 1)
      assert.strictEqual(files['2'].test, 2)
      assert.strictEqual(files['3'].test, 3)
    })
  })

  describe('Storage#write', async () => {
    it('should require file', async () => {
      let errorMessage
      try {
        await storage.write(null, {})
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-file')
    })

    it('should require contents', async () => {
      let errorMessage
      try {
        await storage.write('test-write', null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-contents')
    })

    it('should accept content object', async () => {
      await storage.write('test-object', { test: true })
      const file = await storage.read('test-object')
      assert.strictEqual(file, '{"test":true}')
    })

    it('should accept content string', async () => {
      await storage.write('test-object', 'string')
      const file = await storage.read('test-object')
      assert.strictEqual(file, 'string')
    })

    it('should write file contents', async () => {
      await storage.write('test-write', { test: true })
      const file = await storage.read('test-write')
      assert.strictEqual(file, '{"test":true}')
    })

    it('should encrypt contents', async () => {
      global.encryptionSecret = '12345678901234567890123456789012'
      global.encryptionSecretIV = '1234123412341234'
      await storage.write('test-write', { test: true })
      const decryptedVersion = await storage.read('test-write')
      assert.strictEqual(decryptedVersion, '{"test":true}')
      global.encryptionSecret = ''
      global.encryptionSecretIV = ''
      if (process.env.CACHE) {
        const StorageCache = require('./storage-cache.js')
        await StorageCache.remove('test-write')
      }
      const cannotDecrypt = await storage.read('test-write')
      assert.notStrictEqual(cannotDecrypt, '{"test":true}')
    })
  })

  describe('Storage#delete', async () => {
    it('should require file', async () => {
      let errorMessage
      try {
        await storage.delete(null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-file')
    })

    it('should delete file', async () => {
      await storage.write('test-delete', { test: true })
      await storage.delete('test-delete')
      const file = await storage.read('test-delete')
      assert.strictEqual(file, undefined)
    })
  })
})
