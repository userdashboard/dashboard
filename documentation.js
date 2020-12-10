const fs = require('fs')
const path = require('path')

module.exports = {
  writeAPI,
  writeEnvironment,
  writeSitemap
}

function writeAPI () {
  const testsFilePath = path.join(global.applicationPath, 'tests.txt')
  if (!fs.existsSync(testsFilePath)) {
    return
  }
  let tests = fs.readFileSync(testsFilePath).toString()
  tests = tests.substring(tests.indexOf('\n\n'))
  while (true) {
    const lastTick = tests.lastIndexOf('✓')
    const lastLineBreak = tests.lastIndexOf('\n')
    if (lastLineBreak > lastTick) {
      tests = tests.substring(0, lastLineBreak)
    } else {
      break
    }
  }
  tests = tests.split('\n\n')
  const api = {}
  const categories = ['exceptions', 'receives', 'configuration', 'returns', 'redacts']
  const verbs = ['get', 'post', 'patch', 'pull', 'delete', 'options', 'head']
  for (const test of tests) {
    const item = {
      url: '',
      verb: '',
      auth: '',
      receives: [],
      exceptions: {},
      redacts: [],
      returns: [],
      configuration: []
    }
    const lines = test.split('\n')
    const done = []
    let exception
    for (let line of lines) {
      line = line.trim()
      if (!line) {
        continue
      }
      if (!done.length) {
        item.url = line
        if (!global.sitemap[line]) {
          continue
        }
        item.auth = global.sitemap[item.url].auth !== false
        for (const verb of verbs) {
          if (global.sitemap[line].api[verb]) {
            item.verb = verb
            break
          }
        }
        done.push('url')
        continue
      }
      const type = done[done.length - 1]
      if (!line.startsWith('✓')) {
        if (categories.indexOf(line) > -1) {
          done.push(line)
          continue
        }
        exception = line
        continue
      } else {
        line = line.substring(2)
      }
      if (type === 'exceptions') {
        item.exceptions[exception] = item.exceptions[exception] || []
        item.exceptions[exception].push(line)
        continue
      }
      if (!item[type] || !item[type].push) {
        continue
      }
      item[type].push(line)
    }
    api[item.url] = item
  }
  const sortedURLs = []
  for (const url in api) {
    sortedURLs.push(url)
  }
  sortedURLs.sort()
  let url = global.dashboardServer
  if (global.applicationServer) {
    url += ' (dashboard)\n'
    url += global.applicationServer + ' (application)'
  }
  const output = [
    '@userdashboard/dashboard ' + global.packageJSON.version,
    '\n',
    url,
    '\n'
  ]
  const groups = ['receives', 'returns', 'redacts', 'exceptions', 'configuration', 'override']
  for (const url of sortedURLs) {
    const columns = {}
    const route = api[url]
    if (route.exceptions) {
      const exceptions = []
      for (const key in route.exceptions) {
        exceptions.push(key)
        for (const i in route.exceptions[key]) {
          const reason = route.exceptions[key][i]
          exceptions.push(` * ${reason}`)
          if (reason.startsWith('missing')) {
            const receives = reason.replace('missing', 'required')
            const optional = reason.replace('missing', 'optional')
            if (route.receives.indexOf(optional) === -1) {
              route.receives.unshift(receives)
            }
          }
        }
      }
      route.exceptions = exceptions
    }
    for (const category of groups) {
      if (!route[category] || !route[category].length) {
        continue
      }
      columns[category] = category.length + 4
      for (const entry of route[category]) {
        if (entry.length + 4 > columns[category]) {
          columns[category] = entry.length + 4
        }
      }
    }
    const groupData = {}
    let totalWidth = 0
    for (const key of groups) {
      if (!route[key] || !route[key].length) {
        continue
      }
      groupData[key] = route[key]
      totalWidth += columns[key]
    }
    if (url.length + 4 > totalWidth) {
      for (const key of groups) {
        if (!columns[key]) {
          continue
        }
        columns[key] = url.length + 4
        break
      }
      totalWidth = 0
      for (const key of groups) {
        if (!route[key] || !route[key].length) {
          continue
        }
        totalWidth += columns[key]
      }
    }
    let tallestGroup = 0
    for (const key in groupData) {
      if (groupData[key].length > tallestGroup) {
        tallestGroup = groupData[key].length
      }
    }
    if (tallestGroup === 0) {
      continue
    }
    const topBorder = underlineRight('|', totalWidth)
    const urlLine = padRight('| ' + url, totalWidth)
    output.push('\n' + topBorder + '|\n' + urlLine + '|\n')
    for (const key in groupData) {
      const title = underlineRight('| ' + key.toUpperCase(), columns[key])
      output.push(title)
    }
    output.push('|\n')
    for (let i = 0, len = tallestGroup; i < len; i++) {
      const line = []
      for (const key in groupData) {
        const groupData = route[key]
        if (!groupData || !groupData.length || groupData.length < i || !groupData[i]) {
          const segment = padRight('|', columns[key])
          line.push(segment)
          continue
        }
        const title = padRight('| ' + groupData[i], columns[key])
        line.push(title)
      }
      output.push(line.join('') + '|\n')
    }
    for (const key in groupData) {
      let segment = '|'
      while (segment.length < columns[key]) {
        segment += '-'
      }
      output.push(segment)
    }
    output.push('|\n')
  }
  const filePath = path.join(global.applicationPath, 'api.txt')
  fs.writeFileSync(filePath, output.join(''))
}

function writeEnvironment () {
  const testsFilePath = path.join(global.applicationPath, 'tests.txt')
  if (!fs.existsSync(testsFilePath)) {
    return
  }
  let tests = fs.readFileSync(testsFilePath).toString()
  tests = tests.substring(0, tests.indexOf('internal-api'))
  tests = tests.split('\n')
  let start = false
  const properties = {}
  let lastProperty
  for (const i in tests) {
    const line = tests[i].trim()
    if (!line.length) {
      continue
    }
    if (!start) {
      if (line === 'index') {
        start = true
      }
      continue
    }
    if (line.indexOf(' ') === -1) {
      lastProperty = line
      properties[lastProperty] = {}
      continue
    }
    if (!lastProperty) {
      continue
    }
    if (!properties[lastProperty].description) {
      properties[lastProperty].description = line
      continue
    }
    if (line.indexOf('default') > -1) {
      properties[lastProperty].default = line.substring('✓ default '.length).trim()
      if (!properties[lastProperty].default.length) {
        properties[lastProperty].default = 'unset'
      }
    } else {
      properties[lastProperty].value = line.substring('✓ '.length)
      lastProperty = null
    }
  }
  let maximumPropertySize = 0
  let maximumDescriptionSize = 0
  let maximumValueSize = 0
  let maximumDefaultSize = 0

  for (const property in properties) {
    if (property.length > maximumPropertySize) {
      maximumPropertySize = property.length
    }
    if (properties[property].description && properties[property].description.length > maximumDescriptionSize) {
      maximumDescriptionSize = properties[property].description.length
    }
    let value = properties[property].value || ''
    if (value.indexOf(',') > -1) {
      value = value.split(',').join(', ')
    }
    if (value.length > maximumValueSize) {
      maximumValueSize = value.length
    }
    if (properties[property].default && properties[property].default.length > maximumDefaultSize) {
      maximumDefaultSize = properties[property].default.length
    }
  }
  maximumPropertySize += 4
  maximumDescriptionSize += 2
  maximumValueSize += 2
  maximumDefaultSize += 2
  const output = []
  const sorted = Object.keys(properties).sort()
  sorted.unshift('Environment variable', '')
  properties['Environment variable'] = {
    description: 'Description',
    default: 'Default value',
    value: 'Configured value'
  }
  properties[''] = {
    description: '',
    default: '',
    value: ''
  }
  let dotted
  for (const property of sorted) {
    const delimiter = property === '' ? '-' : ' '
    let propertyPadding = ''
    const description = properties[property].description
    const unset = properties[property].default || ''
    let value = properties[property].value || ''
    if (value.indexOf(',') > -1) {
      value = value.split(',').join(', ')
    }
    while (property.length + propertyPadding.length < maximumPropertySize) {
      propertyPadding += delimiter
    }
    let descriptionPadding = ''
    while (description.length + descriptionPadding.length < maximumDescriptionSize) {
      descriptionPadding += delimiter
    }
    let valuePadding = ''
    while (value.length + valuePadding.length < maximumValueSize) {
      valuePadding += delimiter
    }
    let defaultPadding = ''
    while (unset.length + defaultPadding.length < maximumDefaultSize) {
      defaultPadding += delimiter
    }
    output.push(`|${delimiter}${property}${propertyPadding}${delimiter}|${delimiter}${description}${descriptionPadding}${delimiter}|${delimiter}${unset}${defaultPadding}${delimiter}|${delimiter}${value}${valuePadding}${delimiter}|`)
    if (property === '') {
      dotted = output[output.length - 1]
    }
  }
  output.unshift(dotted)
  output.push(dotted)
  const filePath = path.join(global.applicationPath, 'env.txt')
  fs.writeFileSync(filePath, output.join('\n'))
  return output.join('\n')
}

function writeSitemap () {
  const configuration = parseDashboardConfiguration()
  let widestURL = 'URL  '.length
  let widestHTML = 'HTML  '.length
  let widestJS = 'NODEJS  '.length
  const sortedURLs = []
  for (const url in configuration.urls) {
    sortedURLs.push(url)
    if (url.length > widestURL) {
      widestURL = url.length
    }
    const route = configuration.urls[url]
    if (route.htmlFilePath && trimNodeModulePath(route.htmlFilePath).length + 4 > widestHTML) {
      widestHTML = trimNodeModulePath(route.htmlFilePath).length + 4
    }
    if (route.jsFilePath && trimNodeModulePath(route.jsFilePath).length + 4 > widestJS) {
      widestJS = trimNodeModulePath(route.jsFilePath).length + 4
    }
  }
  sortedURLs.sort()
  let url = global.dashboardServer
  if (global.applicationServer) {
    url += ' (dashboard)\n'
    url += global.applicationServer + ' (application)'
  }
  const output = [
    '@userdashboard/dashboard ' + global.packageJSON.version,
    url
  ]
  output.push('\nAdministrator menu:')
  for (const item of configuration.administrator) {
    output.push(item)
  }
  output.push('\nAccount menu:')
  for (const item of configuration.account) {
    output.push(item)
  }
  output.push('\nSpecial HTML files:',
    trimApplicationPath(configuration.templateHTMLPath),
    trimApplicationPath(configuration.errorHTMLPath),
    trimApplicationPath(configuration.redirectHTMLPath))

  if (configuration.modules.length) {
    output.push('\nDashboard modules:')
    const formatted = []
    for (const item of configuration.modules) {
      formatted.push(`${item.name} (${item.version})`)
    }
    output.push(formatted.join('\n'))
  }
  if (configuration.content.length) {
    output.push('\nContent handlers:')
    for (const item of configuration.content) {
      output.push(item)
    }
  }
  if (configuration.server.length) {
    output.push('\nServer handlers:')
    for (const item of configuration.server) {
      output.push(item)
    }
  }
  if (configuration.proxy.length) {
    output.push('\nProxy handlers:')
    for (const item of configuration.proxy) {
      output.push(item)
    }
  }
  for (const url of sortedURLs) {
    const route = configuration.urls[url]
    const routeURL = padRight(url, widestURL)
    const routeHTML = padRight(route.htmlFilePath ? trimNodeModulePath(route.htmlFilePath) : '', widestHTML)
    const routeJS = padRight(trimNodeModulePath(route.jsFilePath), widestJS)
    const routeVerbs = padRight(route.verbs, 'HTTP REQUESTS  '.length)
    const routeAuth = padRight(route.authDescription, 'AUTH  '.length)
    const routeTemplate = padRight(route.templateDescription, 'TEMPLATE  '.length)
    output.push(`${routeURL} ${routeAuth} ${routeTemplate} ${routeVerbs} ${routeJS} ${routeHTML}`)
  }
  const routeURL = underlineRight('URL ', widestURL)
  const routeAuth = underlineRight('AUTH ', 'AUTH  '.length)
  const routeTemplate = underlineRight('TEMPLATE ', 'TEMPLATE  '.length)
  const routeVerbs = underlineRight('HTTP REQUESTS ', 'HTTP REQUESTS  '.length)
  const routeJS = underlineRight('NODEJS ', widestJS)
  const routeHTML = underlineRight('HTML ', widestHTML)
  output.splice(output.length - sortedURLs.length, 0, `\n${routeURL} ${routeAuth} ${routeTemplate} ${routeVerbs} ${routeJS} ${routeHTML}`)
  const filePath = path.join(global.applicationPath, 'sitemap.txt')
  fs.writeFileSync(filePath, output.join('\n'))
  return output.join('\n')
}

function parseDashboardConfiguration () {
  const configuration = {
    administrator: [],
    account: [],
    modules: [],
    content: [],
    server: [],
    proxy: [],
    urls: {},
    templateHTMLPath: trimApplicationPath(global.packageJSON.dashboard.templateHTMLPath),
    errorHTMLPath: trimApplicationPath(global.packageJSON.dashboard.errorHTMLPath),
    redirectHTMLPath: trimApplicationPath(global.packageJSON.dashboard.redirectHTMLPath)
  }
  const HTML = require('./src/html.js')
  for (const link of global.packageJSON.dashboard.menus.administrator) {
    const item = HTML.parse(`<div>${link}</div>`).child[0]
    if (!item.attr) {
      continue
    }
    let text = item.toString()
    text = text.substring(text.indexOf('>') + 1)
    text = text.substring(0, text.indexOf('</a>'))
    text = text.replace('&amp;', '&')
    if (item.attr['data-module']) {
      configuration.administrator.push(item.attr['data-module'] + '/src/www' + item.attr.href + ' "' + text + '"')
    } else {
      configuration.administrator.push(item.attr.href + ' "' + text + '"')
    }
  }
  for (const link of global.packageJSON.dashboard.menus.account) {
    const item = HTML.parse(`<div>${link}</div>`).child[0]
    if (!item.attr) {
      continue
    }
    let text = item.toString()
    text = text.substring(text.indexOf('>') + 1)
    text = text.substring(0, text.indexOf('</a>'))
    text = text.replace('&amp;', '&')
    if (item.attr['data-module']) {
      configuration.account.push(item.attr['data-module'] + '/src/www' + item.attr.href + ' "' + text + '"')
    } else {
      configuration.account.push(item.attr.href + ' "' + text + '"')
    }
  }
  if (global.packageJSON.dashboard.moduleNames.length) {
    for (const i in global.packageJSON.dashboard.moduleNames) {
      const name = global.packageJSON.dashboard.moduleNames[i]
      const version = global.packageJSON.dashboard.moduleVersions[i]
      configuration.modules.push({ name, version })
    }
  }
  if (global.packageJSON.dashboard.contentFilePaths.length) {
    for (const item of global.packageJSON.dashboard.contentFilePaths) {
      configuration.content.push(item[0] === '@' ? item : trimApplicationPath(item))
    }
  }
  if (global.packageJSON.dashboard.serverFilePaths.length) {
    for (const item of global.packageJSON.dashboard.serverFilePaths) {
      configuration.server.push(item[0] === '@' ? item : trimApplicationPath(item))
    }
  }
  if (global.packageJSON.dashboard.proxyFilePaths.length) {
    for (const item of global.packageJSON.dashboard.proxyFilePaths) {
      configuration.proxy.push(item[0] === '@' ? item : trimApplicationPath(item))
    }
  }
  const httpVerbs = ['DELETE', 'HEAD', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
  for (const url in global.sitemap) {
    const route = global.sitemap[url]
    const item = configuration.urls[url] = {}
    item.htmlFilePath = route.htmlFilePath
    item.jsFilePath = route.jsFilePath
    item.templateDescription = route.template === false ? 'FULLSCREEN' : ''
    item.verbs = ''
    if (url.startsWith('/api/')) {
      item.authDescription = route.api.auth === false ? 'GUEST' : ''
      const verbs = []
      for (const verb of httpVerbs) {
        if (route.api[verb.toLowerCase()]) {
          verbs.push(verb)
        }
      }
      item.verbs = verbs.join(' ')
    } else {
      item.authDescription = route.auth === false ? 'GUEST' : ''
      const verbs = []
      if (route.jsFilePath === 'static-page') {
        verbs.push('GET')
      } else {
        const pageFile = route.api
        for (const verb of httpVerbs) {
          if (pageFile[verb.toLowerCase()]) {
            verbs.push(verb)
          }
        }
      }
      item.verbs = verbs.join(' ')
    }
  }
  return configuration
}

function trimApplicationPath (str) {
  if (!str) {
    return 'static-page'
  }
  if (str.startsWith('/src/www/')) {
    return '/src/www'
  }
  if (!str.startsWith(global.applicationPath)) {
    return str
  }
  const trimmed = str.substring(global.applicationPath.length)
  if (trimmed.startsWith('/node_modules/')) {
    return trimNodeModulePath(trimmed)
  }
  return trimmed
}

function trimNodeModulePath (str) {
  if (!str) {
    return 'static-page'
  }
  if (str.indexOf('/src/www/') === 0) {
    return '/src/www'
  }
  return str.substring('/node_modules/'.length).split('/src/www')[0]
}

function padRight (str, totalSize) {
  const blank = '                                                                                                                                                                                                                                                        '
  return (str + blank).substring(0, totalSize)
}

function underlineRight (str, totalSize) {
  const blank = '--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------'
  return (str + blank).substring(0, totalSize)
}
