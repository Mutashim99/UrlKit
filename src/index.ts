import express from 'express'
import 'dotenv/config'
import errorHandler from './middlewares/error.middleware'


const PORT = process.env.PORT || 8080

const app = express()
app.use(express.json())


app.use(errorHandler)
app.listen(PORT,()=>{
    console.log(`running on ${PORT} `);
})
