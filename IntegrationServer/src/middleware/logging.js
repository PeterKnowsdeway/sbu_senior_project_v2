/*
  - The logging.js file creats an instance of a logger that logs all errors, info, and wanrings to a server.log file.
*/
const { createLogger, format, transports } = require('winston')

module.exports = createLogger({
  transports:
    new transports.File({
      filename: 'logs/server.log',
      format: format.combine(
        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
        format.align(),
        format.printf(info => `${info.level}: ${[info.timestamp]}: ${[info.function]}: ${[info.parameters]}: ${info.message}: ${info.error}`)
      )
    })
})
