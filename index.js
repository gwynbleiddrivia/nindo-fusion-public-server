const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT||5000
const jwt = require('jsonwebtoken');

//all middlwares
app.use(cors())
app.use(express.json())
require('dotenv').config()

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
    const classCollection = client.db('classesNindo').collection('classes')
    const selstudclassCollection = client.db('classesNindo').collection('selclasses')
    const enrstudclassCollection = client.db('classesNindo').collection('enrclasses')

///// selstudclassCollection apis
//api to post a selected class
   app.post('/selectclasses', async(req,res)=>{
	const newClass = req.body
	//const query = {classid: newClass.classid}
	//const existingClass = await selstudclassCollection.findOne(query)
	//if (existingClass){
	//	return res.send({message: "this class already exists"})
	//}
	const result = await selstudclassCollection.insertOne(newClass)
	res.send(result)
	console.log(newClass)
   })
//api to read all selected classes
   app.get('/selectclasses',async(req,res)=>{
	const query = {studentid: req.body.studentid}
	const queryResult = await selstudclassCollection.find(query).toArray()
	res.send(queryResult)
   })

//api to delete a selected class
  app.delete('/selectclasses/:id', async(req,res) => {
	const query = {_id: new ObjectId(req.params.id)}
	const result = await selstudclassCollection.deleteOne(query)
	res.send(result)
  })


///// enrstudclassCollection


///// userCollection apis

//api to read all user data
    app.get('/users',  async(req,res) => {
	let query = {}
	if(req.query?.email){
		query = {email:req.query.email}
	}
	if(req.query?.role){
		query = {role:req.query.role}
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

///// classCollection apis
//api to make class approved
  app.patch('/classes/approved/:id', async(req,res) =>{
	const query = {_id: new ObjectId(req.params.id)}
	const updateDoc = {
		$set: {
			status: 'approved'
		}
	}
	const result = await classCollection.updateOne(query, updateDoc)
	res.send(result)
  })
//api to make class denied
  app.patch('/classes/denied/:id', async(req,res) =>{
	const query = {_id: new ObjectId(req.params.id)}
	const updateDoc = {
		$set: {
			status: 'denied'
		}
	}
	const result = await classCollection.updateOne(query, updateDoc)
	res.send(result)
  })
//api to post all classes data
   app.post('/classes', async(req,res)=>{
	const newClass = req.body
	const result = await classCollection.insertOne(newClass)
	res.send(result)
	console.log(newClass)
   })

//api to read all classes data
    app.get('/classes',  async(req,res) => {
	let query = {}
	if(req.query?.email){
		query = {email:req.query.email}
	}
	const queryResult = await classCollection.find(query).toArray()
	res.send(queryResult)
	console.log(queryResult)
    })
//api to give class feedback
  app.put('/classes/feedback/:id', async(req,res) =>{
  	const feedback = req.body.feedback
	const query = {_id: new ObjectId(req.params.id)}
	const updateDoc = {
		$set: {
			feedback: feedback
		}
	}
	const result = await classCollection.updateOne(query, updateDoc)
	res.send(result)
  })
//api to update class feedback old
   app.put('/classes/:id', async(req,res) =>{
	const id = req.params.id
	const updatedClass = req.body
	const filter = {_id: new ObjectId(id)}
	const options = {upsert: true}
	const updatedInfo = {
		$set:{
			classname: updatedClass.classname,
			classimage: updatedClass.classimage,
			availableseats: updatedClass.availableseats,
			price: updatedClass.price
		}
	}
	const result = await classCollection.updateOne(filter, updatedInfo, options)
	res.send(result)
   })
//api to read single class info
   app.get('/classes/:id', async(req,res)=>{
	const id = req.params.id
	const query = {_id: new ObjectId(id)}
	const result = await classCollection.find(query).toArray()
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

