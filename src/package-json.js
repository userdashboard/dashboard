const fs = require('fs')
const path = require('path')
const Log = require('./log.js')('package-json')

module.exports = {
  merge,
  mergeTitle,
  mergeScriptArray,
  mergeModuleArray,
  mergeMenuLinks,
  mergeSpecialHTML
}

function merge (applicationJSON, dashboardJSON) {
  applicationJSON = applicationJSON || loadApplicationJSON(applicationJSON)
  if (applicationJSON && applicationJSON.name === '@userdashboard/dashboard') {
    dashboardJSON = applicationJSON
    applicationJSON = null
  } else {
    dashboardJSON = dashboardJSON || loadModuleFile('@userdashboard/dashboard', 'package.json')
  }
  const packageJSON = {
    version: dashboardJSON.version,
    dashboard: {
      server: [],
      serverFilePaths: [],
      content: [],
      contentFilePaths: [],
      proxy: [],
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
  mergeTitle(packageJSON, dashboardJSON, applicationJSON)
  if (dashboardJSON && dashboardJSON.dashboard) {
    mergeScriptArray(packageJSON, dashboardJSON, 'content')
    mergeScriptArray(packageJSON, dashboardJSON, 'server')
    mergeScriptArray(packageJSON, dashboardJSON, 'proxy')
    mergeModuleArray(packageJSON, dashboardJSON)
  }
  if (applicationJSON && applicationJSON.dashboard) {
    mergeScriptArray(packageJSON, applicationJSON, 'content')
    mergeScriptArray(packageJSON, applicationJSON, 'server')
    mergeScriptArray(packageJSON, applicationJSON, 'proxy')
    mergeModuleArray(packageJSON, applicationJSON)
  }
  mergeSpecialHTML(packageJSON, '@userdashboard/dashboard')
  mergeSpecialHTML(packageJSON)
  mergeMenuLinks(packageJSON)
  for (const moduleName of packageJSON.dashboard.modules) {
    mergeMenuLinks(packageJSON, moduleName)
  }
  mergeMenuLinks(packageJSON, '@userdashboard/dashboard')
  return packageJSON
}

function mergeTitle (packageJSON, dashboardJSON, applicationJSON) {
  if (applicationJSON && applicationJSON.dashboard) {
    packageJSON.dashboard.title = applicationJSON.dashboard.title
  }
  if (dashboardJSON && dashboardJSON.dashboard) {
    packageJSON.dashboard.title = packageJSON.dashboard.title || dashboardJSON.dashboard.title
  }
}

function mergeSpecialHTML (baseJSON, moduleName) {
  const files = ['error.html', 'redirect.html', 'template.html']
  if (!moduleName) {
    for (const file of files) {
      const rootFilePath = `${global.applicationPath}/${file}`
      if (fs.existsSync(rootFilePath)) {
        const key = file.replace('.html', 'HTML')
        baseJSON.dashboard[`${key}Path`] = rootFilePath
        baseJSON.dashboard[key] = fs.readFileSync(rootFilePath).toString()
      }
    }
    return
  }
  for (const file of files) {
    let filePath
    try {
      filePath = require.resolve(`${moduleName}/${file}`)
    } catch (error) {
    }
    if (filePath) {
      const key = file.replace('.html', 'HTML')
      baseJSON.dashboard[`${key}Path`] = filePath
      baseJSON.dashboard[key] = fs.readFileSync(filePath).toString()
    }
  }
}

function mergeMenuLinks (baseJSON, moduleName) {
  if (!moduleName) {
    const rootAccountMenuHTMLPath = `${global.applicationPath}/menu-account.html`
    if (fs.existsSync(rootAccountMenuHTMLPath)) {
      baseJSON.dashboard.menus.account.push(fs.readFileSync(rootAccountMenuHTMLPath).toString())
    }
    const rootAdministratorMenuHTMLPath = `${global.applicationPath}/menu-administrator.html`
    if (fs.existsSync(rootAdministratorMenuHTMLPath)) {
      baseJSON.dashboard.menus.administrator.push(fs.readFileSync(rootAdministratorMenuHTMLPath).toString())
    }
    return
  }
  let moduleAccountMenuHTMLPath
  try {
    moduleAccountMenuHTMLPath = require.resolve(`${moduleName}/menu-account.html`)
  } catch (error) {
  }
  if (moduleAccountMenuHTMLPath) {
    baseJSON.dashboard.menus.account.push(fs.readFileSync(moduleAccountMenuHTMLPath).toString())
  }
  let moduleAdministratorMenuHTMLPath
  try {
    moduleAdministratorMenuHTMLPath = require.resolve(`${moduleName}/menu-administrator.html`)
  } catch (error) {
  }
  if (moduleAdministratorMenuHTMLPath) {
    baseJSON.dashboard.menus.administrator.push(fs.readFileSync(moduleAdministratorMenuHTMLPath).toString())
  }
}

function mergeScriptArray (baseJSON, otherJSON, scriptType) {
  if (!otherJSON.dashboard[scriptType] || !otherJSON.dashboard[scriptType].length) {
    return baseJSON
  }
  for (const i in otherJSON.dashboard[scriptType]) {
    const relativePath = otherJSON.dashboard[scriptType][i]
    if (baseJSON.dashboard[scriptType].indexOf(relativePath) > -1) {
      continue
    }
    if (process.env.NODE_ENV === 'testing' && !otherJSON.name) {
      baseJSON.dashboard[scriptType].push(relativePath)
      baseJSON.dashboard[`${scriptType}FilePaths`].push(relativePath)
      continue
    }
    baseJSON.dashboard[scriptType].push(loadModuleFile(otherJSON.name, relativePath))
    baseJSON.dashboard[`${scriptType}FilePaths`].push(relativePath)
  }
}

function mergeModuleArray (baseJSON, otherJSON) {
  if (!otherJSON.dashboard.modules || !otherJSON.dashboard.modules.length) {
    return
  }
  for (const i in otherJSON.dashboard.modules) {
    const moduleName = otherJSON.dashboard.modules[i]
    if (moduleName === '@userdashboard/dashboard') {
      continue
    }
    if (otherJSON && moduleName === otherJSON.name) {
      continue
    }
    if (baseJSON.dashboard.modules.indexOf(moduleName) > -1) {
      continue
    }
    const moduleJSON = loadModuleFile(moduleName, 'package.json')
    if (!moduleJSON) {
      throw new Error('invalid-module')
    }
    baseJSON.dashboard.modules.push(moduleName)
    baseJSON.dashboard.modules.push(loadModule(moduleName))
    baseJSON.dashboard.moduleNames.push(moduleName)
    baseJSON.dashboard.moduleVersions.push(moduleJSON.version)
    mergeScriptArray(baseJSON, moduleJSON, 'content')
    mergeScriptArray(baseJSON, moduleJSON, 'server')
    mergeScriptArray(baseJSON, moduleJSON, 'proxy')
    mergeSpecialHTML(baseJSON, moduleName)
    mergeModuleArray(baseJSON, moduleJSON)
  }
}

function loadApplicationJSON () {
  const filePath = path.join(global.applicationPath, 'package.json')
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath))
  }
  return null
}

function loadModule (moduleName) {
  if (global.testModuleJSON && global.testModuleJSON[moduleName]) {
    return global.testModuleJSON[moduleName]
  }
  return require(moduleName)
}

function loadModuleFile (moduleName, file) {
  if (global.testModuleJSON && global.testModuleJSON[moduleName]) {
    global.testModuleJSON[moduleName].files = global.testModuleJSON[moduleName].files || {}
    return global.testModuleJSON[moduleName].files[file]
  }
  let modulePath
  try {
    modulePath = require.resolve(moduleName)
  } catch (error) {
  }
  if (modulePath) {
    const filePath = modulePath.replace('/index.js', file)
    if (file.endsWith('.js') || file.endsWith('.json')) {
      return require(filePath)
    }
    return fs.readFileSync(filePath).toString()
  }
  const rootPath = path.join(global.applicationPath, file)
  if (fs.existsSync(rootPath)) {
    return fs.readFileSync(rootPath).toString()
  }
  Log.error('missing module file', moduleName, file)
  throw new Error('missing-module-file')
}
