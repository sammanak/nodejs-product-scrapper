const PORT = 8000;
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const db = require("./lib/db");
const fn = require("./lib/fn");
const scrapper = require("./lib/scrapper");

// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// app.use(bodyParser);

const cors = require("cors");
app.use(cors());

app.get("/", async function (req, res) {
  const data = await db.categoryRepo.findAll({});
  res.json({ data });
});

app.get("/news", (req, res) => {
  axios("https://www.theguardian.com/uk")
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const articles = [];

      $(".fc-item__title", html).each(function () {
        //<-- cannot be a function expression
        const title = $(this).text().trim();
        const url = $(this).find("a").attr("href");
        articles.push({
          title,
          url,
        });
      });
      res.json(articles);
    })
    .catch((err) => console.log(err));
});

app.get("/product/detail/{id}", (req, res) => {
  if (!req.params || !req.params.id) {
    return res.json({ data: [] });
  }
  const productId = req.params.id;
  axios(`${productId}`)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const articles = [];

      $(".child-menu", html).each(function () {
        //<-- cannot be a function expression
        const title = $(this).text().trim();
        const url = $(this).find("a").attr("href");
        articles.push({
          title,
          url,
        });
      });
      res.json(articles);
    })
    .catch((err) => console.log(err));
});

app.get("/blog", function (req, res) {
  axios
    .get("https://blog.logrocket.com/")
    .then((response) => {
      const $ = cheerio.load(response.data);

      const featuredArticles = $(".listfeaturedtag .padlr10");
      console.log(featuredArticles[0]);
      const data = [];

      for (let i = 0; i < featuredArticles.length; i++) {
        let postTitleWrapper = $(featuredArticles[i]).find(".card-title")[0],
          postTitle = $(postTitleWrapper).text();

        let authorWrapper = $(featuredArticles[i]).find(".post-name a")[0],
          author = $(authorWrapper).text();

        let postDescWrapper = $(featuredArticles[i]).find(".card-text")[0],
          postDesc = $(postDescWrapper).text();

        let postLinkWrapper = $(featuredArticles[i]).find(".card-title > a")[0],
          postLink = $(postLinkWrapper).attr("href");

        // console.log("\n++++++");
        // console.log(`${postTitle} by [${author}]`);
        // console.log(`${postDesc}`);
        // console.log("\n" + `Read More - ${postLink}`);
        // console.log("\n----\n\n");
        data.push({
          postTitle,
          author,
          postDesc,
          postLink,
        });
      }

      res.json({ data });
    })
    .catch((err) => console.log("Fetch error " + err));
});

app.post("/product/ebay/scrapper", jsonParser, async function (req, res) {
  const body = req.body;

  /**
   * CLEAN DB
   */
  // await db.customRepo.clean();

  if (!body) return res.json({ data: [] });
  if (!body.data) return res.json({ data: [] });

  let data = [];
  for (const d of body.data) {
    let category = await db.categoryRepo.findOne({ name: d.category });
    if (!category) category = await db.categoryRepo.save(d.category);
    let subcategory = await db.categoryRepo.findOne({
      name: d.subcategory,
      parentId: category.id,
    });
    if (!subcategory) {
      subcategory = await db.categoryRepo.save(d.subcategory, category.id);
    }

    let brand;
    if (d.brand && d.brand !== "") {
      brand = await db.brandRepo.findOne({ name: d.brand });
      if (!brand) brand = await db.brandRepo.save(d.brand);
    }

    const scrapeData = await scrapper.scrapeEbayProducts(db, {
      link: d.link,
      category,
      subcategory,
      brand: brand || null,
    });
    data.push(...scrapeData);
  }
  return res.json({ data });
});

app.post("/product/ebay/scrapper/detail", jsonParser, function (req, res) {
  const body = req.body;
  if (!body) return res.json({ data: null });
  if (!body.link) return res.json({ data: {} });
  const link = body.link;
  axios(link)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const mainSelector = $("#LeftSummaryPanel");
      let data = {};

      //<-- cannot be a function expression

      let name = mainSelector.find(".x-item-title__mainTitle").text().trim();
      let qty = mainSelector.find("#qtySubTxt").text().trim();
      qty = qty.replace("available", "");
      qty = qty.trim();
      qty = parseFloat(qty);
      let price = mainSelector.find("#convbinPrice").text().trim();
      price = price.replace(",", "");
      price = price.replace("$", "");
      price = price.replace("US", "");

      let description = mainSelector
        .find("#desc_wrapper_ctr .d-item-description #ds_div")
        .text()
        .trim();
      let specs = [];
      $(".x-about-this-item .ux-layout-section__row", html).each(function () {
        let label = $(this)
          .find("div.ux-labels-values__labels:nth-child(1)")
          .text()
          .trim();
        let value = $(this)
          .find("div.ux-labels-values__values:nth-child(2)")
          .text()
          .trim();

        if (label !== "" && value !== "") specs.push({ label, value });

        label = $(this)
          .find("div.ux-labels-values__labels:nth-child(3)")
          .text()
          .trim();
        value = $(this)
          .find("div.ux-labels-values__values:nth-child(4)")
          .text()
          .trim();

        if (label !== "" && value !== "") specs.push({ label, value });
      });

      Object.assign(data, {
        name,
        qty,
        price: parseFloat(price),
        description,
        specs,
      });

      return res.json({ data });
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () =>
  console.log(`server running on PORT http://localhost:${PORT}`)
);
