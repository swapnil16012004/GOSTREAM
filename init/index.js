const mongoose = require("mongoose");
const initData = require("./data.js");
const {Marvel, History, PopularMovie, Comedy, Kid} = require("../models/listing.js");

const MONGO_URL = "mongodb://localhost:27017/gostream";

main()
.then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
})
async function main(){
   await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
   await Marvel.deleteMany({});
   await History.deleteMany({});
   await PopularMovie.deleteMany({});
   await Comedy.deleteMany({});
   await Kid.deleteMany({});
   initData.data1 = initData.data1.map((obj)=>({...obj, owner:"6654a50d5264601c7347ad73"}));
   initData.data2 = initData.data2.map((obj)=>({...obj, owner:"6654a50d5264601c7347ad73"}));
   initData.data3 = initData.data3.map((obj)=>({...obj, owner:"6654a50d5264601c7347ad73"}));
   initData.data4 = initData.data4.map((obj)=>({...obj, owner:"6654a50d5264601c7347ad73"}));
   initData.data5 = initData.data5.map((obj)=>({...obj, owner:"6654a50d5264601c7347ad73"}));
   await Marvel.insertMany(initData.data1);
   await History.insertMany(initData.data2);
   await PopularMovie.insertMany(initData.data3);
   await Comedy.insertMany(initData.data4);
   await Kid.insertMany(initData.data5);
   console.log("data was initialized");
}

initDB();