const bcrypt = require('bcryptjs')
const crypto = require('crypto')

function hash (text, salt, progress, callback) {
  callback = callback || progress
  const sha = crypto.createHash('sha256')
  const textHash = sha.update(text).digest('hex')
  return bcrypt.hash(textHash, salt, callback)
}

function hashSync (text, salt) {
  const sha = crypto.createHash('sha256')
  const textHash = sha.update(text).digest('hex')
  return bcrypt.hashSync(textHash, salt)
}

function compare (text, hash, callback) {
  const sha = crypto.createHash('sha256')
  const textHash = sha.update(text).digest('hex')
  return bcrypt.compare(textHash, hash, callback)
}

function compareSync (text, hash) {
  const sha = crypto.createHash('sha256')
  const textHash = sha.update(text).digest('hex')
  return bcrypt.compareSync(textHash, hash)
}

module.exports = {
  compare,
  compareSync,
  hash,
  hashSync,
  getRounds: bcrypt.getRounds,
  genSalt: bcrypt.genSalt,
  genSaltSync: bcrypt.genSaltSync
}
