const fs = require('fs')
const path = require('path')
const HTML = require('./html.js')

module.exports = {
  generate,
  write
}

function generate () {
  const routes = {}
  let dashboardModulePath
  try {
    dashboardModulePath = require.resolve('@userdashboard/dashboard')
  } catch (error) {
  }
  if (dashboardModulePath) {
    const dashboardWWWPath = dashboardModulePath.substring(0, dashboardModulePath.indexOf('@userdashboard/dashboard') + '@userdashboard/dashboard'.length)
    attachRoutes(routes, path.join(dashboardWWWPath, 'src/www'))
  }
  for (const moduleName of global.packageJSON.dashboard.moduleNames) {
    const modulePath = require.resolve(moduleName)
    const moduleWWWPath = modulePath.substring(0, modulePath.indexOf(moduleName) + moduleName.length)
    attachRoutes(routes, path.join(moduleWWWPath, 'src/www'))
  }
  attachRoutes(routes, path.join(global.applicationPath, 'src/www'))
  if (process.env.APPLICATION_SERVER) {
    const rootIndexPageExists = fs.existsSync(`${global.applicationPath}/src/www/index.html`)
    if (!rootIndexPageExists) {
      delete (routes['/'])
    }
    const rootHomePageExists = fs.existsSync(`${global.applicationPath}/src/www/home.html`)
    if (!rootHomePageExists) {
      delete (routes['/home'])
    }
  }
  return routes
}

function attachRoutes (routes, folderPath) {
  if (!fs.existsSync(folderPath)) {
    return routes
  }
  if (folderPath.endsWith('/src/www/public')) {
    return routes
  }
  const apiOnly = folderPath.indexOf('/api/') > -1
  const folderContents = fs.readdirSync(folderPath)
  for (const file of folderContents) {
    const filePath = `${folderPath}/${file}`
    if (filePath.indexOf('navbar') !== -1 || filePath.endsWith('.test.js')) {
      continue
    }
    if (!filePath.endsWith('.html') && !filePath.endsWith('.js')) {
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        attachRoutes(routes, filePath)
        continue
      }
      continue
    }
    const htmlFilePath = filePath.substring(0, filePath.lastIndexOf('.')) + '.html'
    const htmlFileExists = fs.existsSync(htmlFilePath)
    const jsFilePath = filePath.substring(0, filePath.lastIndexOf('.')) + '.js'
    const jsFileExists = fs.existsSync(jsFilePath)
    if (filePath.endsWith('.js') && htmlFileExists) {
      continue
    }
    const api = jsFileExists ? require(jsFilePath) : 'static-page'
    if (api !== 'static-page' && !api.get && !api.post && !api.patch && !api.delete && !api.put) {
      continue
    }
    const html = htmlFileExists ? fs.readFileSync(htmlFilePath).toString() : null
    const extension = apiOnly ? '.js' : '.html'
    const index = `index${extension}`
    let folderStem = folderPath.substring(global.applicationPath.length)
    if (folderStem.indexOf('src/www') > -1) {
      folderStem = folderStem.substring(folderStem.indexOf('src/www') + 'src/www'.length)
    }
    let urlKey = folderStem + (file === index ? '' : '/' + file.substring(0, file.lastIndexOf('.')))
    if (urlKey === '') {
      urlKey = '/'
    }
    if (routes[urlKey]) {
      if (jsFileExists) {
        routes[urlKey].jsFilePath = jsFilePath.substring(global.applicationPath.length)
        routes[urlKey].api = require(jsFilePath)
      }
      if (htmlFileExists) {
        routes[urlKey].htmlFilePath = htmlFilePath.substring(global.applicationPath.length)
        routes[urlKey].html = fs.readFileSync(htmlFilePath).toString()
      }
      continue
    }
    let template = true
    let auth = api && api.auth === false ? api.auth : true
    let navbar = ''
    if (!apiOnly && html) {
      const settings = readHTMLAttributes(html)
      template = settings.template
      if (settings.auth !== false) {
        auth = true
      } else {
        auth = false
      }
      navbar = settings.navbar
    }
    routes[urlKey] = {
      htmlFileExists,
      htmlFilePathFull: htmlFilePath,
      htmlFilePath: htmlFileExists ? htmlFilePath.substring(global.applicationPath.length) : null,
      html,
      jsFileExists,
      jsFilePathFull: jsFilePath,
      jsFilePath: jsFileExists ? jsFilePath.substring(global.applicationPath.length) : 'static-page',
      template,
      auth,
      navbar,
      api,
      reload: () => {
        if (jsFileExists) {
          delete require.cache[require.resolve(jsFilePath)]
          routes[urlKey].api = require(jsFilePath)
        }
        if (htmlFileExists) {
          routes[urlKey].html = fs.readFileSync(htmlFilePath).toString()
        }
      }
    }
  }
  return routes
}

function readHTMLAttributes (html) {
  let htmlTag = html.substring(html.indexOf('<html'))
  htmlTag = htmlTag.substring(0, htmlTag.indexOf('>')).toLowerCase()
  const template = htmlTag.indexOf('data-template="false"') === -1 && htmlTag.indexOf("data-template='false'") === -1
  const auth = htmlTag.indexOf('data-auth="false"') === -1 && htmlTag.indexOf("data-auth='false'") === -1
  const navbar = htmlTag.indexOf('data-navbar=') > -1
  return { template, auth, navbar }
}

function write () {
  const configuration = parseDashboardConfiguration()
  let widestURL = 0
  let widestHTML = 0
  let widestJS = 0
  let widestAuth = 0
  let widestTemplate = 0
  let widestVerbs = 0
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
  if ('URL  '.length > widestURL) {
    widestURL = 'URL  '.length
  }
  if ('AUTH  '.length > widestAuth) {
    widestAuth = 'AUTH  '.length
  }
  if ('TEMPLATE    '.length > widestTemplate) {
    widestTemplate = 'TEMPLATE  '.length
  }
  if ('HTTP REQUESTS  '.length > widestVerbs) {
    widestVerbs = 'HTTP REQUESTS  '.length
  }
  if ('NODEJS  '.length > widestJS) {
    widestJS = 'NODEJS  '.length
  }
  if ('HTML  '.length > widestHTML) {
    widestHTML = 'HTML  '.length
  }
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
    const routeVerbs = padRight(route.verbs, widestVerbs)
    const routeAuth = padRight(route.authDescription, widestAuth)
    const routeTemplate = padRight(route.templateDescription, widestTemplate)
    output.push(`${routeURL} ${routeAuth} ${routeTemplate} ${routeVerbs} ${routeJS} ${routeHTML}`)
  }
  const routeURL = underlineRight('URL ', widestURL)
  const routeAuth = underlineRight('AUTH ', widestAuth)
  const routeTemplate = underlineRight('TEMPLATE ', widestTemplate)
  const routeVerbs = underlineRight('HTTP REQUESTS ', widestVerbs)
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
