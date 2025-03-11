const express = require("express");
const cors = require('cors');
require("dotenv").config();
const bodyParser = require('body-parser');
const { connectMongoDB } = require("./Database/db");
const PORT = process.env.PORT;
const HOSTNAME = process.env.HOSTNAME;
const app = express();
connectMongoDB();
app.use(bodyParser.json());
app.use(cors({
    origin: 'https://sitfront.netlify.app/',
    methods:'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders:'Content-Type,Authentication',
    credentials: true
}));
app.get("/", (req, res) => {
  res.send("Server running successfully!!!");
});
app.use('/user',require('./ModelsAndControllers/userController'));
app.use('/post',require('./ModelsAndControllers/postController'));

app.listen(PORT, () => {
  console.log(`Server Running Successfully at ${PORT}`);
});
