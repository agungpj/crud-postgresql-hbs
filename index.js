const express = require("express");
const db = require("./connect/db");

const app = express();
const PORT = 3000;

app.set("view engine", "hbs"); // set hbs

app.use("/public", express.static(__dirname + "/public")); // set public folder/path

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let isLogin = true;

function getFullTime(time) {
  let month = [
    "January",
    "Februari",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let date = time.getDate(); // mendapatkan tanggal
  let monthIndex = time.getMonth(); // mendapatkan bulan
  let year = time.getFullYear(); // mendpatkan tahun

  let hours = time.getHours(); // mendapatkan jam
  let minutes = time.getMinutes(); // mendapatkan menit

  return `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`;
}

app.get("/", function (request, response) {
  response.render("index");
});

app.get("/blog", async (request, response) => {
  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query("SELECT * FROM tb_blog", function (err, result) {
      if (err) throw err;

      // console.log(result.rows[0]);
      let data = result.rows;

      response.render("blog", { isLogin: isLogin, blogs: data });
    });
  });
});

app.post("/blog", async (request, response) => {
  db.connect(function (err, client, done) {
    const { title, content } = request.body;
    if (err) throw err;

    client.query(
      "INSERT INTO tb_blog (title, content) VALUES ($1, $2) RETURNING *",
      [title, content],
      function (err, result) {
        if (err) throw err;

        // console.log(result);
        // let data = result.rows;

        // response.render("blog-detail", { isLogin: isLogin, blogs: data });
      }
    );
  });
  setTimeout(() => {
    response.redirect("/blog");
  }, 3000);
});

app.get("/blog-detail/:id", async (request, response) => {
  const { id } = request.params;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      "SELECT * FROM tb_blog WHERE id = $1",
      [id],
      function (err, result) {
        if (err) throw err;
        const data = result.rows;
        // console.log(result.rows[0]);

        response.render("blog-detail", { isLogin: isLogin, blogs: data });
      }
    );
  });
});

// routing halaman add blog
app.get("/add-blog", function (request, response) {
  response.render("add-blog");
});
app.get("/edit-blog/:id", function (request, response) {
  response.render("edit-blog");
});

app.post("/edit-blog/:id", function (request, response) {
  const { id } = request.params;
  const { title, content } = request.body;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      "UPDATE tb_blog SET title = $1, content = $2 WHERE id=$3",
      [title, content, id],
      function (err, result) {
        if (err) throw err;
        const data = result.rows[0];
        console.log("data has been updated!");
      }
    );
  });
  setTimeout(() => {
    response.redirect("/blog");
  }, 3000);
});

app.get("/delete-blog/:id", function (request, response) {
  const { id } = request.params;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      "DELETE FROM tb_blog WHERE id = $1",
      [id],
      function (err, result) {
        if (err) throw err;

        console.log("data has been deleted!");
      }
    );

    setTimeout(() => {
      response.redirect("/blog");
    }, 3000);
  });
});

app.get("/contact", function (request, response) {
  response.render("contact");
});

app.listen(PORT, function () {
  console.log(`Server starting on PORT ${PORT}`);
});
