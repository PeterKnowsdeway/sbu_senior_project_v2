const { createLogger, format, transports } = require('winston')

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
  exceptionHandlers: [
    new transports.Console({ consoleWarnLevels: ['error'] }),
    new transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new transports.Console({ consoleWarnLevels: ['error'] }),
    new transports.File({ filename: 'logs/rejections.log' })
  ],
})