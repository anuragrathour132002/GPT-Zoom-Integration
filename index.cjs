//importing libraries
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const path = require("path");

const generateZoomSignature = require("./utils/createSignature.cjs");

const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

//setting the frontend router
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/zoom.html", function (req, res) {
  res.sendFile(__dirname + "/zoom.html");
});

//zoom meeting unique signature generating function
app.get("/signature", function (req, res) {
  const { meetingNumber } = req.query;

  const signature = generateZoomSignature(
    process.env.API_KEY,
    process.env.API_SECRET,
    meetingNumber,
    0
  );
  return res.json({
    signature: signature,
  });
});

//verifies if the meet link provided is valid or not
app.get("/credentials", async function (req, res) {
  const { meetLink } = req.query;

  //leave url redirects to the homepage when meeting ends
  const leaveUrl = process.env.LEAVE_URL;
  const userName = process.env.USER_NAME;
  const sdkKey = process.env.API_KEY;

  //this checks if the url is valid
  const regexPattern =
    "zoom\\.us/(?:j/|my/)?(\\d+)(?:\\?pwd=([a-zA-Z0-9_-]+))?";
  const regex = new RegExp(regexPattern);
  const match = meetLink.match(regex);

  const meetingNumber = match[1];
  const passWord = match[2];

  res.status(200).json({
    leaveUrl: leaveUrl,
    userName: userName,
    sdkKey: sdkKey,
    meetingNumber: meetingNumber,
    passWord: passWord,
  });
});

//generates the response of gpt
app.get("/response", async function (req, res) {
  console.log("Chat response function");

  const { message } = req.query;

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  });

  const responseChat = chatCompletion.data.choices[0].message.content;
  console.log(`RESPONSE CHAT :${responseChat}`);

  res.status(200).json({
    message: responseChat,
  });
});

//starts the server on port 4000
app.listen(4000, function () {
  console.log("Server started on port 4000");
});
