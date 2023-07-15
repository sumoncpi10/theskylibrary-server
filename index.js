require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pyvsvhc.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db('theskylibrary');
    const bookCollection = db.collection('books');

    app.get('/books', async (req, res) => {
      const cursor = bookCollection.find({});
      const product = await cursor.toArray();

      res.send({ status: true, data: product });
    });

    app.post('/book', async (req, res) => {
      const product = req.body;

      const result = await bookCollection.insertOne(product);

      res.send(result);
    });

    app.get('/book/:id', async (req, res) => {
      const id = Number(req.params.id);
      // const id = req.params.id;
      const result = await bookCollection.findOne({ _id:(id) });
      console.log(result);
      res.send(result);
    });
app.get('/searchBook/:text', async (req, res) => {
  try {
    const searchText = req.params.text;
    const regex = new RegExp(searchText, 'i');

    let cursor = await bookCollection.find({
      $or: [
        { Genre: { $regex: regex } },
        { Author: { $regex: regex } },
        { Title: { $regex: regex } },
      ]
    });

    let product = await cursor.toArray();
    if(product.length==0){
      cursor = await bookCollection.find({});
      product = await cursor.toArray();
      return product;
    }else{
      res.send({ status: true, data: product });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.post('/comment/:id', async (req, res) => {
      const productId = Number(req.params.id);
      const comment = req.body.comment;

      console.log(productId);
      console.log(comment);

      const result = await bookCollection.updateOne(
        { _id: (productId) },
        { $push: { comments: comment } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error('Book not found or comment not added');
        res.json({ error: 'Book not found or comment not added' });
        return;
      }

      console.log('Comment added successfully');
      res.json({ message: 'Comment added successfully' });
    });

    app.get('/comment/:id', async (req, res) => {
      const productId = Number(req.params.id);

      const result = await bookCollection.findOne(
        { _id: (productId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    });

    app.post('/user', async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello from The Sky Library!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
