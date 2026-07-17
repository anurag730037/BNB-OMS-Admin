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

                    // 🛍️ Show a beautiful real-time popup notification (real-time order alert)

                    toast.custom(
                        (t) => (
                            <div
                                className={`${
                                    t.visible ? "animate-enter" : "animate-leave"
                                } max-w-md w-full bg-white dark:bg-gray-950 shadow-2xl rounded-2xl pointer-events-auto flex flex-col border border-indigo-50 dark:border-indigo-950/60 overflow-hidden transition-all duration-300`}
                            >
                                <div className="p-4 flex-1">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 pt-0.5">
                                            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-xl">
                                                🛍️
                                            </div>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    New Order Received!
                                                </p>
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Order ID: <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{data.order.orderId || data.order._id}</span>
                                            </p>
                                            
                                            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs border-t border-b border-gray-100 dark:border-gray-900 py-2">
                                                <div>
                                                    <span className="text-gray-400 block">Retailer Shop</span>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate block">
                                                        {data.order.retailerId?.shopName || "Unknown Shop"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Owner Name</span>
                                                    <span className="font-medium text-gray-600 dark:text-gray-300 truncate block">
                                                        {data.order.retailerId?.ownerName || "Unknown"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Items Count</span>
                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                        {data.order.items?.length || 0} products
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block">Total Weight</span>
                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                        {data.order.totalkg} kg
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex border-t border-gray-100 dark:border-gray-900 divide-x divide-gray-100 dark:divide-gray-900">
                                    <button
                                        onClick={() => {
                                            toast.dismiss(t.id);
                                            window.location.reload();
                                        }}
                                        className="w-full border-0 rounded-none rounded-bl-2xl p-3 flex items-center justify-center text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:outline-none transition-colors duration-150 cursor-pointer"
                                    >
                                        🔄 Refresh Dashboard
                                    </button>
                                    <button
                                        onClick={() => toast.dismiss(t.id)}
                                        className="w-full border-0 rounded-none rounded-br-2xl p-3 flex items-center justify-center text-xs font-medium text-gray-500 hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:outline-none transition-colors duration-150 cursor-pointer"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ),
                        {
                            duration: 10000,
                            position: "top-right"
                        }
                    );
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

