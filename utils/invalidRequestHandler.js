const validationResult = require('express-validator/check').validationResult
const HttpStatus = require('http-status-codes')

module.exports = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(HttpStatus.BAD_REQUEST).json({ errors: errors.array() })
  }
  return next()
}
