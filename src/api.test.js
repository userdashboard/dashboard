const API = require('./api.js')
const assert = require('assert')

/* eslint-env mocha */
describe('internal-api/api', () => {
  describe('API#createFromSitemap', () => {
    it('should remap urls to object', async () => {
      const sitemap = global.sitemap
      global.sitemap = {
        '/api/this/is/an/example': {
          api: {
            get: () => {
              return 1
            }
          }
        },
        '/api/something/else': {
          api: {
            post: () => {
              return 2
            }
          }
        }
      }
      const api = API.createFromSitemap()
      assert.notStrictEqual(api.this.is.an.Example, undefined)
      assert.notStrictEqual(api.this.is.an.Example, null)
      const getResult = api.this.is.an.Example.get()
      assert.strictEqual(getResult, 1)
      const postResult = api.something.Else.post()
      assert.strictEqual(postResult, 2)
      global.sitemap = sitemap
    })

    it('should capitalize the last segment', async () => {
      const sitemap = global.sitemap
      global.sitemap = {
        '/api/this/is/an/example': {
          api: {
            get: () => {
              return 1
            }
          }
        }
      }
      const api = API.createFromSitemap()
      assert.notStrictEqual(api.this.is.an.Example, undefined)
      assert.notStrictEqual(api.this.is.an.Example, null)
      assert.strictEqual(api.this.is.an.example, undefined)
      global.sitemap = sitemap
    })

    it('should capitalize hyphenated last segment', async () => {
      const sitemap = global.sitemap
      global.sitemap = {
        '/api/this/is/an/example-two': {
          api: {
            get: () => {
              return 1
            }
          }
        }
      }
      const api = API.createFromSitemap()
      assert.notStrictEqual(api.this.is.an.ExampleTwo, undefined)
      assert.notStrictEqual(api.this.is.an.ExampleTwo, null)
      global.sitemap = sitemap
    })
  })
})
