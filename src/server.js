import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";

const app = express();

app.use(bodyParser.json());

async function withDB(operations) {
  const client = await MongoClient.connect("mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db("react-blog-backend");
  await operations(db);
  client.close();
}

app.get("/api/articles/:name", async (req, res) => {
  try {
    const articleName = req.params.name;

    await withDB(async (db) => {
      const articleInfo = await db
        .collection("articles")
        .findOne({ name: articleName });

      res.status(200).json(articleInfo);
    });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to db", error });
  }
});

app.post("/api/articles/:name/upvote", async (req, res) => {
  try {
    const articleName = req.params.name;

    await withDB(async (db) => {
      const articleInfo = await db
        .collection("articles")
        .findOne({ name: articleName });

      await db.collection("articles").updateOne(
        { name: articleName },
        {
          $set: {
            upvotes: articleInfo.upvotes + 1,
          },
        }
      );

      const updatedArticleInfo = await db
        .collection("articles")
        .findOne({ name: articleName });

      res.status(200).json(updatedArticleInfo);
    });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to db", error });
  }
});

app.post("/api/articles/:name/add-comment", (req, res) => {
  try {
    const articleName = req.params.name;

    withDB(async (db) => {
      const articleInfo = await db
        .collection("articles")
        .findOne({ name: articleName });

      await db.collection("articles").updateOne(
        { name: articleName },
        {
          $set: {
            comments: articleInfo.comments.concat(req.body),
          },
        }
      );

      const updatedArticleInfo = await db
        .collection("articles")
        .findOne({ name: articleName });
      res.status(200).json(updatedArticleInfo);
    });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to db", error });
  }
});

app.listen(8000, () => console.log("Listening on port 8000"));
