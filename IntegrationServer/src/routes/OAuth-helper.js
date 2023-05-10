/**
  * Express router for the autherization routes.
  * @module OAuth-helper.js
*/
const express = require('express')
const router = express.Router()
const rateLimiterUsingThirdParty = require('../middleware/rateLimiter.js')
const handleAuth = require('../OAuth/google-auth.js').setUpOAuth
const generateToken = require('../OAuth/google-auth.js').codeHandle
const AuthenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware

router.use(rateLimiterUsingThirdParty)

/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Authenticate user using OAuth.
 *     description: Authenticate the user using OAuth and redirect them to the Google login page.
 *     responses:
 *       '302':
 *         description: Redirects to Google login page.
 */
router.get('/auth', AuthenticationMiddleware, handleAuth)

/**
 * @swagger
 * /tokenHandle:
 *   get:
 *     summary: Generate access token and refresh token.
 *     description: After the user has authenticated via Google and returned to our server, generate an access token and refresh token.
 *     parameters:
 *       - in: query
 *         name: code
 *         description: Authorization code returned by Google after successful authentication.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Access token and refresh token generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: Access token.
 *                 refresh_token:
 *                   type: string
 *                   description: Refresh token.
  *       '500':
 *         description: Not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: Access token.
 *                 refresh_token:
 *                   type: string
 *                   description: Refresh token.
 */
router.get('/tokenHandle', generateToken)

module.exports = router
