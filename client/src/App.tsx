import { useCallback, useEffect, useRef, useState } from "react";
import { DiscordSDK, Types } from "@discord/embedded-app-sdk";
import ReconnectingWebSocket from "reconnecting-websocket";

const App = () => {
  let auth;

  const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

  const setupDiscordSdk = async () => {
    await discordSdk.ready();
    console.log("Discord SDK is ready");

    const { code } = await discordSdk.commands.authorize({
      client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify", "guilds", "guilds.members.read"],
    });

    // Retrieve an access_token from your activity's server
    const response = await fetch("/.proxy/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
      }),
    });
    const { access_token } = await response.json();

    // Authenticate with Discord client (using the access_token)
    auth = await discordSdk.commands.authenticate({
      access_token,
    });

    if (auth == null) {
      throw new Error("Authenticate command failed");
    }

    console.log("Authenticated with access token:", auth.access_token);
  };

  const [voiceChannelName, setVoiceChannelName] = useState("");
  const [playerList, setPlayerList] = useState<
    Types.GetActivityInstanceConnectedParticipantsResponse["participants"]
  >([]);
  const [message, setMessage] = useState("");
  const webSocketRef = useRef<ReconnectingWebSocket>();

  useEffect(() => {
    const socket = new ReconnectingWebSocket(`wss://localhost:3690`);
    webSocketRef.current = socket;
    console.log("そけおおおおんんん");

    socket.addEventListener("message", (event) => {
      setMessage(event.data);
    });

    return () => socket.close();
  }, []);

  useEffect(() => {
    setupDiscordSdk().then(() => {
      console.log("Discord SDK is authenticated");
      appendVoiceChannelName();
      appendPlayer();
    });
  }, []);

  const [inputText, setInputText] = useState("");
  const submit: React.FormEventHandler = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      webSocketRef.current?.send(inputText);
    },
    [inputText]
  );

  const appendVoiceChannelName = async () => {
    let activityChannelName = "Unknown";

    // Requesting the channel in GDMs (when the guild ID is null) requires
    // the dm_channels.read scope which requires Discord approval.
    if (discordSdk.channelId != null && discordSdk.guildId != null) {
      // Over RPC collect info about the channel
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
        <h1>{JSON.stringify(message)}</h1>
        <form onSubmit={submit}>
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button>送信</button>
        </form>
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
    </>
  );
};

export default App;
