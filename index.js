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
    const servicesCollection = client.db('ReviewPulseDB').collection('services');
    const reviewsCollection = client.db('ReviewPulseDB').collection('reviews');

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
      const email = req.query.email;
      let query = {};
      if(email){
        query = { email: email }
      }

      const cursor = servicesCollection.find(query);
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

    //review
    app.post('/reviews', async(req, res) => {
      const newReview = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      res.send(result);
    })

    app.get('/reviews', async(req, res) => {
      const email = req.query.email;
      const query = { posted_email: email }
      const result = await reviewsCollection.find(query).toArray();
      for(const postReview of result){
        const query1 = { _id: new ObjectId(postReview.review_id) }
        const review = await servicesCollection.findOne(query1);
        if(review){
          postReview.companyName = review.companyName;
          postReview.category = review.category;
        }   
      }
      res.send(result);
    })

    // app.get('/reviews/:id', async(req, res) => {
    //   const id = req.params.id;
    //   const query = {_id: new ObjectId(id)}
    //   const result = await reviewsCollection.findOne(query);
    //   res.send(result);
    // })

    //update services
    app.put('/reviews/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const service = req.body;

      const updatedService = {
        $set: {
          photoUrl: service.photoUrl,
          title: service.title,
          companyName: service.companyName,
          website: service.website,
          description: service.description,
          category: service.category,
          price: service.price,
          date: service.date,
        }
      }

      const result = await servicesCollection.updateOne(filter, updatedService, options);
      res.send(result)
    })


    //Update reviews
    app.put('/reviews/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const review = req.body;
      
      const updatedReview = {
        $set: {
          title: review.title,
          review: review.review,
          date: review.date,
          rating: review.rating
        }
      }

      const result = await reviewsCollection.updateOne(filter, updatedReview, options);
      res.send(result)
    })


    //Delete services
    app.delete('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await servicesCollection.deleteOne(query);
      res.send(result);
    })

    //Delete reviews
    app.delete('/reviews/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await reviewsCollection.deleteOne(query);
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