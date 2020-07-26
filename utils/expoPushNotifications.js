const { Expo } = require("expo-server-sdk");
const { PushToken } = require("../models/pushToken");

const expo = new Expo();

async function getPushTokens() {
  const tokensWithUser = await PushToken.find();
  const push_tokens = tokensWithUser.map((token) => token.token);
  return push_tokens;
}

async function getPushToken(userId) {
  const tokenWithUser = await PushToken.find({ user: userId });
  const push_token = tokenWithUser.map((token) => token.token);
  return push_token;
}

function createMessages(message, data, pushTokens, channelId) {
  let messages = [];
  for (let pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      title: message.title,
      body: message.body,
      data,
      channelId,
    });
  }
  return messages;
}

async function sendMessages(messages) {
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
  return tickets;
}

function getReceiptIds(tickets) {
  let receiptIds = [];
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }
  return receiptIds;
}

async function obtainReceipts(receiptIds) {
  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log("receipts");
      console.log(receipts);
      if (!Array.isArray(receipts)) {
        let receipt = receipts;
        if (receipt.status === "ok") {
          continue;
        } else if (receipt.status === "error") {
          console.error(
            `There was an error sending a notification: ${receipt.message}`
          );
          if (receipt.details && receipt.details.error) {
            console.error(`The error code is ${receipt.details.error}`);
          }
        }
        return;
      }

      for (let receipt of receipts) {
        if (receipt.status === "ok") {
          continue;
        } else if (receipt.status === "error") {
          console.error(
            `There was an error sending a notification: ${receipt.message}`
          );
          if (receipt.details && receipt.details.error) {
            console.error(`The error code is ${receipt.details.error}`);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = {
  createMessages,
  sendMessages,
  getPushTokens,
  getPushToken,
  getReceiptIds,
  obtainReceipts,
};
