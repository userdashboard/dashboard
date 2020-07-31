/* eslint-env mocha */
const assert = require('assert')
const HTML = require('./html.js')

describe('internal-api/html', () => {
  describe('HTML#parseHTML', () => {
    it('should reject invalid strings', async () => {
      let errorMessage
      try {
        HTML.parse(null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-html')
      errorMessage = null
      try {
        HTML.parse('{ "invalid": true }')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-html')
    })

    it('should return expected contents', async () => {
      const html = '<div><input type="text"/></div>'
      const json = {
        node: 'element',
        tag: 'div',
        child: [
          {
            node: 'element',
            tag: 'input',
            attr: {
              type: 'text'
            }
          }
        ]
      }
      const div = HTML.parse(html)
      const input = div.child[0]
      assert.strictEqual(input.tag, json.child[0].tag)
      assert.strictEqual(input.attr.type, json.child[0].attr.type)
    })
  })

  describe('HTML#findOrCreateTableBody', () => {
    it('should require a document', async () => {
      let errorMessage
      try {
        HTML.findOrCreateTableBody(null, 'table')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-document')
    })

    it('should require a table', async () => {
      const emptyTableHTML = '<html><body><table id="table"></table></body></html>'
      const doc = HTML.parse(emptyTableHTML)
      let errorMessage
      try {
        HTML.findOrCreateTableBody(doc, null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-table')
    })

    it('should accept table ids', async () => {
      const emptyTableHTML = '<html><body><table id="table"></table></body></html>'
      const doc = HTML.parse(emptyTableHTML)
      assert.strictEqual(HTML.findOrCreateTableBody(doc, 'table').tag, 'tbody')
    })

    it('should return existing TBODY', async () => {
      const tableWithTBODYTagHTML = '<html><body><table id="table"><tbody id="existing-tbody"></tbody></table></body></html>'
      const doc = HTML.parse(tableWithTBODYTagHTML)
      const tbody = HTML.findOrCreateTableBody(doc, 'table')
      assert.strictEqual(tbody.attr.id, 'existing-tbody')
    })

    it('should create new TBODY as last child of table', async () => {
      const tableWithTRTagHTML = '<html><body><table id="table"><tr><th>heading</th></tr></table></body></html>'
      const doc = HTML.parse(tableWithTRTagHTML)
      const tbody = HTML.findOrCreateTableBody(doc, 'table')
      assert.strictEqual(tbody.tag, 'tbody')
    })
  })

  describe('HTML#renderTable', () => {
    it('should require a document', async () => {
      let errorMessage
      try {
        HTML.renderTable(null, [{ object: 'thing' }], 'template', 'table')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-document')
    })

    it('should require a table', async () => {
      const tableWithTRTagHTML = '<html><body><table id="table"><tr><th>heading</th></tr></table></body></html>'
      const doc = HTML.parse(tableWithTRTagHTML)
      let errorMessage
      try {
        HTML.renderTable(doc, [{ object: 'thing' }], 'template', null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-parent')
    })

    it('should require a template', async () => {
      const tableWithTRTagHTML = '<html><body><table id="table"><tr><th>heading</th></tr></table></body></html>'
      const doc = HTML.parse(tableWithTRTagHTML)
      let errorMessage
      try {
        HTML.renderTable(doc, [{ object: 'thing' }], null, 'table')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-template')
    })

    it('should require a dataset', async () => {
      const tableWithTRTagHTML = '<html><body><table id="table"><tr><th>heading</th></tr></table></body></html>'
      const doc = HTML.parse(tableWithTRTagHTML)
      let errorMessage
      try {
        HTML.renderTable(doc, null, 'template', 'table')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-data')
    })

    it('should create TR for each item', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <table id="data-table">
          <tr>
            <th>Value</th>
          </tr>
          </table>
          <template id="row">
            <tr>
              <td>\${thing.value}</td>
            </tr>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      const dataSet = [
        { object: 'thing', value: 'a piece of data' },
        { object: 'thing', value: 'another piece of data' },
        { object: 'thing', value: 'one last piece' }
      ]
      HTML.renderTable(doc, dataSet, 'row', 'data-table')
      const table = doc.getElementById('data-table')
      assert.strictEqual(table.child.length, 2)
      assert.strictEqual(table.child[1].child.length, dataSet.length)
    })

    it('should alternate TR class', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <table id="data-table">
          <tr>
            <th>Value</th>
          </tr>
          </table>
          <template id="row">
            <tr>
            <td>\${thing.value}</td>
            </tr>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      const dataSet = [
        { object: 'thing', value: 'a piece of data' },
        { object: 'thing', value: 'another piece of data' }
      ]
      HTML.renderTable(doc, dataSet, 'row', 'data-table')
      const table = doc.getElementById('data-table')
      let lastRow = null
      for (let i = 0, len = table.child[0].child.length; i < len; i++) {
        const row = table.child[0].child[i]
        const rowClass = row.attr ? row.attr.class || '' : ''
        assert.notStrictEqual(rowClass, lastRow)
        lastRow = rowClass
      }
    })

    it('should contain expected data', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <table id="data-table">
            <tr>
              <th>Value</th>
            </tr>
          </table>
          <template id="row">
            <tr>
              <td>\${thing.value}</td>
            </tr>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      const dataSet = [
        { object: 'thing', value: 'a piece of data' },
        { object: 'thing', value: 'another piece of data' }
      ]
      HTML.renderTable(doc, dataSet, 'row', 'data-table')
      const table = doc.getElementById('data-table')
      const tbody = table.child[1]
      for (let i = 0, len = tbody.child.length; i < len; i++) {
        const row = tbody.child[i]
        const cell = row.child[0]
        const cellText = cell.child[0].text
        assert.strictEqual(cellText, dataSet[i].value)
      }
    })
  })

  describe('HTML#renderList', () => {
    it('should require a document', async () => {
      let errorMessage
      try {
        HTML.renderTable(null, [{ object: 'thing' }], 'template', 'ul')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-document')
    })

    it('should require a list', async () => {
      const listHTML = '<html><body><ul id="list"></ul></body></html>'
      const doc = HTML.parse(listHTML)
      let errorMessage
      try {
        HTML.renderTable(doc, [{ object: 'thing' }], 'template', null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-parent')
    })

    it('should require a template', async () => {
      const listHTML = '<html><body><ul id="list"></ul></body></html>'
      const doc = HTML.parse(listHTML)
      let errorMessage
      try {
        HTML.renderTable(doc, [{ object: 'thing' }], null, 'list')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-template')
    })

    it('should require a dataset', async () => {
      const listHTML = '<html><body><ul id="list"></ul><template id="template"><li>some text</li></template></body></html>'
      const doc = HTML.parse(listHTML)
      let errorMessage
      try {
        HTML.renderTable(doc, null, 'template', 'list')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-data')
    })

    it('should create LI for each item', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <ul id="data-list"></ul>
          <template id="item">
            <li>\${thing.value}</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      const dataSet = [
        { object: 'thing', value: 'a list item' },
        { object: 'thing', value: 'one other item' },
        { object: 'thing', value: 'red' },
        { object: 'thing', value: 'blue' }
      ]
      HTML.renderList(doc, dataSet, 'item', 'data-list')
      const list = doc.getElementById('data-list')
      assert.strictEqual(list.child.length, dataSet.length)
    })

    it('should contain expected data', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <ul id="data-list"></ul>
          <template id="item">
            <li>\${thing.value}</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      const dataSet = [
        { object: 'thing', value: 'a piece of data' },
        { object: 'thing', value: 'another piece of data' }
      ]
      HTML.renderList(doc, dataSet, 'item', 'data-list')
      const list = doc.getElementById('data-list')
      for (let i = 0, len = list.child.length; i < len; i++) {
        const li = list.child[i]
        const cellText = li.child[0].text
        assert.strictEqual(cellText, dataSet[i].value)
      }
    })
  })

  describe('HTML#renderTemplate', () => {
    it('should require a document', async () => {
      let errorMessage
      try {
        HTML.renderTemplate(null, {}, 'template', 'parent')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-document')
    })

    it('should not require a data object', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <div id="parent"></div>
          <template id="template">
            <li>some text</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      let errorMessage
      try {
        HTML.renderTemplate(doc, {}, 'template', 'parent')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, undefined)
    })

    it('should require a template', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <div id="parent"></div>
          <template id="template">
            <li>\${thing.value}</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      let errorMessage = null
      try {
        HTML.renderTemplate(doc, {}, null, 'parent')
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-template')
    })

    it('should require a parent element', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <div id="parent"></div>
          <template id="template">
            <li>\${thing.value}</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      let errorMessage = null
      try {
        HTML.renderTemplate(doc, {}, 'template', null)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-parent')
    })

    it('should append contents to parent element', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <div id="parent"></div>
          <template id="template">
            <li>\${thing.value}</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      const data = { object: 'thing', value: 'a list item' }
      HTML.renderTemplate(doc, data, 'template', 'parent')
      const parent = doc.getElementById('parent')
      assert.strictEqual(parent.child[0].child[0].text, data.value)
    })
  })

  describe('HTML#renderPagination', () => {
    it('should require a document', async () => {
      let errorMessage
      try {
        HTML.renderPagination(null, 0, 0)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-document')
    })

    it('should require a total greater than 0', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <ul id="page-links"></ul>
          <template id="page-link">
            <li>\${page.pageNumber}</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      let errorMessage
      try {
        HTML.renderPagination(doc, 0, 0)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-total')
    })

    it('should require an offset less than total', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <ul id="page-links"></ul>
          <template id="page-link">
            <li>\${page.pageNumber}</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      let errorMessage
      try {
        HTML.renderPagination(doc, 1, 1)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, 'invalid-total')
    })

    it('should accept null or string offset', async () => {
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <ul id="page-links"></ul>
          <template id="page-link">
            <li>\${page.pageNumber}</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      let errorMessage
      try {
        HTML.renderPagination(doc, null, 100)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, undefined)
      try {
        HTML.renderPagination(doc, '0', 100)
      } catch (error) {
        errorMessage = error.message
      }
      assert.strictEqual(errorMessage, undefined)
    })

    it('should enforce global page size', async () => {
      global.pageSize = 3
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <ul id="page-links"></ul>
          <template id="page-link">
            <li>\${page.pageNumber}</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      const dataSet = [
        { object: 'thing', value: 'data 1' },
        { object: 'thing', value: 'data 2' },
        { object: 'thing', value: 'data 3' },
        { object: 'thing', value: 'data 4' },
        { object: 'thing', value: 'data 5' },
        { object: 'thing', value: 'data 6' },
        { object: 'thing', value: 'data 7' },
        { object: 'thing', value: 'data 8' },
        { object: 'thing', value: 'data 9' }
      ]
      HTML.renderPagination(doc, 0, dataSet.length)
      const list = doc.getElementById('page-links')
      assert.strictEqual(list.child.length, 3)
    })

    it('should override global page size', async () => {
      global.pageSize = 1
      const htmlString = `<html>
          <head>
            <title>A page</title>
          </head>
          <body>
          <ul id="page-links"></ul>
          <template id="page-link">
            <li>\${page.pageNumber}</li>
          </template>
          </body>
        </html>`
      const doc = HTML.parse(htmlString)
      const dataSet = [
        { object: 'thing', value: 'data 1' },
        { object: 'thing', value: 'data 2' },
        { object: 'thing', value: 'data 3' },
        { object: 'thing', value: 'data 4' },
        { object: 'thing', value: 'data 5' },
        { object: 'thing', value: 'data 6' },
        { object: 'thing', value: 'data 7' },
        { object: 'thing', value: 'data 8' }
      ]
      HTML.renderPagination(doc, 0, dataSet.length, 4)
      const list = doc.getElementById('page-links')
      assert.strictEqual(list.child.length, 2)
    })
  })
})
