import { useCallback, useEffect, useRef, useState } from "react";
import { Types } from "@discord/embedded-app-sdk";
import discordSdk, { setupDiscordSdk } from "./Discord";
import ReconnectingWebSocket from "reconnecting-websocket";

type SocketData = {
  msg: string;
};

const App = () => {
  const [voiceChannelName, setVoiceChannelName] = useState("");
  const [playerList, setPlayerList] = useState<
    Types.GetActivityInstanceConnectedParticipantsResponse["participants"]
  >([]);

  const [socketPush, setSocketPush] = useState<SocketData>({ msg: "" });
  const [socketPull, setSocketPull] = useState<SocketData>({ msg: "" });

  const webSocketRef = useRef<ReconnectingWebSocket>();

  useEffect(() => {
    const socket = new ReconnectingWebSocket(
      `wss://${
        import.meta.env.VITE_DISCORD_CLIENT_ID
      }.discordsays.com/.proxy/api/ws`
    );
    webSocketRef.current = socket;
    console.log("そけおおおおんんん");

    socket.addEventListener("message", (event) => {
      console.log("こう、、、しん？？");
      const socketData = JSON.parse(event.data);
      setSocketPull(socketData);
    });

    return () => socket.close();
  }, []);

  const [inputText, setInputText] = useState("");
  const submit: React.FormEventHandler = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const newSocketData = { ...socketPull, msg: inputText };
      setSocketPush(newSocketData);
    },
    [inputText]
  );
  useEffect(() => {
    setupDiscordSdk().then((auth) => {
      console.log("Discord SDK is authenticated", auth);
      appendVoiceChannelName();
      appendPlayer();
    });
  }, []);

  useEffect(() => {
    webSocketRef.current?.send(JSON.stringify(socketPush));
  }, [socketPush]);

  const appendVoiceChannelName = async () => {
    let activityChannelName = "Unknown";

    if (discordSdk.channelId != null && discordSdk.guildId != null) {
      const channel = await discordSdk.commands.getChannel({
        channel_id: discordSdk.channelId,
      });
      if (channel.name != null) {
        activityChannelName = channel.name;
      }
    }

    setVoiceChannelName(activityChannelName);
  };

  const appendPlayer = async () => {
    const { participants } =
      await discordSdk.commands.getInstanceConnectedParticipants();
    setPlayerList(participants);
  };

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">{voiceChannelName}</p>
      <ul>
        {playerList.map((player) => (
          <li key={player.id}>{player.username}</li>
        ))}
      </ul>
      <div>
        <h1>{socketPull.msg}</h1>
        <form onSubmit={submit}>
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button>送信</button>
        </form>
      </div>
    </>
  );
};

export default App;
