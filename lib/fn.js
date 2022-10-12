var request = require("request").defaults({ encoding: null });

module.exports = {
  imageUrlToBase64: async (url) => {
    return new Promise((resolve) => {
      request.get(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          data =
            "data:" +
            response.headers["content-type"] +
            ";base64," +
            Buffer.from(body).toString("base64");
          resolve(data);
        }
      });
    });
  },
  randomPercentage: (max) => {
    return Math.floor(Math.random() * max);
  },
  getRandomArbitrary: (min, max) => {
    return Math.random() * (max - min) + min;
  },
  getRandomInt: (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};
