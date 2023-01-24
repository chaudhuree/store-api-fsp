//fill the database with the products.json file
//to run this file run on terminal node populate.js
require('dotenv').config()

const connectDB = require('./db/connect')
const Product = require('./models/product')

const jsonProducts = require('./products.json')

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    await Product.deleteMany()
    await Product.create(jsonProducts)
    console.log('Success!!!!')
    process.exit(0) 
    // process.exit(0) is used to exit the process with success
    //like when we will run the command node populate.js in the terminal the process will not stop. the cursor will be blinking. so we need to exit the process by using process.exit(0)
    
  } catch (error) {
    console.log(error)
    process.exit(1)
    // process.exit(1) is used to exit the process with failure
  }
}

start()
