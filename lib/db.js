// Importing MySQL module
const mysql = require("mysql");

// Creating connection
let dbConnection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "testing",
  charset: "utf8mb4_general_ci",
});

// Connect to MySQL server
dbConnection.connect((err) => {
  if (err) {
    console.log("Database Connection Failed !!!", err);
  } else {
    console.log("Connected to Database");
  }
});


dbConnection.query(`DROP TABLE IF EXISTS Products;`,
  function (err, result) {
    if (err) throw err;
    console.log("Table deleted");
  }
);
dbConnection.query(`DROP TABLE IF EXISTS Brands;`,
  function (err, result) {
    if (err) throw err;
    console.log("Table deleted");
  }
);
dbConnection.query(`DROP TABLE IF EXISTS Categories;`,
  function (err, result) {
    if (err) throw err;
    console.log("Table deleted");
  }
);
dbConnection.query(
  `
  CREATE TABLE IF NOT EXISTS Products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku varchar(255) DEFAULT NULL,
    brandId int DEFAULT NULL,
    categoryId int DEFAULT NULL,
    subcategoryId int DEFAULT NULL,
    name VARCHAR(255),
    price DOUBLE DEFAULT 0,
    quantity DOUBLE DEFAULT 0,
    subtitle VARCHAR(255),
    thumbnail TEXT,
    url TEXT,
    discountPercent DOUBLE DEFAULT 0,
    createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
  );
`,
  function (err, result) {
    if (err) throw err;
    console.log("Query Table initialized");
  }
);

dbConnection.query(
  `
  CREATE TABLE IF NOT EXISTS Brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name varchar(255) NOT NULL,
    imageUrl text NOT NULL,
    sortOrder int NOT NULL,
    status enum('active','inactive') NOT NULL,
    createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
  );
`,
  function (err, result) {
    if (err) throw err;
    console.log("Query Table initialized");
  }
);

dbConnection.query(
  `
  CREATE TABLE IF NOT EXISTS Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parentId int DEFAULT NULL,
    subId int DEFAULT NULL,
    name varchar(255) NOT NULL,
    imageUrl text NOT NULL,
    sortOrder int NOT NULL,
    status enum('active','inactive') NOT NULL,
    createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
  );
`,
  function (err, result) {
    if (err) throw err;
    console.log("Query Table initialized");
  }
);

dbConnection.query(
  `
  ALTER TABLE Products
    ADD UNIQUE KEY \`IDX_eb2e6c7c03ea341ff8fcbcdb6f\` (\`sku\`);
`,
  function (err, result) {
    if (err) throw err;
    console.log("Table altered");
  }
);

// Function to insert multiple Row in database
const categoryRepo = {
  findAll: async (opt = {}) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM Categories`;
      if (opt.name) sql = `${sql} WHERE name = '${opt.name}';`;
      if (opt.id) sql = `${sql} WHERE id = '${opt.id}';`;

      // Executing the query
      dbConnection.query(sql, function (err, result, fields) {
        if (err) reject(err);
        return resolve(result);
      });
    });
  },
  findOne: async (opt = {}) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM Categories`;
      if (opt.name) sql = `${sql} WHERE name = '${opt.name}';`;
      if (opt.id) sql = `${sql} WHERE id = '${opt.id}';`;

      // Executing the query
      dbConnection.query(sql, function (err, result, fields) {
        if (err) reject(err);
        return resolve(result[0]);
      });
    });
  },
  save: async (name, parentId = null) => {
    return new Promise(async (resolve, reject) => {
      const sql = `INSERT INTO \`Categories\` 
        (\`parentId\`, \`name\`, \`imageUrl\`, \`sortOrder\`, \`status\`) VALUES 
        (${parentId}, '${name}', '', 1, 'active');`;

      // Executing the query
      dbConnection.query(sql, async (err, result) => {
        if (err) reject(err);
        result = await categoryRepo.findOne({ name });
        return resolve(result);
      });
    });
  },
};

const brandRepo = {
  findAll: async (opt = {}) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM Brands`;
      if (opt.name) sql = `${sql} WHERE name = '${opt.name}';`;
      if (opt.id) sql = `${sql} WHERE id = '${opt.id}';`;

      // Executing the query
      dbConnection.query(sql, function (err, result, fields) {
        if (err) reject(err);
        return resolve(result);
      });
    });
  },
  findOne: async (opt = {}) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM Brands`;
      if (opt.name) sql = `${sql} WHERE name = '${opt.name}';`;
      if (opt.id) sql = `${sql} WHERE id = '${opt.id}';`;

      // Executing the query
      dbConnection.query(sql, function (err, result, fields) {
        if (err) reject(err);
        return resolve(result[0]);
      });
    });
  },
  save: async (name) => {
    return new Promise(async (resolve, reject) => {
      // Query to insert multiple rows
      const sql = `INSERT INTO \`Brands\` 
        (\`name\`, \`imageUrl\`, \`sortOrder\`, \`status\`) VALUES 
        ('${name}', '', 1, 'active');`;

      // Executing the query
      dbConnection.query(sql, async (err, result) => {
        if (err) reject(err);
        result = await brandRepo.findOne({ name });
        return resolve(result);
      });
    });
  },
};

const productRepo = {
  findAll: async (opt = {}) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM Products`;
      // Executing the query
      dbConnection.query(sql, function (err, result, fields) {
        if (err) reject(err);
        return resolve(result);
      });
    });
  },
  findOne: async (id) => {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM Products WHERE id = ${id}`;

      // Executing the query
      dbConnection.query(sql, function (err, result, fields) {
        if (err) reject(err);
        return resolve(result[0]);
      });
    });
  },
  // Function to insert multiple Row in database
  saveBatch: async (arrayData) => {
    return new Promise((resolve, reject) => {
      // Query to insert multiple rows
      const sql = `INSERT INTO Products
        (id, sku, name, brandId, categoryId, 
          subcategoryId, price, quantity, subtitle, 
          thumbnail, url, discountPercent) VALUES ?;`;

      // Executing the query
      dbConnection.query(sql, [arrayData], (err, rows) => {
        if (err) throw err;
        console.log("All Rows Inserted");
        return resolve(rows);
      });
    });
  },
};

const customRepo = {
  clean: async () => {
    dbConnection.query(`DELETE FROM Products`, function (err, result) {
      if (err) throw err;
      console.log("Table deleted");
    });
    dbConnection.query(
      `DELETE FROM Categories WHERE id > 100`,
      function (err, result) {
        if (err) throw err;
        console.log("Table deleted");
      }
    );
    dbConnection.query(`DELETE FROM Brands`, function (err, result) {
      if (err) throw err;
      console.log("Table deleted");
    });
    dbConnection.query(
      `ALTER TABLE Brands AUTO_INCREMENT = 101;`,
      function (err, result) {
        if (err) throw err;
        console.log("Table altered");
      }
    );
    dbConnection.query(
      `ALTER TABLE Products AUTO_INCREMENT = 1001;`,
      function (err, result) {
        if (err) throw err;
        console.log("Table altered");
      }
    );
  },
};

module.exports = {
  dbConnection,
  categoryRepo,
  brandRepo,
  productRepo,
  customRepo,
};
