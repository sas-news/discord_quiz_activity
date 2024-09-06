import { useEffect, useRef, useState } from "react";
import { Types } from "@discord/embedded-app-sdk";
import discordSdk, { setupDiscordSdk } from "./Discord";
import { useSockets } from "./context/socket.context";

const App = () => {
  const [voiceChannelName, setVoiceChannelName] = useState("");
  const [playerList, setPlayerList] = useState<
    Types.GetActivityInstanceConnectedParticipantsResponse["participants"]
  >([]);
  const { socket, messages, setMessages } = useSockets();
  const messageRef = useRef<HTMLInputElement>(null);
  console.log(messages);

  const handleClick = () => {
    if (messageRef.current) {
      const message = messageRef.current.value;
      if (!String(message).trim()) return;

      if (message.trim() === "") {
        console.error("Message is empty");
        return;
      }
      console.log(message);
      socket.emit("sendMessage", message);

      messageRef.current.value = "";
    }
  };

  socket.on("responseMessage", (message) => {
    console.log(message);
    setMessages([...messages, message]);
    console.log(messages);
  });

  useEffect(() => {
    setupDiscordSdk().then((auth) => {
      console.log("Discord SDK is authenticated");
      appendVoiceChannelName();
      appendPlayer();
    });
  }, []);

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
        <input type="text" ref={messageRef} placeholder="write message" />
        <button onClick={handleClick}>Send</button>
        <Messages />
      </div>
    </>
  );
};

const Messages = () => {
  const { messages } = useSockets();
  return (
    <>
      {messages && (
        <div>
          {messages.map(({ message }, index) => {
            return <li key={index}>{message}</li>;
          })}
        </div>
      )}
    </>
  );
};

export default App;
