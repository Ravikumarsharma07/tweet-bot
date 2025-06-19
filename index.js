import dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";
import { OpenAI } from "openai";
import cron from "node-cron";

dotenv.config();


const prompt = `You're a passionate MERN Stack developer (MongoDB, Express, React, Node.js) learning and growing in public. Write a short, unique tweet that helps connect with other developers or tech enthusiasts.

Make the tweet:

Friendly and authentic

Not salesy or repetitive

No hashtags or emojis unless it adds real value

Avoid repeating the same structure or phrases

Include:

A short insight, thought, or update

A reason to engage (e.g., ask a question, invite collab, share experience)

Under 180 characters

Each tweet must sound like a real human developer sharing something meaningful to grow their network. Don’t reuse phrases like “Excited to connect,” “Let’s build together,” or “MERN stack journey.`

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.COHERE_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
  },
});

async function main() {
  console.log("Generating tweet...");
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 100,
  });

  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
}

cron.schedule("0 0 14 * * *", async () => {
  console.log("Posting tweet...");
  try {
    const tweet = await main();
    await twitterClient.v2.tweet(tweet);
    console.log("✅ Tweet posted:", tweet);
  } catch (err) {
    console.error("❌ Error:", err);
  }
});
