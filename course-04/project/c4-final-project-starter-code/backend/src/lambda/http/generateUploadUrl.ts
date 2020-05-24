import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { parseUserId } from '../../auth/utils'

import * as uuid from 'uuid'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.TODO_IMAGE_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Starting upload', event)
  const userId = parseUserId(event.headers.Authorization)
  const todoId = event.pathParameters.todoId

  const imageId = uuid.v4()
  const uploadUrl = getUploadUrl(imageId)

  console.log('Updating todo image at url', uploadUrl)

  var params = {
    TableName: todosTable,
    Key: {
      userId: userId,
      todoId: todoId
    },
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${imageId}`
    }
  }

  await docClient.update(params).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: +urlExpiration
  })
}
