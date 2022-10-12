const axios = require("axios");
const cheerio = require("cheerio");
const fn = require("./fn");

module.exports = {
  scrapeEbayProducts: async (db = require("./db"), opt = {}) => {
    return new Promise(async (resolve, reject) => {
      axios(opt.link)
        .then(async (response) => {
          let data = [];
          let productData = [];
          
          const html = response.data;
          const $ = cheerio.load(html);

          $(".srp-results .s-item__wrapper", html).each(async function () {
            //<-- cannot be a function expression
            let name = $(this).find(".s-item__title").text().trim() || "";
            let price = $(this).find(".s-item__price").text().trim() || "";
            price = price.replace(",", "");
            price = price.replace("$", "");
            price = parseFloat(price);
            let subtitle =
              $(this).find(".s-item__info .s-item__subtitle").text().trim() ||
              "";
            let url = $(this).find(".s-item__info a").attr("href") || "";
            let sku = url.replace("https://www.ebay.com/itm/", "");
            sku = sku.split("?")[0];
            let id = parseInt(sku);
            let thumbnail = $(this).find(".s-item__image-img").attr("src") || "";
            let quantity = parseInt(fn.getRandomArbitrary(1, 70000));
            let discountPercent = fn.randomPercentage(10);

            data.push({
              id,
              sku,
              name,
              price,
              quantity,
              discountPercent,
              subtitle,
              thumbnail,
              url,
            });

            productData.push([
              id,
              sku,
              name,
              opt.brand ? opt.brand.id : null,
              opt.category ? opt.category.id : null,
              opt.subcategory ? opt.subcategory.id : null,
              price,
              quantity,
              subtitle,
              thumbnail,
              url,
              discountPercent,
            ]);

          });
          
          await db.productRepo.saveBatch([productData[0]]);
          return resolve(data);
        })
        .catch((err) => console.error(err));
    });
  },
};
