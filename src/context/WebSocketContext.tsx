import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

type WebSocketContextType = {
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {

    const { token } = useAuth();
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {

        // 1. Connect to WebSocket only if the admin is logged in (has a token)
        if (!token) {
            if (socketRef.current) {
                socketRef.current.close();
            }

            setIsConnected(false);
            return
        }

        const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:6969";


        console.log(`🔌 Connecting to WebSocket at ${wsUrl}...`);

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        // Connection opened successfully
        ws.onopen = () => {
            console.log("🟢 Connected to WebSocket Server!");
            setIsConnected(true);
        }

        // Listen for messages from the backend
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("📩 WebSocket message received:", data);

                if (data.event === "NEW_ORDER") {
                    // 🔔 Optional: Play a subtle notification sound (this uses a free audio asset)

                    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/911/911-84.wav");

                    audio.play().catch((err) => console.log("Sound playback blocked by browser:", err));

                    // 🛍️ Show a beautiful real-time popup notification

                    toast.success((t) => (
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-gray-800">🛍️ New Order Received!</span>
                            <span className="text-xs text-gray-500">
                                Order ID: {data.order.orderId || data.order._id}
                            </span>
                            <span className="text-xs font-semibold text-indigo-600">
                                Total Weight: {data.order.totalkg} kg
                            </span>
                        </div>
                    ), {
                        duration: 6000,
                        position: "top-right"
                    });
                }

            } catch (error) {
                console.error("⚠️ Error parsing WebSocket message:", error);
            }
        };

        // connection closed
        ws.onclose = () => {
            console.log("❌ WebSocket connection closed");
            setIsConnected(false);
        }

        // connection error
        ws.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
        };

        // cleanup function on unmount
        return () => {
            console.log("🧹 Closing WebSocket connection...");
            ws.close();
        }

    }, [token]);

    return (
        <WebSocketContext.Provider value={{ isConnected }} >
            {children}
        </WebSocketContext.Provider>
    )

}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);

    if (!context) {
        throw new Error("useWebSocket must be used inside WebSocketProvider");
    }

    return context;

}

