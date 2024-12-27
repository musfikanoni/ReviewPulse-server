const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbgeo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const userCollection = client.db('ReviewPulseDB').collection('users');
    const servicesCollection = client.db('ReviewPulseDB').collection('services')

   //users related apis
   app.get('/users', async(req, res) => {
    const cursor = userCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  })

  app.post('/users', async(req, res) => {
    const newUser = req.body;
    console.log('creating new user', newUser);

    const result = await userCollection.insertOne(newUser)
    res.send(result);
  });


    //Services related apis
    app.post('/services', async (req, res) =>{
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.send(result);
    })

    app.get('/services', async(req,res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //
    app.get('/', async (req, res) => {
      const result = await servicesCollection.find().limit(6).toArray();
      res.send(result);
    });

    //service details
    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await servicesCollection.findOne(query);
      res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server: ${port}`)
})