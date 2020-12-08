/* eslint-env mocha */
const assert = require('assert')
const mergePackageJSON = require('./merge-package-json.js')

describe('internal-api/merge-package-json', () => {
  function blankPackageJSON () {
    return {
      dashboard: {
        server: [],
        serverFilePaths: [],
        content: [],
        contentFilePaths: [],
        prozxy: [],
        proxyFilePaths: [],
        modules: [],
        moduleNames: [],
        moduleVersions: [],
        menus: {
          account: [],
          administrator: []
        }
      }
    }
  }
  describe('mergeTitle', () => {
    it('should prioritize application title', async () => {
      const applicationJSON = blankPackageJSON()
      applicationJSON.dashboard.title = 'Application title'
      const dashboardJSON = blankPackageJSON()
      dashboardJSON.dashboard.title = 'Dashboard title'
      const packageJSON = blankPackageJSON()
      mergePackageJSON.mergeTitle(packageJSON, dashboardJSON, applicationJSON)
      assert.strictEqual(packageJSON.dashboard.title, 'Application title')
    })

    it('should default to Dashboard title', async () => {
      const applicationJSON = blankPackageJSON()
      const dashboardJSON = blankPackageJSON()
      dashboardJSON.dashboard.title = 'Dashboard title'
      const packageJSON = {
        dashboard: {}
      }
      mergePackageJSON.mergeTitle(packageJSON, dashboardJSON, applicationJSON)
      assert.strictEqual(packageJSON.dashboard.title, 'Dashboard title')
    })
  })

  describe('mergeScriptArray', () => {
    it('should add scripts', async () => {
      const dashboardJSON = blankPackageJSON()
      dashboardJSON.dashboard.server = ['script1', 'script2', 'script3']
      const packageJSON = blankPackageJSON()
      mergePackageJSON.mergeScriptArray(packageJSON, dashboardJSON, 'server')
      assert.strictEqual(packageJSON.dashboard.server[0], 'script1')
      assert.strictEqual(packageJSON.dashboard.server[1], 'script2')
      assert.strictEqual(packageJSON.dashboard.server[2], 'script3')
    })

    it('should put application scripts last', async () => {
      const dashboardJSON = blankPackageJSON()
      dashboardJSON.dashboard.server = ['script1', 'script2', 'script3']
      const applicationJSON = blankPackageJSON()
      applicationJSON.dashboard.server = ['script4', 'script5', 'script6']
      const packageJSON = blankPackageJSON()
      mergePackageJSON.mergeScriptArray(packageJSON, dashboardJSON, 'server')
      mergePackageJSON.mergeScriptArray(packageJSON, applicationJSON, 'server')
      assert.strictEqual(packageJSON.dashboard.server[0], 'script1')
      assert.strictEqual(packageJSON.dashboard.server[1], 'script2')
      assert.strictEqual(packageJSON.dashboard.server[2], 'script3')
      assert.strictEqual(packageJSON.dashboard.server[3], 'script4')
      assert.strictEqual(packageJSON.dashboard.server[4], 'script5')
      assert.strictEqual(packageJSON.dashboard.server[5], 'script6')
    })
  })

  // describe('mergeSpecialHTML', () => {
  //   it('should merge package pages', async () => {
  //   })

  //   it('should put module HTML pages second', async () => {
  //   })

  //   it('should put application HTML pages last', async () => {
  //   })
  // })

  // describe('mergeMenuLinks', () => {
  //   it('should put Dashboard menu links first', async () => {
  //   })

  //   it('should put module menu links second', async () => {
  //   })

  //   it('should put application menu links last', async () => {
  //   })
  // })
})
