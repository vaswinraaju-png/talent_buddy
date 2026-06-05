const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function generateContent() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Write a professional blog post for talentbuddy.xyz, a career accelerator in India. 
  Topic: Trending hiring patterns in Indian MNCs for 2024. 
  Format: HTML. Include SEO keywords: 'placement help', 'ATS resume', 'recruiter outreach'.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Create a unique filename based on today's date
  const fileName = `blog/hiring-trends-${new Date().toISOString().split('T')[0]}.html`;
  
  fs.writeFileSync(fileName, text);
  console.log(`Saved new SEO content to ${fileName}`);
}

generateContent();
