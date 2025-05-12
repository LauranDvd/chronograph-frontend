import React, { useState, useEffect, ChangeEvent } from "react";
import io from "socket.io-client";
import { MarkdownMessage } from './MarkdownMessage'

interface ChatMessage {
    sender: "User" | "Model" | "Error";
    content: string;
    liked?: boolean;
    disliked?: boolean;
    isLikeAvailable?: boolean;
    isDislikeAvailable?: boolean;
}

const SOCKET_URL = "http://localhost:5000";

const ChatApp: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userMessage, setUserMessage] = useState<string>("");
    const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const newSocket: SocketIOClient.Socket = io(SOCKET_URL);

        newSocket.on("connect", () => {
            console.log("Connected to WebSocket server");
        });

        newSocket.on("message", (data: { message?: string; error?: string }) => {
            if (data.message) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: "Model", content: data.message!, isLikeAvailable: true, isDislikeAvailable: true },
                ]);
                setLoading(false);
            }
            if (data.error) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: "Error", content: data.error! },
                ]);
                setLoading(false);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const handleSendMessage = () => {
        if (userMessage.trim()) {
            setLoading(true);
            socket?.emit("message", { message: userMessage });

            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "User", content: userMessage },
            ]);

            setUserMessage("");
        }
    };

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
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h2 className="cinzel-title">
                ChronoGraph:3000 Odyssey<br />
                <span className="cinzel-subtitle">Intelligent Historical Connections</span>
            </h2>

            <div
                style={{
                    marginBottom: "20px",
                    maxHeight: "60vh",
                    overflowY: "auto",
                    backgroundColor: "#1e1e1e",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                    textAlign: "left",
                }}
            >
                {messages.map((msg, index) => {
                    const isUser = msg.sender === "User";
                    const isModel = msg.sender === "Model";

                    return (
                        <div
                            key={index}
                            style={{
                                marginBottom: "15px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: isUser ? "flex-end" : "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: isUser ? "#4a90e2" : isModel ? "#2d2d2d" : "#b00020",
                                    color: "white",
                                    padding: "12px 16px",
                                    borderRadius: "10px",
                                    maxWidth: "80%",
                                    wordWrap: "break-word",
                                }}
                            >
                                <MarkdownMessage sender={msg.sender} content={msg.content} />
                            </div>

                            {isModel && (
                                <div style={{ marginTop: "5px" }}>
                                    {msg.isLikeAvailable && (
                                        <button
                                            onClick={() => handleLike(index)}
                                            disabled={msg.liked}
                                            style={{
                                                marginRight: "8px",
                                                color: msg.liked ? "lightgreen" : "white",
                                                backgroundColor: "#2d2d2d",
                                            }}
                                        >
                                            👍 {msg.liked ? "Liked" : "Like"}
                                        </button>
                                    )}
                                    {msg.isDislikeAvailable && (
                                        <button
                                            onClick={() => handleDislike(index)}
                                            disabled={msg.disliked}
                                            style={{
                                                color: msg.disliked ? "salmon" : "white",
                                                backgroundColor: "#2d2d2d",
                                            }}
                                        >
                                            👎 {msg.disliked ? "Disliked" : "Dislike"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {loading && (
                    <div style={{ fontStyle: "italic", color: "gray" }}>
                        Waiting for model's response...
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                    type="text"
                    value={userMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    style={{
                        flexGrow: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                    }}
                />
                <button
                    onClick={handleSendMessage}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        backgroundColor: "#4a90e2",
                        color: "white",
                        fontWeight: "bold",
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatApp;
