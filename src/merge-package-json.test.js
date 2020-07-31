/* eslint-env mocha */
const assert = require('assert')
const mergePackageJSON = require('./merge-package-json.js')

describe('internal-api/merge-package-json', () => {
  describe('MergePackageJSON#loadRootJSON', () => {
    describe('Merged content handler order', () => {
      it('should put application content handler last', async () => {
        const applicationJSON = {
          dashboard: {
            content: ['content-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            content: ['content-1', 'content-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.content[mergedJSON.dashboard.content.length - 1], applicationJSON.dashboard.content[0])
      })

      it('should put dashboard content handlers first', async () => {
        const applicationJSON = {
          dashboard: {
            content: ['content-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            content: ['content-1', 'content-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.content.length, 3)
        assert.strictEqual(mergedJSON.dashboard.content[0], dashboardJSON.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[1], dashboardJSON.dashboard.content[1])
      })

      it('should put module content handlers between dashboard and application', async () => {
        const applicationJSON = {
          dashboard: {
            content: ['content-5'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            content: ['content-1', 'content-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              content: ['content-3', 'content-4']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.content.length, 5)
        assert.strictEqual(mergedJSON.dashboard.content[0], dashboardJSON.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[1], dashboardJSON.dashboard.content[1])
        assert.strictEqual(mergedJSON.dashboard.content[2], global.testModuleJSON.testModule.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[3], global.testModuleJSON.testModule.dashboard.content[1])
        assert.strictEqual(mergedJSON.dashboard.content[4], applicationJSON.dashboard.content[0])
      })

      it('should include nested modules', async () => {
        const applicationJSON = {
          dashboard: {
            content: ['content-7'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            content: ['content-1', 'content-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              content: ['content-3', 'content-4'],
              modules: ['testModule2']
            }
          },
          testModule2: {
            dashboard: {
              content: ['content-5', 'content-6']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.content.length, 7)
        assert.strictEqual(mergedJSON.dashboard.content[0], dashboardJSON.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[1], dashboardJSON.dashboard.content[1])
        assert.strictEqual(mergedJSON.dashboard.content[2], global.testModuleJSON.testModule.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[3], global.testModuleJSON.testModule.dashboard.content[1])
        assert.strictEqual(mergedJSON.dashboard.content[4], global.testModuleJSON.testModule2.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[5], global.testModuleJSON.testModule2.dashboard.content[1])
        assert.strictEqual(mergedJSON.dashboard.content[6], applicationJSON.dashboard.content[0])
      })
    })

    describe('Merged proxy handler order', () => {
      it('should put application proxy handlers last', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy[mergedJSON.dashboard.proxy.length - 1], applicationJSON.dashboard.proxy[0])
      })

      it('should put dashboard proxy handlers first', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['content-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 3)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
      })

      it('should put module proxy handlers between dashboard and application', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-5'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              proxy: ['proxy-3', 'proxy-4']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 5)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[2], global.testModuleJSON.testModule.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[3], global.testModuleJSON.testModule.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[4], applicationJSON.dashboard.proxy[0])
      })

      it('should include nested modules', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-7'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              proxy: ['proxy-3', 'proxy-4'],
              modules: ['testModule2']
            }
          },
          testModule2: {
            dashboard: {
              proxy: ['proxy-5', 'proxy-6']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 7)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[2], global.testModuleJSON.testModule.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[3], global.testModuleJSON.testModule.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[4], global.testModuleJSON.testModule2.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[5], global.testModuleJSON.testModule2.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[6], applicationJSON.dashboard.proxy[0])
      })
    })

    describe('Merged proxy handler order', () => {
      it('should put application proxy handlers last', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy[mergedJSON.dashboard.proxy.length - 1], applicationJSON.dashboard.proxy[0])
      })

      it('should put dashboard proxy handlers first', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['content-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 3)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
      })

      it('should put module proxy handlers between dashboard and application', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-5'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              proxy: ['proxy-3', 'proxy-4']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 5)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[2], global.testModuleJSON.testModule.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[3], global.testModuleJSON.testModule.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[4], applicationJSON.dashboard.proxy[0])
      })

      it('should include nested modules', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-7'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              proxy: ['proxy-3', 'proxy-4'],
              modules: ['testModule2']
            }
          },
          testModule2: {
            dashboard: {
              proxy: ['proxy-5', 'proxy-6']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 7)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[2], global.testModuleJSON.testModule.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[3], global.testModuleJSON.testModule.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[4], global.testModuleJSON.testModule2.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[5], global.testModuleJSON.testModule2.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[6], applicationJSON.dashboard.proxy[0])
      })
    })
  })
})
