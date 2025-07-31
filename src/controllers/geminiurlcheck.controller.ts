import { GoogleGenAI } from '@google/genai'
import { NextFunction, Request, Response } from 'express'

export const checkUrlSafety = async (
  req: Request<{}, {}, { url: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try{
    const url = req.body.url
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  const prompt = `
You are a URL safety classification engine.

Analyze the following URL and classify it into one of the categories: 
- Safe
- Suspicious
- Dangerous

If it's "Suspicious" or "Dangerous", briefly like very shortly explain why (e.g., phishing, malware, scam, or unusual domain pattern).

If it's "Safe", briefly like very shortly explain why you consider it safe (e.g., known domain, secure HTTPS, no known issues).

Respond strictly in the following format:

Category: [Safe | Suspicious | Dangerous]
Reason: [brief explanation]

URL: ${url}
`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  })

  const aiText = response.text!

  const categoryMatch = aiText.match(/Category:\s*(.*)/i)
  const reasonMatch = aiText.match(/Reason:\s*(.*)/i)

  const category = categoryMatch?.[1]?.trim().toLowerCase() || "unknown"
  const reason = reasonMatch?.[1]?.trim() || "No reason provided"

  const isUnsafe = category === "dangerous" || category === "suspicious"

  let message: string

  if (isUnsafe) {
    message = `This URL is considered ${category.toUpperCase()}: ${reason}`
  } else {
    message = reason.toLowerCase().includes("known") || reason.length > 10
      ? `This URL appears safe. ${reason}`
      : `This URL appears safe and does not show any harmful characteristics.`
  }

  res.status(200).send({
    safe: !isUnsafe,
    category,
    message,
    raw: aiText.trim(), 
  })
  }catch(e){
    next(e)
  }
}
