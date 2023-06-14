const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT||5000
const jwt = require('jsonwebtoken');

//all middlwares
app.use(cors())
app.use(express.json())
require('dotenv').config()
const verifyJWT = (req, res, next) => {
	const authorization = req.headers.authorization
	if(!authorization){
		return res.status(401).send({error: true, message: 'unauthorized access'})
	}

	const token = authorization.split(' ')[1]
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
		if(err){
			return res.status(401).send({error:true, message:'unauthorized access'})
		}
		req.decoded = decoded
		next()
	})
} 


app.get('/',(req,res)=>{
	res.send('nindo fusion camp server is running')
})



//MongoDB code starts here

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c32luun.mongodb.net/?retryWrites=true&w=majority`;

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
    client.connect();

    const userCollection = client.db('usersNindo').collection('users')

/////jwt api
    app.post('/jwt',(req,res)=>{
	const user = req.body
	const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
	res.send({ token })
    })


///// userCollection apis

//api to read all user data
    app.get('/users', async(req,res) => {
	let query = {}
	if(req.query?.email){
		query = {email:req.query.email}
	}
	const queryResult = await userCollection.find(query).toArray()
	res.send(queryResult)
	console.log(queryResult)
    })
//api to read single user data
    app.get('/users/:id', async(req,res) => {
	const query = {_id: new ObjectId(req.params.id)}
	const queryResult = await userCollection.find(query).toArray()
	res.send(queryResult)
	console.log(queryResult)
    })



//api to post all user data
   app.post('/users', async(req,res)=>{
	const newUser = req.body
	const query = {email: newUser.email}
	const existingUser = await userCollection.findOne(query)
	if (existingUser){
		return res.send({message: "user already exists"})
	}
	const result = await userCollection.insertOne(newUser)
	res.send(result)
	console.log(newUser)
   })

//api to delete an user
  app.delete('/users/:id', async(req,res) => {
	const query = {_id: new ObjectId(req.params.id)}
	const result = await userCollection.deleteOne(query)
	res.send(result)
  })
//api to make user admin
  app.patch('/users/admin/:id', async(req,res) =>{
	const query = {_id: new ObjectId(req.params.id)}
	const updateDoc = {
		$set: {
			role: 'admin'
		}
	}
	const result = await userCollection.updateOne(query, updateDoc)
	res.send(result)
  })
//api to make user instructor 
  app.patch('/users/instructor/:id', async(req,res) =>{
	const query = {_id: new ObjectId(req.params.id)}
	const updateDoc = {
		$set: {
			role: 'instructor'
		}
	}
	const result = await userCollection.updateOne(query, updateDoc)
	res.send(result)
  })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);






app.listen(port,()=>{
	console.log(`nindo fusion camp server is running on port ${port}`)

})

