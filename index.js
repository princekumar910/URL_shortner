require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose') 
const UrlC = require('url')
const dns = require('dns')
// Basic Configuratio
const port = process.env.PORT || 3000;
app.use(express.json()); 
app.use(cors());
app.use(express.urlencoded({ extended: true }))


mongoose
   .connect(process.env.MONGO_URI)
   .then(()=>{
    console.log("connected to the database")
   })
   .catch((err)=>{
    console.log(err)
   })

const urlSchema = new mongoose.Schema(
  {
    original_url : String ,
    short_url : String
  }
)

const Url = mongoose.model("Url" , urlSchema)

function shortUrl(){
  let url = "" ;

  for(let i = 0 ; i < 5 ; i++ ){
    url = url + Math.floor(Math.random()*10 + 1) ;
  }
  return url ;
}

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// api to short url
app.post ('/api/shorturl' , async (req , res)=>{
  const {url} = req.body
  // console.log(url)
  const hostname = new URL(url).hostname
  dns.lookup(hostname , async (err)=>{
           if(err){
           return  res.json({"error" : "invalid url"})
           }else{
             let short_url = shortUrl();
             await Url.create({ "original_url": url, short_url })
             short_url = Number(short_url)
               res.json({"original_url" : url , "short_url":  short_url})
           }
  })

})

app.get('/api/shorturl/:url' , async (req , res)=>{
  const {url} = req.params ;
    let short_url = url
    const original = await Url.findOne({short_url})
    res.redirect(original.original_url)
    
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
