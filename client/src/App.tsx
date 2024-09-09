import { useCallback, useEffect, useState } from "react";
import { Types } from "@discord/embedded-app-sdk";
import discordSdk, { setupDiscordSdk } from "./Discord";
import useWebSocket from "./Socket";

const App = () => {
  const [voiceChannelName, setVoiceChannelName] = useState("");
  const [playerList, setPlayerList] = useState<
    Types.GetActivityInstanceConnectedParticipantsResponse["participants"]
  >([]);

  const [socketData, setSocket] = useWebSocket(
    `wss://${
      import.meta.env.VITE_DISCORD_CLIENT_ID
    }.discordsays.com/.proxy/api/ws?channel=${discordSdk.channelId}`
  );

  const [inputText, setInputText] = useState("");
  const submit: React.FormEventHandler = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      setSocket({ msg: inputText });
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
        <h1>{socketData?.msg}</h1>
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
