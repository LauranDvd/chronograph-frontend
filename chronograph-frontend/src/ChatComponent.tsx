import React, { useState, useEffect, ChangeEvent } from "react";
import io from "socket.io-client";
import { Socket } from "socket.io-client";

// Define types for the chat messages
interface ChatMessage {
    sender: "User" | "Model" | "Error";
    content: string;
    liked?: boolean;
    disliked?: boolean;
    isLikeAvailable?: boolean;
    isDislikeAvailable?: boolean;
}

const SOCKET_URL = "http://localhost:5000"; // Update this if your Flask backend is on a different URL

const ChatApp: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userMessage, setUserMessage] = useState<string>("");
    const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

    // Set up WebSocket connection when the component mounts
    useEffect(() => {
        const newSocket: SocketIOClient.Socket = io(SOCKET_URL);

        newSocket.on("connect", () => {
            console.log("Connected to WebSocket server");
        });

        // Listen for incoming messages from the server
        newSocket.on("message", (data: { message?: string; error?: string }) => {
            if (data.message) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: "Model", content: data.message!, isLikeAvailable: true, isDislikeAvailable: true },
                ]);
            }
            if (data.error) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: "Error", content: data.error! },
                ]);
            }
        });

        // Save socket connection in state
        setSocket(newSocket);

        // Clean up the socket connection when the component unmounts
        return () => {
            newSocket.close();
        };
    }, []);

    // Handle sending messages to the backend via WebSocket
    const handleSendMessage = () => {
        if (userMessage.trim()) {
            // Send the message to the backend
            socket?.emit("message", { message: userMessage });

            // Add the user message to the chat window
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "User", content: userMessage },
            ]);

            // Clear the input field
            setUserMessage("");
        }
    };

    // Handle input change for message
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUserMessage(e.target.value);
    };

    const handleLike = (index: number) => {
        if (socket) {
            console.log(`emitting like`);
            socket.emit("like", { index });
        } else {
            console.log(`cannot emit like. no socket`);
        }

        setMessages(prev => {
            const updated = [...prev];
            updated[index].liked = true;
            updated[index].isDislikeAvailable = false;
            return updated;
        });
    };

    const handleDislike = (index: number) => {
        if (socket) {
            socket.emit("dislike", { index });
        }

        setMessages(prev => {
            const updated = [...prev];
            updated[index].disliked = true;
            updated[index].isLikeAvailable = false;
            return updated;
        });
    };


    return (
        <div>
            <h2>ChronoGraph:3000 Odyssey, Intelligent Historical Connections</h2>

            {/* Display chat messages */}
            <div style={{ marginBottom: "20px", maxHeight: "400px", overflowY: "auto" }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                        <strong>{msg.sender}:</strong> {msg.content}
                        {msg.sender === "Model" && (
                            <div style={{ marginTop: "5px" }}>
                                {msg.isLikeAvailable && <button
                                    onClick={() => handleLike(index)}
                                    disabled={msg.liked}
                                    style={{
                                        marginRight: "8px",
                                        color: msg.liked ? "green" : "black",
                                        cursor: msg.liked ? "default" : "pointer"
                                    }}
                                >
                                    👍 {msg.liked ? "Liked" : "Like"}
                                </button>}
                                {msg.isDislikeAvailable && <button
                                    onClick={() => handleDislike(index)}
                                    disabled={msg.disliked}
                                    style={{
                                        color: msg.disliked ? "red" : "black",
                                        cursor: msg.disliked ? "default" : "pointer"
                                    }}
                                >
                                    👎 {msg.disliked ? "Disliked" : "Dislike"}
                                </button>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* User input field and send button */}
            <input
                type="text"
                value={userMessage}
                onChange={handleInputChange}
                placeholder="Type a message"
                style={{ width: "80%", padding: "8px" }}
            />
            <button onClick={handleSendMessage} style={{ padding: "8px", marginLeft: "10px" }}>
                Send
            </button>
        </div>
    );
};

export default ChatApp;
