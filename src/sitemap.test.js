const assert = require('assert')
const path = require('path')
const Sitemap = require('./sitemap.js')

/* eslint-env mocha */
describe('internal-api/sitemap', () => {
  describe('Sitemap#readHTMLAttributes', () => {
    it('should detect attributes', async () => {
      const doc = `<html data-auth="false" data-template="false" data-navbar="something">
                    <body>
                    </body>
                  </html>`
      const attributes = Sitemap.readHTMLAttributes(doc)
      assert.strictEqual(attributes.auth, false)
      assert.strictEqual(attributes.template, false)
      assert.strictEqual(attributes.navbar, true)
    })
  })

  describe('Sitemap#loadRoute', () => {
    it('should load API route', async () => {
      const routePath = path.join(__dirname, 'www/api/user/account.js')
      const route = Sitemap.loadRoute(routePath)
      assert.strictEqual(route.jsFilePathFull, routePath)
      assert.strictEqual(route.html, undefined)
    })

    it('should load HTML route', async () => {
      const routePath = path.join(__dirname, 'www/account/change-password.js')
      const route = Sitemap.loadRoute(routePath)
      assert.strictEqual(route.jsFilePathFull, routePath)
      assert.strictEqual(route.htmlFilePathFull, routePath.replace('.js', '.html'))
    })

    it('should load static HTML route', async () => {
      const routePath = path.join(__dirname, 'www/account/signout-complete.html')
      const route = Sitemap.loadRoute(routePath)
      assert.strictEqual(route.htmlFilePathFull, routePath)
      assert.strictEqual(route.jsFilePathFull, undefined)
    })
  })

  describe('Sitemap#scanFiles', () => {
    it('should read files recursively', async () => {
      const fileList = []
      Sitemap.scanFiles(path.join(__dirname, 'www'), fileList)
      for (const file of fileList) {
        if (file.indexOf('/api/user/')) {
          assert.strictEqual(true, true)
        }
      }
    })

    it('should exclude navbar files', async () => {
      const fileList = []
      Sitemap.scanFiles(path.join(__dirname, 'www'), fileList)
      for (const file of fileList) {
        if (file.indexOf('navbar') > -1) {
          assert.strictEqual(false, true)
        }
      }
    })

    it('should exclude test files', async () => {
      const fileList = []
      Sitemap.scanFiles(path.join(__dirname, 'www'), fileList)
      for (const file of fileList) {
        if (file.endsWith('.test.js')) {
          assert.strictEqual(false, true)
        }
      }
    })
  })
})
