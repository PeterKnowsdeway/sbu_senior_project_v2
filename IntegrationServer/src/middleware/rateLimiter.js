/**
 * This file is a rate limiter that limits the number of requests to 100 per 24 hours
 */

const rateLimit = require('express-rate-limit')

const rateLimiterUsingThirdParty = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  max: 100,
  message: 'You have exceeded the 100 requests in 24 hrs limit!',
  standardHeaders: true,
  legacyHeaders: false,
  //TODO: Implement this later
  /*keyGenerator: function(req) {
    // Check if request is from a trusted IP address
    if (req.ip === '192.168.1.1') {
      return req.ip + '-trusted';
    }
    // Check if request is from an authenticated user
    else if (req.user && req.user.id) {
      return req.user.id + '-authenticated';
    }
    // Use default key generator for all other requests
    else {
      return req.ip;
    }
  } */
})

module.exports = rateLimiterUsingThirdParty
