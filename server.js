require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID_DEFAULT = process.env.CHAT_ID_DEFAULT;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

async function sendTelegramMessage(chatId, text) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    await axios.post(url, {
      chat_id: chatId,
      text
    });
  } catch (err) {
    console.error("Error kirim Telegram:", err.message);
  }
}

app.get("/", (req, res) => {
  res.json({ message: "Server hidup" });
});

app.post("/callback-qris", async (req, res) => {
  const body = req.body;

  console.log("Webhook masuk:", body);

  if (WEBHOOK_SECRET) {
    const secret = req.headers["x-webhook-secret"];
    if (secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  const status = body.status;
  const orderId = body.order_id;
  const amount = body.amount;
  const chatId = body.chat_id || CHAT_ID_DEFAULT;

  if (status === "PAID") {
    await sendTelegramMessage(
      chatId,
      `Pembayaran sukses!\nOrder: ${orderId}\nNominal: ${amount}`
    );
  }

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});