const fs = require('fs')
const path = require('path')

module.exports = {
  write
}

function write () {
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
