const express = require('express')
const router = express.Router()

const {
  getAllProductsStatic
} = require('../controllers/products')

router.route('/static').get(getAllProductsStatic)

module.exports = router