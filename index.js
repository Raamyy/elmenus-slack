require('dotenv').config()
const express = require('express');
const axios = require('axios');
const cors = require('cors');


const app = express()

app.use(cors());
app.use(express.json());


app.post('/elmenus/order', async (req, res) => {
    res.send("Yes test!");
})


let port = process.env.PORT || 4000;
app.listen(port, () => console.log("started listening on port " + port));