import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

type SocketData = {
  msg: string;
};

const useWebSocket = (
  url: string
): [SocketData | null, (data: SocketData) => void] => {
  const [socketPush, setSocketPush] = useState<SocketData | null>(null);
  const [socketPull, setSocketPull] = useState<SocketData | null>(null);

  const setSocket = (data: SocketData) => {
    setSocketPush({ ...socketPull, ...data });
  };

  const webSocketRef = useRef<ReconnectingWebSocket>();

  useEffect(() => {
    const socket = new ReconnectingWebSocket(url);
    webSocketRef.current = socket;
    console.log("そけおおおおんんん");

    socket.addEventListener("message", (event) => {
      console.log("こう、、、しん？？");
      const socketData = JSON.parse(event.data);
      setSocketPull(socketData);
    });

    return () => socket.close();
  }, []);

  useEffect(() => {
    webSocketRef.current?.send(JSON.stringify(socketPush));
  }, [socketPush]);

  return [socketPull, setSocket];
};

export default useWebSocket;
