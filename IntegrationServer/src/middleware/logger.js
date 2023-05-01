const { createLogger, format, transports } = require('winston')

/**
  Creates a new instance of a logger with transports for writing log messages to files.
  @type {import('winston').Logger}
  @property {Array<import('winston').Transport>} transports - An array of transports for writing log messages.
  @property {Array<import('winston').Transport>} exceptionHandlers - An array of transports for handling uncaught exceptions.
  @property {Array<import('winston').Transport>} rejectionHandlers - An array of transports for handling unhandled rejections.
*/

module.exports = createLogger({
  transports: [
    new transports.File({
      filename: 'logs/server.log',
      format: format.combine(
        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
        format.errors({ stack: true }),
        format.align(),
        format.printf(info => `
          ${info.level}: 
          ${[info.timestamp]}:
          ${[info.pid]}:
          ${[info.hostname]}:
          ${[info.requestID]}:
          ${info.message}: 
          ${[info.function]}: 
          ${[info.parameters]}: 
          ${info.stackTrace}`)
      )
    })
  ],
  /**
    An array of transports for handling uncaught exceptions.
    @type {Array<import('winston').Transport>}
  */
  exceptionHandlers: [
    new transports.Console({ consoleWarnLevels: ['error'] }),
    new transports.File({ filename: 'logs/exceptions.log' })
  ],
  /**
    An array of transports for handling unhandled rejections.
    @type {Array<import('winston').Transport>}
  */
  rejectionHandlers: [
    new transports.Console({ consoleWarnLevels: ['error'] }),
    new transports.File({ filename: 'logs/rejections.log' })
  ],
})