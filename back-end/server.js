const app = require("./app");
const mongoose = require('mongoose')
require('dotenv').config();
const PORT = 4001;
  
const url= `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecms.0fs4jsc.mongodb.net/ECMS?retryWrites=true&w=majority&appName=ECMS`
//const url= `mongodb://127.0.0.1:27017`

console.log(new Date());

mongoose.connect(url)
  .then(() => {
    console.log('DB Connected successfully');
    
    require('./utils/electionScheduler');
  })
  .catch((err) => console.log('Something went wrong :', err));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));