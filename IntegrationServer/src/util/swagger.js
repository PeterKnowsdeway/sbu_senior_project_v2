const express = require('express')
const cors = require("cors")
const morgan = require("morgan")
const swaggerJsDoc = require("swagger-jsdoc")
const swaggerUI = require("swagger-ui-express")
const contactsRouter = require("../routes/contacts-integration")
const authRouter = require("../routes/OAuth-helper")

const PORT = process.env.PORT || 8080

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express Library API"
    },
    servers: [
      {
        url: "https://sbuseniorprojectv2.peterwelter.repl.co/"
      }
    ]
  },
  apis: ["../routes/*.js"]
};

const specs = swaggerJsDoc(options)


module.exports = specs