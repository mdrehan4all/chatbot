import OpenAI from "openai";
import { useState } from "react";

const token = import.meta.env.VITE_TOKEN;
const endpoint = "https://models.github.ai/inference";
const modelName = "openai/gpt-4o";

// Initialize the client outside the component so it doesn't recreate on every render
const client = new OpenAI({ 
    baseURL: endpoint, 
    apiKey: token, 
    dangerouslyAllowBrowser: true // Required for frontend use, but read the warning below!
});

export default function Home() {
    const [msg, setMsg] = useState('');
    // Initialize with the system prompt so the bot knows its role
    const [messages, setMessages] = useState([
        { role: "system", content: "You are a helpful assistant. Your name is Ayush. You are student of computer application." }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    async function send() {
        if (!msg.trim()) return; // Don't send empty messages

        // 1. Add user message to UI immediately
        const newMessages = [...messages, { role: 'user', content: msg }];
        setMessages(newMessages);
        setMsg(''); // Clear input box
        setIsLoading(true);

        try {
            // 2. Send the updated conversation to the API
            const response = await client.chat.completions.create({
                messages: newMessages,
                temperature: 1.0,
                top_p: 1.0,
                max_tokens: 1000,
                model: modelName
            });

            // 3. Add the bot's response to the UI
            const botReply = response.choices[0].message;
            setMessages([...newMessages, botReply]);
            
        } catch (error) {
            console.error("Error communicating with AI:", error);
            alert("Something went wrong. Check your console.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>Chatbot</h1>
            
            {/* Chat History Display */}
            <div style={{ 
                border: '1px solid #ccc', 
                height: '400px', 
                overflowY: 'auto', 
                padding: '10px', 
                marginBottom: '10px',
                borderRadius: '8px'
            }}>
                {messages.filter(m => m.role !== 'system').map((m, index) => (
                    <div key={index} style={{ 
                        textAlign: m.role === 'user' ? 'right' : 'left', 
                        margin: '10px 0' 
                    }}>
                        <span style={{ 
                            background: m.role === 'user' ? '#007bff' : '#f1f1f1',
                            color: m.role === 'user' ? 'white' : 'black',
                            padding: '8px 12px',
                            borderRadius: '15px',
                            display: 'inline-block'
                        }}>
                            {m.content}
                        </span>
                    </div>
                ))}
                {isLoading && <div style={{ textAlign: 'left', color: 'gray' }}><em>Bot is typing...</em></div>}
            </div>

            {/* Input Area */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    value={msg} // Binds the input to the state
                    onChange={(e) => setMsg(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && send()} // Send on Enter key
                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <button 
                    onClick={send} 
                    disabled={isLoading}
                    style={{ padding: '10px 20px', cursor: 'pointer' }}
                >
                    Send
                </button>
            </div>
        </div>
    )
}