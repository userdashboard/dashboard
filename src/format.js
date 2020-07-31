module.exports = {
  parseDate,
  date,
  money
}

/**
 * Converts USD, EU and GBP to $xx.xx or equivalent
 * @param {*} amount the units of currency
 * @param {*} currency the type of currency usd, eu or gbp
 */
function money (amount, currency) {
  if (!currency) {
    return null
  }
  currency = currency.toLowerCase()
  switch (currency) {
    case 'usd':
      return amount >= 0 ? `$${(amount / 100).toFixed(2)}` : `-$${(amount / -100).toFixed(2)}`
    case 'eu':
      return amount >= 0 ? `€${(amount / 100).toFixed(2)}` : `-€${(amount / -100).toFixed(2)}`
    case 'gbp':
      return amount > 0 ? `£${(amount / 100).toFixed(2)}` : `-£${(amount / -100).toFixed(2)}`
    default:
      return amount
  }
}

/**
 * Converts an object into a Date
 * @param {*} obj the date string or date
 */
function parseDate (obj) {
  if (!obj) {
    throw new Error('invalid-date')
  }
  if (obj.getFullYear) {
    return obj
  }
  if (obj.substring) {
    try {
      const i = Date.parse(obj)
      if (!i) {
        throw new Error('invalid-date')
      }
      const d = new Date(i)
      if (d.getTime) {
        return d
      }
    } catch (error) {
    }
  } else {
    try {
      const d = new Date(obj)
      if (d.getTime && d.getTime() > 0) {
        return d
      }
    } catch (error) {
    }
  }
  throw new Error('invalid-date')
}

/**
 * Formats a date to 'YYYY-MM-DD'
 * @param {*} obj the date string or date
 */
function date (date) {
  const d = date.getTime ? date : (date > 0 ? new Date(date * 1000) : parseDate(date))
  if (!d) {
    return null
  }
  const year = d.getUTCFullYear()
  let month = d.getUTCMonth() + 1
  if (month < 10) {
    month = '0' + month
  }
  let day = d.getUTCDate()
  if (day < 10) {
    day = '0' + day
  }
  return `${year}-${month}-${day}`
}
