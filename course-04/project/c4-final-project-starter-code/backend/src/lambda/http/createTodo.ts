import 'source-map-support/register'
import * as moment from 'moment';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import { parseUserId } from '../../auth/utils'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Creating todo', event)

  const userId = parseUserId(event.headers.Authorization)
  const dueDate = moment().add(2, 'days').toISOString()

  let newTodo: CreateTodoRequest = JSON.parse(event.body)
  newTodo.dueDate = dueDate

  console.log('Storing new todo: ', newTodo)
  const savedTodo = await createTodo(newTodo, userId)

  return  {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: {
        todoId: savedTodo.todoId,
        createdAt: savedTodo.createdAt,
        name: savedTodo.name,
        dueDate: savedTodo.dueDate,
        done: savedTodo.done,
        attachmentUrl: ''
      }
    })
  }

}
