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

const productapiurl = "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&select=fields&content_type=product"
const sizeapiurl = "https://cdn.contentful.com/spaces/x2maf5pkzgmb/environments/master/entries?access_token=VcJDwIe2eizDEjIwdVdDsF7tcQZ-0_uIrcP4BiDULsg&select=fields&content_type=size"

//Index route
app.get('/', (request, response) => {
  Promise.all([
    fetchJson(`${productapiurl}`),
    fetchJson(`${sizeapiurl}`),
  ]).then(([productdata, sizedata]) => {
    response.render('index', { products: productdata, sizes: sizedata });
  })
})

//Artikel route
app.get("/artikel/:slug", (request, response) => {
  const slugdirectus = encodeURIComponent(request.params.slug)
  Promise.all([
    fetchJson(`${postsUrl}/?slug=${request.params.slug}&_fields=date,slug,title,author,content,excerpt,categories,yoast_head,yoast_head_json`),
    fetchJson(`${directusUrl}?filter={"slug":"${slugdirectus}"}`),
    fetchJson(`${authorUrl}?_fields=id,slug,name,description,avatar_urls&per_page=100`),
    fetchJson(`${categoriesUrl}?_fields=id,name,slug&per_page=100`)
  ]).then(([postData, likeData, authorData, categoryData]) => {

    let filterCategorie = categoryData.filter(category => {
      return category.id == postData[0].categories[0]
    })

    let filterAuthor = authorData.filter(author =>{
      return author.id == postData[0].author
    })

    eval(date.get('full-date'))

    if (postData[0].categories.some(category => category === 590)){ 
      response.render("gallery", {article: postData, like: likeData.data, categories: categoriesData, category: filterCategorie, author: filterAuthor})
    } else if (postData[0].categories.some(category => category === 3211)){
      response.render("podcast", {article: postData, like: likeData.data, categories: categoriesData, category: filterCategorie, author: filterAuthor})
    } else {
      response.render("article", {article: postData, like: likeData.data, categories: categoriesData, category: filterCategorie, author: filterAuthor})
    }
  })
})

app.post('/artikel/:slug', (request, response) => {
  fetchJson(`${directusUrl}?filter[slug][_eq]=${request.params.slug}`)
    .then(({ data }) => {
      return fetchJson(`${directusUrl}/${data[0]?.id ? data[0].id : ''}`, {
        method: data[0]?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: request.params.slug,
          shares: data.length > 0 ? data[0].shares + 1 : 1,
        }),
      });
    })
    .then(() => {
      response.redirect(301, `/artikel/${request.params.slug}`);
    })
    .catch(error => {
      console.error('Error:', error);
      response.status(500).send('Internal Server Error');
    });
});

//Categorie route
app.get('/categorie/:slug', function (request, response) {
  const category = categoriesData.find((category) => category.slug == request.params.slug)

  Promise.all([
    fetchJson(`${postsUrl}?categories=${category.id}&_fields=date,slug,title,yoast_head_json.og_image, yoast_head_json.og_image,jetpack_featured_media_url&per_page=20`), 
    fetchJson(`${categoriesUrl}/?slug=${request.params.slug}&_fields=name,yoast_head`)
  ]).then(([postData, category]) => {

    for (var i=0; i < postData.length; i++) {
      eval(date.get('day-month-year'))
    }
    
    response.render('category', {posts: postData, category: category, categories: categoriesData});
  })
})

//Auteur route
app.get('/auteur/:slug', function (request, response) {
  Promise.all([fetchJson(authorUrl + '?slug=' + request.params.slug), 
    fetchJson(postsUrl + '?_fields=date,slug,title,author,yoast_head_json.twitter_misc,yoast_head_json.og_image,jetpack_featured_media_url&per_page=100')]).then(([authorData, postData]) => {

      let filterPost = postData.filter(post =>{
        return post.author == authorData[0].id
      })

      for (var i=0; i < postData.length; i++) {
        eval(date.get('day-month'))
      }

      response.render('author', {author: authorData, posts: filterPost, categories: categoriesData })
    })
})  

// Search
app.get('/search', (request, response) => {
  const searchterm = request.query.q
  fetchJson(`${postsUrl}?search=${searchterm}`).then((postData) => {
    for (var i=0; i < postData.length; i++) {
      eval(date.get('day-month-year'))
    }
      response.render('search', {posts: postData, categories: categoriesData, searchterm})
  })
})