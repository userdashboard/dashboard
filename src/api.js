const fs = require('fs')
const path = require('path')

module.exports = {
  write,
  createFromSitemap: () => {
    const api = {}
    for (const url in global.sitemap) {
      if (url.indexOf('/api/') !== 0) {
        continue
      }
      const pathParts = url.substring(5).split('/')
      const prior = []
      for (const partRaw of pathParts) {
        let part = partRaw
        if (!prior.length) {
          api[part] = api[part] || {}
          prior.push(part)
          continue
        }
        let obj = api
        for (const priorPart of prior) {
          obj = obj[priorPart]
        }
        prior.push(part)
        if (prior.length === pathParts.length) {
          if (partRaw.indexOf('-') === -1) {
            part = partRaw.charAt(0).toUpperCase() + partRaw.substring(1)
          } else {
            const segments = partRaw.split('-')
            part = ''
            for (const segment of segments) {
              part += segment.charAt(0).toUpperCase() + segment.substring(1)
            }
          }
          obj[part] = global.sitemap[url].api
        } else {
          obj[part] = obj[part] || {}
        }
      }
    }
    return api
  }
}

function write () {
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

function padRight (str, totalSize) {
  const blank = '                                                                                                                                                                                                                                                        '
  return (str + blank).substring(0, totalSize)
}

function underlineRight (str, totalSize) {
  const blank = '--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------'
  return (str + blank).substring(0, totalSize)
}
