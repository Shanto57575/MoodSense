import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
	console.error("Missing Groq API Key in environment variables");
	process.exit(1);
}

// Initialize Groq with the correct API key format
const groq = new Groq({ apiKey });

interface MoodRequest {
	scale: number;
	description: string;
}

app.get("/", (req, res) => {
	res.send({ message: "Mood Sense API is running Fine!" });
});

app.post("/api/mood-insight", async (req, res) => {
	try {
		const { scale, description }: MoodRequest = req.body;
		console.log(scale, description);

		const systemMessage =
			"You are an empathetic AI therapist skilled in providing emotional support and practical advice.";
		const userMessage = `As an empathetic AI therapist, analyze the following mood entry:
        Mood Scale (1-5): ${scale}
        Description: ${description}
        
        Please provide a thoughtful, supportive response that:
        1. Acknowledges their feelings
        2. Offers perspective on potential factors influencing their mood
        3. Suggests one or two practical steps they could take to maintain or improve their emotional well-being
        
        Keep the response concise but warm and supportive.`;

		// Use the groq chat completions API
		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: "system",
					content: systemMessage,
				},
				{
					role: "user",
					content: userMessage,
				},
			],
			model: "mixtral-8x7b-32768", // Ensure this model is available
			temperature: 0.7,
			max_tokens: 1024,
		});

		const insight =
			completion?.choices[0]?.message?.content ||
			"I apologize, but I couldn't generate an insight at this moment. Please try again.";

		res.json({ insight });
	} catch (error: any) {
		console.error("Error generating insight:", error.message || error);
		res.status(500).json({ error: "Failed to generate insight" });
	}
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
