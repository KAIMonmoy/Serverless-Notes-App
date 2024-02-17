'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const { sendResponse, sendErrorResponse } = require('./utils');

const documentClient = new DynamoDB.DocumentClient({
  region: 'ap-southeast-1',
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
});
const NOTES_TABLE_NAME = process.env.NOTES_TABLE;


/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 */
module.exports.createNote = async (event) => {
  const data = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        id: data.id,
        title: data.title,
        description: data.description,
      },
      ConditionExpression: "attribute_not_exists(id)",
    };

    await documentClient.put(params).promise();
    return sendResponse(201, { message: 'Note created' });
  } catch (err) {
    return sendErrorResponse(err);
  }
}

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 */
module.exports.updateNote = async (event) => {
  const noteId = event.pathParameters.id;
  const data = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { id: noteId },
      UpdateExpression: 'set #title = :title, #description = :description',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#description': 'description',
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':description': data.description,
      },
      ConditionExpression: "attribute_exists(id)",
    };

    await documentClient.update(params).promise();

    return sendResponse(200, { message: 'Note updated' });
  } catch (err) {
    return sendErrorResponse(err);
  }
}

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 */
module.exports.deleteNote = async (event) => {
  const noteId = event.pathParameters.id;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { id: noteId },
      ConditionExpression: "attribute_exists(id)",
    };

    await documentClient.delete(params).promise();

    return sendResponse(200, { message: 'Note deleted' });
  } catch (err) {
    return sendErrorResponse(err);
  }
}

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 */
module.exports.listNote = async (_event) => {
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };

    const notes = await documentClient.scan(params).promise();

    return sendResponse(200, notes.Items);
  } catch (err) {
    return sendErrorResponse(err);
  }
}
