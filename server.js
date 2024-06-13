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

const configurableproductapiurl = "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&content_type=configurableProduct"

/*** Routes ***/

app.get('/', (req, res) => {
  fetchJson(configurableproductapiurl)
    .then(configurableproductdata => {
      const ids = configurableproductdata.items.map(item => item.sys.id);

      // Fetch data for each ID
      const fetchPromises = ids.map(id => {
        const productapiurl = `https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&sys.id=${id}`;
        return fetchJson(productapiurl);
      });
      return Promise.all(fetchPromises)
        .then(productdata => {
          res.render('index', { product: productdata });
        });
    })
    .catch(error => {
      console.error('Error in index route:', error);
      res.status(500).send('Internal Server Error');
    });
});

// app.get('/', (request, response) => {
//   Promise.all([
//     fetchJson(configurableproductapiurl),
//     fetchJson(productapiurl)
//   ]).then(([configurableproductdata, productdata]) => {

//     response.render('index', { configurableproduct: configurableproductdata, product: productdata});
//   })
// })