/* eslint-env mocha */
const assert = require('assert')
const HTML = require('./html.js')
const Response = require('./response.js')
const TestHelper = require('../test-helper.js')

describe('internal-api/response', () => {
  describe('Response#wrapTemplateWithSrcDoc (global setting)', () => {
    it('should transfer head content from page to template', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
          <template id="head">
            <script src="include.js"></script>
          </template>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const scripts = completed.getElementsByTagName('script')
      assert.strictEqual(scripts.length, 1)
      assert.strictEqual(scripts[0].parentNode.tag, 'head')
      const titles = completed.getElementsByTagName('title')
      assert.strictEqual(titles.length, 1)
      assert.strictEqual(titles[0].child[0].text, 'Hardcoded Page Title')
    })

    it('should transfer head content from template to page', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="page">
                <script src="include.js"></script>
              </template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = TestHelper.extractDoc(completedHTML)
      const scripts = completed.getElementsByTagName('script')
      assert.strictEqual(scripts.length, 1)
      assert.strictEqual(scripts[0].parentNode.tag, 'head')
      const titles = completed.getElementsByTagName('title')
      assert.strictEqual(titles.length, 1)
      assert.strictEqual(titles[0].child[0].text, 'Hardcoded Page Title')
    })

    it('should transfer navigation to template from page', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
          <template id="navbar">
            <a href="#">link 1</a>
            <a href="#">link 2</a>
            <a href="#">link 3</a>
          </template>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const navigation = completed.getElementById('navigation')
      const links = navigation.getElementsByTagName('a')
      assert.strictEqual(links.length, 3)
      assert.strictEqual(links[0].parentNode.tag, 'nav')
    })

    it('should transfer title to page from template', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const titles = completed.getElementsByTagName('title')
      assert.strictEqual(titles.length, 1)
      assert.strictEqual(titles[0].child[0].text, 'Hardcoded Page Title')
    })

    it('should remove menus for guests', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          menus: {
            administrator: [],
            account: []
          },
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const menus = completed.getElementsByTagName('menu')
      assert.strictEqual(menus.length, 0)
    })

    it('should disable administrator menu for normal user', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          menus: {
            administrator: [],
            account: []
          },
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/sessions')
      req.account = user.account
      req.session = user.session
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const administratorMenu = completed.getElementById('administrator-menu-container')
      assert.strictEqual(administratorMenu.attr.style.join(' '), 'display: none')
    })

    it('should add account menu links from package.json', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          menus: {
            account: [
              '<a href="/">This is a link</a>'
            ]
          },
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>account
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/sessions')
      req.account = user.account
      req.session = user.session
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const menu = completed.getElementById('account-menu-container')
      const links = menu.getElementsByTagName('a')
      assert.strictEqual(links.length, 1)
      assert.strictEqual(links[0].child[0].text, 'This is a link')
    })

    it('should add administrator menu links from package.json', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          menus: {
            administrator: [
              '<a href="/">Administrator menu link</a>'
            ]
          },
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/account/sessions')
      req.account = administrator.account
      req.session = administrator.session
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const menu = completed.getElementById('administrator-menu-container')
      const links = menu.getElementsByTagName('a')
      assert.strictEqual(links.length, 1)
      assert.strictEqual(links[0].child[0].text, 'Administrator menu link')
    })
  })

  describe('Response#wrapTemplateWithSrcDoc (config override)', () => {
    it('should transfer head content from page to template', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
          <template id="head">
            <script src="include.js"></script>
          </template>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      req.packageJSON = {
        dashboard: {
          title: 'Overriden Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Overriden Template Title</title>
              <script src="override.js" />
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const scripts = completed.getElementsByTagName('script')
      assert.strictEqual(scripts.length, 2)
      assert.strictEqual(scripts[0].attr.src, 'override.js')
      assert.strictEqual(scripts[1].attr.src, 'include.js')
    })

    it('should transfer head content from template to page', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="page">
                <script src="include.js"></script>
              </template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      req.packageJSON = {
        dashboard: {
          title: 'Overridden Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Overridden Template Title</title>
              <script src="override.js" />
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="page">
                <script src="include.js"></script>
              </template>
            </body>
          </html>`
        }
      }
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const scripts = completed.getElementsByTagName('script')
      assert.strictEqual(scripts.length, 1)
      assert.strictEqual(scripts[0].attr.src, 'override.js')
      const page = TestHelper.extractDoc(completedHTML)
      const scripts2 = page.getElementsByTagName('script')
      assert.strictEqual(scripts2.length, 1)
      assert.strictEqual(scripts2[0].attr.src, 'include.js')
      return Response.wrapTemplateWithSrcDoc(req, res, doc)
    })

    it('should transfer navigation to template from page', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
          <template id="navbar">
            <a href="#">link 1</a>
            <a href="#">link 2</a>
            <a href="#">link 3</a>
          </template>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      req.packageJSON = {
        dashboard: {
          title: 'Overriden Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Overriden Template Title</title>
              <script src="override.js"></script>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const navigation = completed.getElementById('navigation')
      const links = navigation.getElementsByTagName('a')
      assert.strictEqual(links.length, 3)
      assert.strictEqual(links[0].parentNode.tag, 'nav')
      const scripts = completed.getElementsByTagName('script')
      assert.strictEqual(scripts.length, 1)
      assert.strictEqual(scripts[0].attr.src, 'override.js')
    })

    it('should transfer title to page from template', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      req.packageJSON = {
        dashboard: {
          title: 'Overriden Template Title',
          content: [],
          templateHTML: `
          <html>
            <head>
              <title>Overriden Template Title</title>
              <script src="override.js"></script>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const titles = completed.getElementsByTagName('title')
      assert.strictEqual(titles.length, 1)
      assert.strictEqual(titles[0].child[0].text, 'Hardcoded Page Title')
      const scripts = completed.getElementsByTagName('script')
      assert.strictEqual(scripts.length, 1)
      assert.strictEqual(scripts[0].attr.src, 'override.js')
    })

    it('should remove menus for guests', async () => {
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      req.packageJSON = {
        dashboard: {
          title: 'Overriden Template Title',
          content: [],
          menus: {
            administrator: [],
            account: []
          },
          templateHTML: `
          <html>
            <head>
              <title>Overriden Template Title</title>
              <script src="override.js"></script>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const menus = completed.getElementsByTagName('menu')
      assert.strictEqual(menus.length, 0)
      const scripts = completed.getElementsByTagName('script')
      assert.strictEqual(scripts.length, 1)
      assert.strictEqual(scripts[0].attr.src, 'override.js')
    })

    it('should disable administrator menu for normal user', async () => {
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      req.packageJSON = {
        dashboard: {
          title: 'Overriden Template Title',
          content: [],
          menus: {
            administrator: [],
            account: []
          },
          templateHTML: `
          <html>
            <head>
              <title>Overriden Template Title</title>
              <script src="override.js"></script>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const user = await TestHelper.createUser()
      req.account = user.account
      req.session = user.session
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const administratorMenu = completed.getElementById('administrator-menu-container')
      assert.strictEqual(administratorMenu.attr.style.join(' '), 'display: none')
      const scripts = completed.getElementsByTagName('script')
      assert.strictEqual(scripts.length, 1)
      assert.strictEqual(scripts[0].attr.src, 'override.js')
    })

    it('should add account menu links from package.json', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          menus: {
            account: [
              '<a href="/">Ignore this link</a>'
            ]
          },
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest('/account/sessions')
      req.account = user.account
      req.session = user.session
      req.packageJSON = {
        dashboard: {
          title: 'Overriden Template Title',
          content: [],
          menus: {
            account: [
              '<a href="/">Embed this link</a>'
            ]
          },
          templateHTML: `
          <html>
            <head>
              <title>Overriden Template Title</title>
              <script src="override.js"></script>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const accountMenu = completed.getElementById('account-menu-container')
      const links = accountMenu.getElementsByTagName('a')
      assert.strictEqual(links.length, 1)
      assert.strictEqual(links[0].child[0].text, 'Embed this link')
      const scripts = completed.getElementsByTagName('script')
      assert.strictEqual(scripts.length, 1)
      assert.strictEqual(scripts[0].attr.src, 'override.js')
    })

    it('should add administrator menu links from package.json', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [],
          menus: {
            administrator: [
              '<a href="/">Ignore this link</a>'
            ]
          },
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const administrator = await TestHelper.createOwner()
      const req = TestHelper.createRequest('/account/sessions')
      req.account = administrator.account
      req.session = administrator.session
      req.packageJSON = {
        dashboard: {
          title: 'Overriden Template Title',
          content: [],
          menus: {
            administrator: [
              '<a href="/">Embed this link</a>'
            ]
          },
          templateHTML: `
          <html>
            <head>
              <title>Overriden Template Title</title>
              <script src="override.js"></script>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const res = { setHeader: () => { } }
      const completedHTML = await Response.wrapTemplateWithSrcDoc(req, res, doc)
      const completed = HTML.parse(completedHTML)
      const administratorMenu = completed.getElementById('administrator-menu-container')
      const links = administratorMenu.getElementsByTagName('a')
      assert.strictEqual(links.length, 1)
      assert.strictEqual(links[0].child[0].text, 'Embed this link')
      const scripts = completed.getElementsByTagName('script')
      assert.strictEqual(scripts.length, 1)
      assert.strictEqual(scripts[0].attr.src, 'override.js')
    })

    it('should execute "page" handlers on the rendered page', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [
            {
              page: async (req, res, pageDoc) => {
                req.executedPageRequest = true
              }
            }
          ],
          menus: {
            administrator: [],
            account: []
          },
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      const res = { setHeader: () => { } }
      await Response.wrapTemplateWithSrcDoc(req, res, doc)
      assert.strictEqual(req.executedPageRequest, true)
    })

    it('should execute "template" handlers on the rendered + page-merged template', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [
            {
              template: async (req, res, templateDoc) => {
                req.executedTemplateRequest = true
              }
            }
          ],
          menus: {
            administrator: [],
            account: []
          },
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      const res = { setHeader: () => { } }
      await Response.wrapTemplateWithSrcDoc(req, res, doc)
      assert.strictEqual(req.executedTemplateRequest, true)
    })

    it('should execute "page" and "template" handlers on the rendered + page-merged template', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [
            {
              page: async (req, res, pageDoc) => {
                req.executedPageRequest = true
              },
              template: async (req, res, templateDoc) => {
                req.executedTemplateRequest = true
              }
            }
          ],
          menus: {
            administrator: [],
            account: []
          },
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      const res = { setHeader: () => { } }
      await Response.wrapTemplateWithSrcDoc(req, res, doc)
      assert.strictEqual(req.executedTemplateRequest, true)
    })

    it('should execute each content handler', async () => {
      global.packageJSON = {
        dashboard: {
          title: 'Global Template Title',
          content: [
            {
              page: async (req, res, pageDoc) => {
                req.executedPageRequest = true
              }
            }, {
              template: async (req, res, templateDoc) => {
                req.executedTemplateRequest = true
              }
            }
          ],
          menus: {
            administrator: [],
            account: []
          },
          templateHTML: `
          <html>
            <head>
              <title>Hardcoded Template Title</title>
            </head>
            <body>
              <header id="heading"></header>
              <div id="administrator-menu-container"><menu id="administrator-menu"></menu></div>
              <div id="account-menu-container"><menu id="account-menu"></menu></div>
              <nav id="navigation"></nav>
              <div id="spillage"></div>
              <iframe id="application-iframe"></iframe>
              <template id="heading-link"><a href="\${link.href}">\${link.text}</a></template>
              <template id="menu-link"><a href="\${link.href}">\${link.text}</a></template>
            </body>
          </html>`
        }
      }
      const doc = HTML.parse(`
      <html>
        <head>
          <title>Hardcoded Page Title</title>
        </head>
        <body>Body</body>
      </html>`)
      const req = TestHelper.createRequest('/account/sessions')
      const res = { setHeader: () => { } }
      await Response.wrapTemplateWithSrcDoc(req, res, doc)
      assert.strictEqual(req.executedTemplateRequest, true)
      assert.strictEqual(req.executedPageRequest, true)
    })
  })

  describe('Response#throw404', () => {
    it('should set 404 status', async () => {
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(res.statusCode, 404)
        }
      }
      return Response.throw404({}, res)
    })

    it('should contain 404 code', async () => {
      const res = {
        setHeader: () => {
        },
        end: (html) => {
          assert.strictEqual(html.indexOf('404') > -1, true)
        }
      }
      return Response.throw404({}, res)
    })

    it('should contain 404 error', async () => {
      const res = {
        setHeader: () => {
        },
        end: (html) => {
          assert.strictEqual(html.indexOf('Unknown URL or page') > -1, true)
        }
      }
      return Response.throw404({}, res)
    })
  })

  describe('Response#throw500', () => {
    it('should set 500 status', async () => {
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(res.statusCode, 500)
        }
      }
      return Response.throw500({}, res)
    })

    it('should contain 500 code', async () => {
      const res = {
        setHeader: () => {
        },
        end: (html) => {
          assert.strictEqual(html.indexOf('500') > -1, true)
        }
      }
      return Response.throw500({}, res)
    })

    it('should contain error message', async () => {
      const res = {
        setHeader: () => {
        },
        end: (html) => {
          assert.strictEqual(html.indexOf('a huge error happened') > -1, true)
        }
      }
      return Response.throw500({}, res, 'a huge error happened')
    })
  })

  describe('Response#throw511', () => {
    it('should set 511 status', async () => {
      const res = {
        setHeader: () => {
        },
        end: () => {
          assert.strictEqual(res.statusCode, 511)
        }
      }
      return Response.throw511({}, res)
    })

    it('should contain 511 code', async () => {
      const res = {
        setHeader: () => {
        },
        end: (html) => {
          assert.strictEqual(html.indexOf('511') > -1, true)
        }
      }
      return Response.throw511({}, res)
    })
  })
})
