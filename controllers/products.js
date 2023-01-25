const Product = require('../models/product');

//below getAllProductsStatic is a testing method to check different ways of querying the database
const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({ price: { $gt: 30 } })
    .sort('price')
    .select('name price');

  res.status(200).json({ products, nbHits: products.length });
};


//below getAllProducts is the method that will be used in the routes

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;

  //docs: query
  //queryObject is an object that will be used to query the database. 
  //first we will set it empty object
  // then we will fill it as much data as we can get it from the request query given by the user
  const queryObject = {};

  //{URL}/products?featured=true
  //featured is given true here. but it comes as a string
  //so we need to convert it to boolean by using the ternary operator
  if (featured) {
    queryObject.featured = featured === 'true' ? true : false;
  }
  //{URL}/products?company=ikea
  if (company) {
    queryObject.company = company;
  }
  //{URL}/products?name=chair
  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }
  //{URL}/products?numericFilters=price>30,price<50
  if (numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    };
    //"operatorMap" is an object that maps the operators '>', '>=', '=', '<', '<=' to their corresponding MongoDB query operators ($gt, $gte, $eq, $lt, $lte).
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    // regular expression (regEx) that matches the operators specified in the operatorMap


    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    ); //ref 01
    //replace the operators with their corresponding MongoDB query operators
    //example: price>30,price<50
    //will be replaced with price-$gt-30,price-$lt-50

    const options = ['price', 'rating'];
    //price and rating are the only numeric fields that we want to filter


    filters = filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-');
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }
  //filters = price-$gt-30,price-$lt-50 (ref 01)
  //split make it an array
  //filters = filters.split(',') = ['price-$gt-30', 'price-$lt-50'] 

  //filters = filters.forEach((item) => { //price-$gt-30

  //  const [field, operator, value] = item.split('-'); 
  //field = price, operator = $gt, value = 30

  //  if (options.includes(field)) {
  //check either price or rating is included in the field=price

  //    queryObject[field] = { [operator]: Number(value) };
  //  }
  //});
  //queryObject = {price: {$gt: 30}, price: {$lt: 50}}


  let result = Product.find(queryObject);
  //result will be here after the query is done
  //docs: sort
  // {URL}/products?sort=-name,price
  //-name means sort by name in descending order
  //price means sort by price in ascending order
  if (sort) { 
    const sortList = sort.split(',').join(' ');
    //sortList = ['-name', 'price']= '-name price'
    result = result.sort(sortList);
    //result = result.sort('-name price')
  } else {
    result = result.sort('createdAt');
    //if no sort value is gicen, sort by createdAt
    //result = result.sort('createdAt')
  }

  //docs: select
  // {URL}/products?fields=name,price
  //like sort all coding is same
  if (fields) {
    const fieldsList = fields.split(',').join(' ');
    result = result.select(fieldsList);
  }
  //docs: pagination
  // {URL}/products?limit=15&page=2
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  //skip = (1-1)*15 = 0 (skip the first 0 results for page 1)
  //that means we will get the results from 1 to 15 as limit is 15
  //skip = (2-1)*15 = 15 (skip the first 15 results for page 2) 
  //that means we will get the results from 16 to 30 as limit is 15
  //skip = (3-1)*15 = 30 (skip the first 30 results for page 3)
  //that means we will get the results from 31 to 45 as limit is 15


  result = result.skip(skip).limit(limit);
  //result = result.skip(15).limit(15)
  

  const products = await result;
  res.status(200).json({ products, nbHits: products.length });
};





module.exports = {
  getAllProducts,
  getAllProductsStatic,
};