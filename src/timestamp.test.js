/* eslint-env mocha */
const assert = require('assert')
const Timestamp = require('./timestamp.js')

describe('internal-api/timestamp', () => {
  describe('#create', () => {
    it('should reject null date', async () => {
      assert.strictEqual(Timestamp.create(), null)
    })

    it('should accept date', async () => {
      const date = Timestamp.create(new Date())
      assert.notStrictEqual(date, undefined)
      assert.notStrictEqual(date, null)
    })

    it('should accept string', async () => {
      const date = Timestamp.create(new Date().toString())
      assert.notStrictEqual(date, undefined)
      assert.notStrictEqual(date, null)
    })
  })
})
