const express = require('express')
const date = require(__dirname + '/date.js')
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin-santiago:admin-santiago@cluster0.neqzd.mongodb.net/todoDB', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const app = express()
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('public'))

const PORT = 3000;

//Create Item schema
const itemsSchema = new mongoose.Schema({
    name: String
});
const listSchema = new mongoose.Schema({
    name:String,
    items: [itemsSchema]
})
//Create Item Model (collection)
const Item = mongoose.model('Item', itemsSchema);

const List = mongoose.model('List', listSchema)
//Create document instances to save to the db
const item1 = new Item({
    name: 'Welcome to your new custom list!'
});
const item2 = new Item({
    name: 'Hit the + button to add a new item'
});
const item3 = new Item({
    name: '<- Delete a task by clicking this'
});

const defaultItems = [item1, item2, item3]
// Insert documents to collection

var Items = Array()
var message = ''


// app.get('/', function(req, res){
    
//     res.sendFile(__dirname + '/templates/index.html')
// })
const newList = new List({name:'Todo', items:defaultItems})
newList.save()
app.get('/', async function(req, res){
    let currentDay = date.getDay();   
    let allLists = await List.find({}, 'name'); 
    Item.find({},(err,results)=>{
        if (err) return console.error(err)
        if (results.length===0){
            Item.insertMany([item1, item2, item3], (err, resp)=>{
                if (err){
                    return console.error(err)
                }else{
                    console.log('smt happened', resp)
                    res.redirect('/todo');   
                }
                
            });
        }else{
            res.render('list', {day: currentDay, todos:results, message:message, collectionName:'todo', allLists:allLists});
        }
    })
})

app.post('/', function(req, res){
    console.log(req.originalUrl)
    message = 'Task added successfully!'
    const newTask = new Item({
        name:req.body.newItem
    });
    newTask.save((err, result)=>{
        if (err) return console.error(err)
        console.log(result)
    });
    res.redirect('/')
})

app.post('/delete', (req, res)=>{
    const checkedItemId = req.body.itemId
    Item.findByIdAndRemove(checkedItemId, (err)=>{
        if (!err){
            res.redirect('/')
        }  
    })
})

app.get('/:listName',async (req, res)=>{
    let currentDay = date.getDay();
    const listName = req.params.listName;
    const capitilizedListName = listName[0].toUpperCase()+listName.slice(1)
    let allLists = await List.find({}, 'name');
    

    List.find({name:capitilizedListName}, (err, results)=>{
        if (err) return console.error(err)
        if (results.length==0){
            const newList = new List({name:capitilizedListName, items:defaultItems})
            newList.save()
            res.render('list',{day: `${currentDay}/${listName}`, todos:defaultItems, message:'Hi', collectionName:listName, allLists:allLists})
        }else{
            res.render('list',{day: `${currentDay}/${listName}`, todos:results[0].items, message:'Hi', collectionName:listName, allLists:allLists})
        }
    })
})

app.post('/:listName', (req, res)=>{
    let currentDay = date.getDay();
    const listName = req.params.listName;
    const capitilizedListName = listName[0].toUpperCase()+listName.slice(1)
    const item = new Item({
        name: req.body.newItem
    })
    List.find({name:capitilizedListName}, (err, model)=>{
        if (err) return console.error(err);
        model[0].update({"$push":{items:item}}, (err, updateRes)=>{
            if (err) return console.error(err)
            console.log(updateRes)
        })
        res.redirect(`/${listName}`)
    })
})

app.post('/:listName/delete', (req, res)=>{
    let currentDay = date.getDay();
    const listName = req.params.listName;
    const checkedItemId = req.body.itemId;
    const capitilizedListName = listName[0].toUpperCase()+listName.slice(1);
    List.find({name:capitilizedListName}, (err, model)=>{
        if (err) return console.error(err)
        model[0].update({'$pull':{items:{_id: checkedItemId}}}, (err, updateResult)=>{
            if (err) return console.error(err)
            console.log(updateResult)
            res.redirect(`/${listName}`)
        })
        
    })
})

let port = process.env.PORT;
if (port==null || port==""){
    port=8000;
}

app.listen(port, function(){
    var today = new Date();
    console.log("Server running on port "+port);
});

process.on('SIGINT', () => {
    console.log('Bye bye!')
    mongoose.connection.close(() => {
          process.exit(0);
      });
});
