const { check } = require('express-validator');
const { handleValidationErrors } = require('../validation');

const validateReviewImage = [
  check('url')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Url is not valid'),
  handleValidationErrors
]

module.exports = { validateReviewImage }
