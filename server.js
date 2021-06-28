const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const bodyParser = require('body-parser')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
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
//upon access of '/todos' in browser..
todoRoutes.route('/').get((req,res)=> {

    //get all Todo entries in database
    let sql = `SELECT * FROM todos WHERE todo_deleted=0`
    db.all(sql, [], (err, rows)=>{
        if(err){
            console.log("error in read")
            console.log(err)
        }        
        res.json(rows) //print result in json form
    })
   
    
    
    
})

//Read a specific entry
//example route: localhost:4000/todos/f7b5b3ce30704b58be5399a5afb5814a
todoRoutes.route('/:id').get((req,res)=>{    
    console.log("route: /:id")
    let id = req.params.id
    let sql = `SELECT * FROM todos WHERE id="${id}" AND todo_deleted=0`    
    
    db.all(sql, [], (err, rows)=>{
        if(err){
            console.log("error in read by id")
            console.log(err)
        }          
        res.json(rows) //print result in json form
    })
})

//Create a new entry
todoRoutes.route('/add').post((req,res)=>{
   
    let todo = {...req.body}
    todo.id = uuidv4().replace(/-/g,'');    
    
    let sql = `INSERT INTO todos(id, todo_description, todo_responsible, todo_priority, todo_completed)
                VALUES (?,?,?,?,?)`
    let todoValues = [todo.id, todo.todo_description, todo.todo_responsible, todo.todo_priority, todo.todo_completed]
    

    db.run(sql, todoValues, (err)=>{
        if (err) {          
          res.status(400).send('adding new todo failed!')
        }
        return res.status(200).json({'todo':'todo added successfully!'})
    });       
})

//Update an entry
//example route: localhost:4000/todos/update/f7b5b3ce30704b58be5399a5afb5814a
todoRoutes.route('/update/:id').post((req,res)=>{
    console.log("update data: ")
    console.log(req.body)

    let todo = {...req.body}
    todo.id = req.params.id
    let sql = `UPDATE todos
                SET todo_description = (?),
                todo_responsible = (?),
                todo_priority = (?),
                todo_completed = (?)
                WHERE id = (?)`
    
    let todoValues = [todo.todo_description, todo.todo_responsible, todo.todo_priority, todo.todo_completed, todo.id]

    db.run(sql, todoValues, (err)=>{
        if (err) {          
          res.status(400).send('an error occurred in updating')
        }
        return res.status(200).json({'todo':'todo updated successfully!'})
    });
})

//Delete an entry
todoRoutes.route('/delete/:id').delete((req,res)=>{
    let todo = {};
    todo.id = req.params.id
    todo.todo_deleted = 1;

    let sql = `UPDATE todos SET todo_deleted = 1 WHERE id = (?)`

    db.run(sql, todo.id, (err)=>{
        if (err) {          
          res.status(400).send('an error occurred in deleted')
        }
        return res.status(200).json({'todo':'todo deleted successfully!'})
    });
 })


//after defining the routes, use the routes
app.use('/todos', todoRoutes)


app.listen(constants.PORT, ()=> {
    console.log("Server is running on Port: " + constants.PORT)    
})