/* eslint-env mocha */
const assert = require('assert')
const Hash = require('./hash.js')

describe('internal-api/hash', () => {
  describe('Hash#sha512Hash', () => {
    it('should produce the same hash each time', async () => {
      const raw = 'this is a string'
      const hashed = await Hash.sha512Hash(raw)
      assert.notStrictEqual(raw, hashed)
      const hashed2 = await Hash.sha512Hash(raw)
      assert.strictEqual(hashed, hashed2)
    })
  })

  describe('Hash#sha512HashCompare', () => {
    it('should match text with hash', async () => {
      const raw = 'this is a string'
      const hashed = await Hash.sha512Hash(raw)
      const match = await Hash.sha512HashCompare(raw, hashed)
      assert.strictEqual(match, true)
    })
  })

  describe('Hash#bcryptHashHash', () => {
    it('should hash differently each time', async () => {
      const raw = 'this is another string'
      const hashed = await Hash.bcryptHashHash(raw)
      const hashed2 = await Hash.bcryptHashHash(raw)
      assert.notStrictEqual(raw, hashed)
      assert.notStrictEqual(hashed, hashed2)
    })
  })

  describe('Hash#bcryptHashCompare', () => {
    it('should match passwords', async () => {
      const raw = 'this is another string'
      const hashed = await Hash.bcryptHashHash(raw)
      const match = await Hash.bcryptHashCompare('this is another string', hashed)
      assert.strictEqual(match, true)
    })

    it('should not match invalid passwords', async () => {
      const hashed = await Hash.bcryptHashHash('this is another string')
      const match = await Hash.bcryptHashCompare('something else', hashed)
      assert.strictEqual(match, false)
    })
  })
})
