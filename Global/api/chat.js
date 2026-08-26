import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    const completion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: 'You are a helpful logistics assistant.' },
        { role: 'user', content: message }
      ],
    });

    const reply = completion.choices[0]?.message?.content || 'No response generated.';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Groq error:', err);
    return res.status(500).json({ error: err.message });
  }
}
