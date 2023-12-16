import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const port = process.env.PORT || 3000;
const app = express();

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "14082017",
  port: 5433,
});
db.connect();

//middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {
  const result = await db.query("select country_code from visited_countries");
  const rows = result.rows;
  const visited = []
  rows.forEach(element => {
    visited.push(element.country_code);
  });
  return visited;
}

app.get("/", async (req, res) => {
  const visited = await checkVisisted();
  res.render("index.ejs", {
    countries: visited,
    total: visited.length
  });
});

app.post("/add", async (req, res) => {
  const newCountry = req.body.country.toLowerCase();
  console.log(newCountry);
  try {
    const result = await db.query("select country_code from countries where lower(country_name) like '%' || $1 || '%';", [newCountry]);
    console.log(result.rows);
    const newCountryCode = result.rows[0].country_code;
    try {
      const result = await db.query("insert into visited_countries (country_code) values ($1);", [newCountryCode]);
      res.redirect("/");
    }
    catch (err) {
      console.log(err);
      const visited = await checkVisisted();
      res.render("index.ejs", {
        error: "Country already visited, Try again",
        countries: visited,
        total: visited.length
      });
    }
  }
  catch (err) {
    console.log(err);
    const visited = await checkVisisted();
    res.render("index.ejs", {
      error: "Country doesn't exist, Try again",
      countries: visited,
      total: visited.length
    });
  }
});


app.listen(port, () => {
  console.log(`server running on port ${port}`);
});