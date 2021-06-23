const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const bodyParser = require('body-parser')
const cors = require('cors')
const constants = require('./constants')
const model = require('./model')


app.use(cors())
app.use(bodyParser.json())


/*
        ****** SQLite Setup Part *****
*/

let db = new sqlite3.Database('./db/todos.db', (err) => {
    if(err){
        console.log(err)
    }
    console.log("Connected to database")
    db.all(model.table, [], (err, rows)=>{
        if(err){
            console.log("error while accessing table")
        }
    })
})



/*
        ***** Express Setup Part *****
*/


//define the routes
const todoRoutes = express.Router()

//Read all entries
//upon access of '/' in browser..
todoRoutes.route('/').get((req,res)=> {

    //find Todo entries in database
    let sql = `SELECT * FROM todos`
    db.all(sql, [], (err, rows)=>{
        if(err){
            console.log("error in read")
            console.log(err)
        }        
        res.json(rows) //print result in json form
    })
   
    
    
    
})

//Read a specific entry
todoRoutes.route('/:id').get((req,res)=>{
    let id = req.params.id
    Todo.findById(id, (err,todo) =>{
        res.json(todo)
    })
})

//Create a new entry
todoRoutes.route('/add').post((req,res)=>{
    let todo = new Todo(req.body)
    
    console.log('data to be inserted is: ')
    console.log(req.body)
    todo.save()
        .then(todo => {
            res.status(200).json({'todo':'todo added successfully!'})
        })
        .catch(err => {
            res.status(400).send('adding new todo failed!')
        })
        
})

//Update an entry
todoRoutes.route('/update/:id').post((req,res)=>{
    
    Todo.findById(req.params.id, (err,todo)=>{
        if(!todo){
            res.status(404).send("the todo was not found")
        }
        else{
            todo.todo_description = req.body.todo_description
            todo.todo_responsible = req.body.todo_responsible
            todo.todo_priority = req.body.todo_priority
            todo.todo_completed = req.body.todo_completed

            todo.save().then(todo => {
                res.json('todo updated!')
            })
            .catch(err => {
                res.status(400).send("an error occurred in updating")
            })
        }
    })
})

//Delete an entry
todoRoutes.route('/delete/:id').post((req,res)=>{

    Todo.findById(req.params.id, (err,todo)=>{
        if(!todo){
            res.status(404).send("the todo was not found")
        }
        else{
            todo.todo_deleted = true            
            todo.todo_priority = 'Low'            
            todo.save().then(todo => {
                res.json('todo updated!')
            })
            .catch(err => {
                res.status(400).send("an error occurred in updating")
            })          
        }
    })
 })


//after defining the routes, use the routes
app.use('/todos', todoRoutes)


app.listen(constants.PORT, ()=> {
    console.log("Server is running on Port: " + constants.PORT)    
})