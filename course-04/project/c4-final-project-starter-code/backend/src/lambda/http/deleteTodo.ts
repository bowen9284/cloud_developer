import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

import { parseUserId } from '../../auth/utils'
import { deleteTodo, getTodo } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Deleting todo', event)
  const userId = parseUserId(event.headers.Authorization)
  const todoId = event.pathParameters.todoId
  
  const existingTodo = await getTodo(userId, todoId)

  if (!existingTodo.todoId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo does not exist',
      }),
    };
  }
  
  await deleteTodo(userId, todoId)

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
