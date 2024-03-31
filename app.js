const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const format = require('date-fns/format')
const parseISO = require('date-fns/parseISO')
const path = require('path')

const app = express()
app.use(express.json())

let dbPath = path.join(__dirname, 'todoApplication.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DBError : ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
const checkStatusBody = (request, response, next) => {
  const {status} = request.body
  console.log(status)
  const statusValidity = ['TO DO', 'IN PROGRESS', 'DONE']
  if (statusValidity.includes(status) || status === undefined) {
    next()
  } else {
    response.status(400)
    response.send('Invalid Todo Status')
  }
}
const checkPriorityBody = (request, response, next) => {
  const {priority} = request.body
  const priorities = ['HIGH', 'MEDIUM', 'LOW']
  if (priorities.includes(priority) || priority === undefined) {
    next()
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
}
const checkCategoryBody = (request, response, next) => {
  const {category} = request.body
  const categoryValidity = ['WORK', 'HOME', 'LEARNING']
  if (categoryValidity.includes(category) || category === undefined) {
    next()
  } else {
    response.status(400)
    response.send('Invalid Todo Category')
  }
}
const checkDateFormatBody = (request, response, next) => {
  const {dueDate} = request.body
  if (dueDate === undefined) {
    next() // If dueDate is undefined, no need to validate
  } else {
    try {
      // Attempt to parse the dueDate
      const dateFormatting = format(new Date(dueDate), 'yyyy-MM-dd')
      next() // If successful, proceed to the next middleware
    } catch (e) {
      // If parsing fails, send a 400 Bad Request response
      response.status(400).send('Invalid Due Date')
    }
  }
}

const checkPriority = (request, response, next) => {
  const {priority} = request.query
  const priorities = ['HIGH', 'MEDIUM', 'LOW']
  if (priorities.includes(priority) || priority === undefined) {
    next()
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
}
const checkStatus = (request, response, next) => {
  const {status} = request.query
  const statusValidity = ['TO DO', 'IN PROGRESS', 'DONE']
  if (statusValidity.includes(status) || status === undefined) {
    next()
  } else {
    response.status(400)
    response.send('Invalid Todo Status')
  }
}
const checkCategory = (request, response, next) => {
  const {category} = request.query
  const categoryValidity = ['WORK', 'HOME', 'LEARNING']
  if (categoryValidity.includes(category) || category === undefined) {
    next()
  } else {
    response.status(400)
    response.send('Invalid Todo Category')
  }
}
const checkDateFormat = (request, response, next) => {
  let {date} = request.query
  if (date === undefined) {
    next()
  }
  try {
    const dateFormatting = format(new Date(date), 'yyyy-MM-dd')

    next()
  } catch (e) {
    response.status(400)
    response.send('Invalid Due Date')
  }
}

const hasPriorityStatusAndCateogory = responseObject => {
  return (
    responseObject.priority !== undefined &&
    responseObject.status !== undefined &&
    responseObject.category !== undefined
  )
}

const hasPriorityAndCateogory = responseObject => {
  return (
    responseObject.priority !== undefined &&
    responseObject.category !== undefined
  )
}
const hasStatusAndCateogory = responseObject => {
  return (
    responseObject.status !== undefined && responseObject.category !== undefined
  )
}
const hasPriorityAndStatus = responseObject => {
  return (
    responseObject.status !== undefined && responseObject.priority !== undefined
  )
}
const hasPriority = responseObject => {
  return responseObject.priority !== undefined
}

const hasStatus = responseObject => {
  return responseObject.status !== undefined
}

const hasCategory = responseObject => {
  return responseObject.category !== undefined
}
const hasDueDate = responseObject => {
  return responseObject.dueDate !== undefined
}

const convertDBResponseToObjectResponse = responseDb => {
  return {
    id: responseDb.id,
    todo: responseDb.todo,
    priority: responseDb.priority,
    status: responseDb.status,
    category: responseDb.category,
    dueDate: responseDb.due_date,
  }
}

app.get(
  '/todos/',
  checkPriority,
  checkCategory,
  checkStatus,
  async (request, response) => {
    const responseObject = request.query
    const {priority, status, category, search_q = ''} = responseObject
    let listOfTodosQuery
    switch (true) {
      case hasPriorityStatusAndCateogory(responseObject):
        console.log(1)
        listOfTodosQuery = `
          SELECT 
            * 
          FROM 
            todo
          WHERE 
            status LIKE '${status}' AND priority LIKE '${priority}' AND category LIKE '${category}' AND todo LIKE '%${search_q}%'
        `
        break
      case hasPriorityAndCateogory(responseObject):
        console.log(2)
        listOfTodosQuery = `
          SELECT 
            * 
          FROM 
            todo
          WHERE 
            priority LIKE '${priority}' AND category LIKE '${category}' AND todo LIKE '%${search_q}%'
        `
        break
      case hasStatusAndCateogory(responseObject):
        console.log(3)
        listOfTodosQuery = `
          SELECT 
            * 
          FROM 
            todo
          WHERE 
            status LIKE '${status}' AND category LIKE '${category}' AND todo LIKE '%${search_q}%'
        `
        break
      case hasPriorityAndStatus(responseObject):
        console.log(4)
        listOfTodosQuery = `
          SELECT 
            * 
          FROM 
            todo
          WHERE 
            status LIKE '${status}' AND priority LIKE '${priority}' AND todo LIKE '%${search_q}%'
        `
        break
      case hasCategory(responseObject):
        console.log(5)
        listOfTodosQuery = `
          SELECT 
            * 
          FROM 
            todo
          WHERE 
            category LIKE '${category}' AND todo LIKE '%${search_q}%'
        `
        break
      case hasPriority(responseObject):
        console.log('pk')
        listOfTodosQuery = `
          SELECT 
            * 
          FROM 
            todo
          WHERE 
            priority LIKE '${priority}' AND todo LIKE '%${search_q}%'
        `
        break
      case hasStatus(responseObject):
        console.log(6)
        listOfTodosQuery = `
          SELECT 
            * 
          FROM 
            todo
          WHERE 
            status LIKE '${status}'  AND todo LIKE '%${search_q}%'
        `
        break
      default:
        listOfTodosQuery = `
    SELECT 
        * 
      FROM 
        todo
      WHERE 
        todo LIKE '%${search_q}%'
    `
    }
    console.log(listOfTodosQuery)
    const listOfTodos = await db.all(listOfTodosQuery)
    const objectResponse = listOfTodos.map(eachObject =>
      convertDBResponseToObjectResponse(eachObject),
    )
    response.send(objectResponse)
  },
)

app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const getTodoByIdQuery = `
  SELECT
    *
  FROM
    todo
  WHERE
    id = ${todoId}
  `

  const todoObjectById = await db.get(getTodoByIdQuery)
  response.send(convertDBResponseToObjectResponse(todoObjectById))
})

app.get('/agenda/', checkDateFormat, async (request, response) => {
  const {date} = request.query
  const formattedDate = format(new Date(date), 'yyyy-MM-dd')
  console.log(formattedDate)
  const todoByDueDateQuery = `
  SELECT
     *
  FROM
    todo
  WHERE
    due_date = '${formattedDate}'
  `

  const todosByDate = await db.all(todoByDueDateQuery)
  const objectResponse = todosByDate.map(eachObject =>
    convertDBResponseToObjectResponse(eachObject),
  )
  response.send(objectResponse)
})

app.post(
  '/todos/',
  checkCategoryBody,
  checkDateFormatBody,
  checkPriorityBody,
  checkStatusBody,
  async (request, response) => {
    const {id, todo, priority, status, category, dueDate} = request.body
    const insertTodoQuery = `
  INSERT INTO
    todo (id,todo,priority,status,category,due_date)
  VALUES (${id},'${todo}','${priority}','${status}','${category}','${dueDate}')
  `
    try {
      let dbResponse = await db.run(insertTodoQuery)
      response.send('Todo Successfully Added')
    } catch (e) {
      response.send('Internal Server Error')
    }
  },
)

app.put(
  '/todos/:todoId',
  checkCategoryBody,
  checkDateFormatBody,
  checkPriorityBody,
  checkStatusBody,
  async (request, response) => {
    const responseObject = request.body
    const {todoId} = request.params
    const {status, category, priority, dueDate, todo} = responseObject
    let updateTodoQuery
    switch (true) {
      case hasCategory(responseObject):
        updateTodoQuery = `
      UPDATE 
        todo
      SET
        category = '${category}'
      WHERE
        id = ${todoId}
      `
        await db.run(updateTodoQuery)
        response.send('Category Updated')
        break
      case hasPriority(responseObject):
        updateTodoQuery = `
      UPDATE 
        todo
      SET
        priority = '${priority}'
      WHERE
        id = ${todoId}
      `
        await db.run(updateTodoQuery)
        response.send('Priority Updated')
        break
      case hasStatus(responseObject):
        updateTodoQuery = `
      UPDATE
        todo
      SET
        status = '${status}'
      WHERE
        id = ${todoId}
      `
        await db.run(updateTodoQuery)
        response.send('Status Updated')
        break
      case hasDueDate(responseObject):
        updateTodoQuery = `
      UPDATE 
        todo
      SET
        due_date = '${dueDate}'
      WHERE
        id = ${todoId}
      `
        await db.run(updateTodoQuery)
        response.send('Due Date Updated')
        break
      default:
        updateTodoQuery = `
      UPDATE 
        todo
      SET
        todo = '${todo}'
      WHERE
        id = ${todoId}
      `
        await db.run(updateTodoQuery)
        response.send('Todo Updated')
    }
    console.log(updateTodoQuery)
  },
)

app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const deleteATodo = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId}
  `
  await db.run(deleteATodo)
  response.send('Todo Deleted')
})

module.exports = app
