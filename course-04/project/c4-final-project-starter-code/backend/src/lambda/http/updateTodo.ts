import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { parseUserId } from '../../auth/utils'
import { updateTodo, getTodo } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Updating Todo', event)

  const userId = parseUserId(event.headers.Authorization)
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  
  const existingTodo = await getTodo(userId, todoId)

  if (!existingTodo.todoId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo does not exist',
      }),
    };
  }

  await updateTodo(updatedTodo, userId, todoId)

  const result = {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: {
        updatedTodo
      }
    })
  }

  return result
}
