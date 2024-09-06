import { Server, Socket } from "socket.io";

const socket = ({ io }: { io: Server }) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on("sendMessage", (message) => {
      console.log(`Received message: ${message}`);
      socket.emit("responseMessage", message);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected ${socket.id}`);
    });
  });
};

export default socket;
