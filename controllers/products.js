const Product = require('../models/product');

//below getAllProductsStatic is a testing method to check different ways of querying the database
const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({ price: { $gt: 30 } })
    .sort('price')
    .select('name price');

  res.status(200).json({ products, nbHits: products.length });
};






module.exports = {
  getAllProductsStatic
};