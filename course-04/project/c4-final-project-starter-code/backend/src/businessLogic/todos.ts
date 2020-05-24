import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as moment from 'moment'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId)
}

export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
    return await todoAccess.getTodo(userId, todoId)
  }

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  return await todoAccess.createTodo({
    todoId: todoId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: moment().toISOString()
  })
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
  todoId: string
): Promise<UpdateTodoRequest> {
    console.log(`donezo ${updateTodoRequest.done}`)
  return await todoAccess.updateTodo({
    userId: userId,
    todoId: todoId,
    done: updateTodoRequest.done,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    createdAt: moment().toISOString()
  })
}

export async function deleteTodo(userId: string, todoId: string) {
    return await todoAccess.deleteTodo(userId, todoId)
}

