import { useContext, createContext, useState } from "react";
import io, { Socket } from "socket.io-client";

interface Context {
  socket: Socket;
  setUsername: Function;
  messages?: { message: string; username: string; time: string }[];
  setMessages: Function;
}

const socket = io("/.proxy/api/socket");

socket.on("connect", () => {
  console.log(`Connected to server with ID: ${socket.id}`);
});

socket.on("responseMessage", (message) => {
  console.log(`Received response message: ${message}`);
});

const SocketContext = createContext<Context>({
  socket,
  setUsername: () => false,
  setMessages: () => false,
});

const SocketsProvider = (props: any) => {
  const [messages, setMessages] = useState([]);

  return (
    <SocketContext.Provider
      value={{ socket, messages, setMessages }}
      {...props}
    />
  );
};

export const useSockets = () => useContext(SocketContext);

export default SocketsProvider;
