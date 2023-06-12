const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
	res.send('nindo fusion camp server is running')
})







app.listen(port,()=>{
	console.log(`nindo fusion camp server is running on port ${port}`)

})

