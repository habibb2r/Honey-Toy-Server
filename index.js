const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config()
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!');
})


// DB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ir3lm70.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7).
    await client.connect();

    const toycollecton = client.db('honeyToy').collection('alltoy');
    const mytoycollection = client.db('honeyToy').collection('mytoy');
    

    app.get('/alltoy', async (req, res) => {
      const order = req.query.sort;
      const search = req.query.search;
      
      const query = {name: {$regex: search, $options: 'i'}};
      const option ={
        sort: {
          "price": order === 'asc' ? 1 : -1
        }
      }
        const cursor = toycollecton.find(query, option);
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/gallary', async (req, res) => {
      const query = req.body;
      // const query = { sort: {
      //   "price": order === 'asc' ? 1 : -1
      // }};
        const cursor = toycollecton.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/mytoy', async (req, res) => {
        let query = {};
        if (req.query?.selleremail){
          query = {selleremail: req.query.selleremail}
        }
        const cursor = mytoycollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/alltoy/:id', async (req, res) => {
        const id =  req.params.id;
        const query ={ _id: new ObjectId(id)}
        const result = await toycollecton.findOne(query);
        res.send(result);
    })
    app.get('/mytoy/:id', async (req, res) => {
        const id =  req.params.id;
        const query ={ _id: new ObjectId(id)}
        const result = await mytoycollection.findOne(query);
        res.send(result);
    })
    app.put('/mytoy/:id', async (req, res) => {
        const id =  req.params.id;
        const query ={ _id: new ObjectId(id)}
        const option = {upsert: true};
        const uptoy = req.body;
        console.log(uptoy);
        const setToy = {
          $set: {
            name: uptoy.name,
            price: uptoy.price,
            picture: uptoy.picture,
            details: uptoy.details,
            rating: uptoy.rating,
            quantity: uptoy.quantity,
            category: uptoy.category,
            sellername: uptoy.sellername,
            selleremail: uptoy.selleremail
          }
        }
        const result = await mytoycollection.updateOne(query, setToy, option);
        res.send(result);
    })

    app.post('/mytoy', async (req, res) => {
      const mytoy = req.body;
      console.log(mytoy);
      const result  = await mytoycollection.insertOne(mytoy);
      res.send(result);
    })
    app.post('/alltoy', async (req, res) => {
      const mytoy = req.body;
      console.log(mytoy);
      const result  = await mytoycollection.insertOne(mytoy);
      res.send(result);
    })
    app.delete('/mytoy/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await mytoycollection.deleteOne(query);
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(` server ${port}`)
})