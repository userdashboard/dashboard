/* eslint-env mocha */
const assert = require('assert')
const Format = require('./format.js')

describe('internal-api/format', () => {
  describe('Format#parseDate', () => {
    it('should throw error for missing date', async () => {
      let errorMessage
      try {
        Format.parseDate()
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-date')
    })

    it('should throw error for invalid date', async () => {
      let errorMessage
      try {
        Format.parseDate('invalid')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-date')
    })
  })

  describe('Format#date', () => {
    it('should zero pad days', async () => {
      assert.strictEqual(Format.date('2017-12-1'), '2017-12-01')
    })

    it('should zero pad months', async () => {
      assert.strictEqual(Format.date('2017/1/1'), '2017-01-01')
    })
  })
})
