const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://anshusingla405:AnshuSingla11@cluster0.ksitqmm.mongodb.net/todolistDB',{useNewUrlParser:true});
const itemsSchema = {
  name : String
}
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name : "Hey this is the item 1"
});
const item2 = new Item({
  name : "Hey this is the item 2"
});
const item3 = new Item({
  name : "Hey this is the item 3"
});
const defaultItems = [item1,item2,item3];

const listSchema = {
  name  : String,
  items : [itemsSchema]
}

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({}).then(foundItems=>{
    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
        console.log("Successfully added");
      })
      .catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }
  })


});

app.post("/", function(req, res){

  

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name : listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete",function(req,res){
  const checkedIdItem = req.body.checkBox;
  const listName = req.body.listName
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedIdItem).then(function(err){
      if(!err){
        console.log("Deleted");
        res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate({name : listName},{$pull:{items:{_id : checkedIdItem}}}).then(function(foundList){
      if(foundList){
        res.redirect("/" + listName)
      };
    })
  }
  
})

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name : customListName}).then(foundList =>{
    if(!foundList){
      const list = new List({
        name : customListName,
        items : defaultItems
      }) 
      list.save();
      res.redirect("/" + customListName);
    }else{
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
  })
  .catch((err)=>{
    console.log(err);
  })

  

  

})

app.get("/about", function(req, res){
  res.render("about");
});


app.get("/favicon.ico",function(req,res){
  res.status(204)
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
