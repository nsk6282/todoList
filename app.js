//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema = new mongoose.Schema({
  name: String
});

const customListSchema = new mongoose.Schema({
  name:String,
  list:[itemSchema]
})

const Item = mongoose.model("Item",itemSchema);
const customListItem = mongoose.model("list",customListSchema);

const item1 = new Item({
  name:"Welcome to out todo list!"
});
const item2 = new Item({
  name:"Hit the + button to add a new item"
});
const item3 = new Item({
  name:"<--- hit this to delete an item"
});
const defaultItems = [item1,item2,item3];

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {
  const day = date.getDate();
  Item.find()
    .then((items)=>{
      if(items.length===0){
        Item.insertMany(defaultItems)
          .then(function(result){
            console.log(result);
          })
          .catch(function(err){
            console.log(err);
          })
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: items});
    
      }
    }) 
    .catch((err)=>{
      console.log(err);
    })
});

app.get("/:listType",function(req,res){
  const type = _.capitalize(req.params.listType);

  customListItem.findOne({name:type})
    .then((items)=>{
      if(!items){
        console.log("doest exist");
        const customList = new customListItem({
          name: type,
          list:defaultItems
        });
        customList.save();
        res.redirect("/"+type);

      }
      else{
        console.log("exist");
        res.render("list", {listTitle:items.name, newListItems:items.list});

      }
    })
    .catch((err)=>{
      console.log(err);
    })


})


app.post("/", function(req, res){

  console.log(req.body);
  const item = req.body.newItem;
  const customType = req.body.list;
  const itemadded = new Item({
    name:item
  });

  if(customType ==="Today"){
    itemadded.save();
    res.redirect("/");
  }

  else{
    customListItem.findOne({name:customType})
    .then((customItem)=>{
      customItem.list.push(itemadded);
      customItem.save();
      res.redirect("/"+customType);
    })
    .catch((err)=>{
      console.log(err);
    })
  }
});

app.post("/delete",function(req,res){
  console.log(req.body);
  const itemId = req.body.checkbox;
  const typeId = req.body.hidden;
  if(typeId==="Today"){
    console.log(itemId);
    Item.deleteOne({_id:itemId})
      .then((result)=>{
        console.log("successfully done removing");
        res.redirect("/");
      })
      .catch((err)=>{
        console,log(err);
      })
  }
  else{
    console.log(itemId);
    customListItem.findOneAndUpdate({ name: typeId }, { $pull: { list: {_id:itemId}}})
      .then((result)=>{
        console.log("successfully done removing");
        console.log(result);
      })
      .catch((err)=>{
        console.log(err);
      })

    res.redirect("/"+typeId);
  }
  
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
