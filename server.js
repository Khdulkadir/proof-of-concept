/*** Express setup & start ***/
import fetchJson from './helpers/fetch-json.js'

import express, { request, response } from 'express'

const app = express()

app.set('view engine', 'ejs')

app.set('views', './views')

app.use(express.static('public'))

app.use(express.urlencoded({extended: true}))

app.set('port', process.env.PORT || 8000)

app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`)
})

/*** Variabelen ***/

const productapiurl = "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&content_type=product&limit=10"
const sizeapiurl = "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&content_type=size&limit=10"

//Index route
app.get('/', (request, response) => {
  Promise.all([
    fetchJson(productapiurl),
    fetchJson(sizeapiurl),
  ]).then(([productData, sizeData]) => {
    // Create a mapping of size ID to size value
  const sizeMap = {};
  sizeData.items.forEach(size => {
    // Access the ID and value from the size data and add them to the map
    const sizeId = size.sys.id;
    const sizeValue = size.fields.value;
    sizeMap[sizeId] = sizeValue;
  });

  // Replace size ID in products with the actual size value
  const productsWithSizes = productData.items.map(product => {
    // Access the size ID of each product
    const sizeId = product.fields.size.sys.id;
    
    // Use the size value from the map if available, otherwise keep the ID
    const sizeValue = sizeMap[sizeId] || sizeId;

    // Create a new product object with the replaced size value
    const productWithSize = {
      ...product,
      fields: {
        ...product.fields,
        size: sizeValue,
      },
    };

    // Return the product with the replaced size value
    return productWithSize;
  });

    // Render the data in the template
    response.render('index', { products: productsWithSizes, sizes: sizeData.items });
  }).catch(error => {
    console.error("Error fetching data:", error);
    response.status(500).send("Error fetching data");
  });
});