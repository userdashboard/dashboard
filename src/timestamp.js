module.exports = {
  now: Math.floor(new Date().getTime() / 1000),
  date: (t) => {
    if (!t) {
      return null
    }
    if (t.substring) {
      t = parseInt(t, 10)
    }
    return new Date(t * 1000)
  },
  create: (date) => {
    if (!date) {
      return null
    }
    if (date.substring) {
      date = new Date(date)
    }
    if (!date.getTime) {
      return null
    }
    return Math.floor(date.getTime() / 1000)
  },
  interval: setInterval(refresh, 1000)
}

function refresh () {
  module.exports.now++
}
