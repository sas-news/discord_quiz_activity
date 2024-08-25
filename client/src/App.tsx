import { useEffect, useRef, useState } from "react";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import ReconnectingWebSocket from "reconnecting-websocket";

type Auth = {
  access_token: number | string;
  user: {
    username: string;
    discriminator: string;
    id: string;
    public_flags: number;
    avatar?: string | null;
    global_name?: string | null;
  };
  scopes: (string | number)[];
  expires: string;
  application: { id: string; name: string };
};

type Player = {
  username: string;
  discriminator: string;
  id: string;
  bot: boolean;
  flags: number;
  avatar?: string | null | undefined;
  global_name?: string | null | undefined;
  avatar_decoration_data?:
    | {
        asset: string;
        skuId?: string | undefined;
      }
    | null
    | undefined;
  premium_type?: number | null | undefined;
  nickname?: string | undefined;
};

const App = () => {
  let auth: Auth | null;

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
  const [playerList, setPlayerList] = useState<Player[]>([]);

  const socketRef = useRef<ReconnectingWebSocket>();

  useEffect(() => {
    setupDiscordSdk().then(() => {
      console.log("Discord SDK is authenticated");
      appendVoiceChannelName();
      appendPlayer();
    });

    const socket = new ReconnectingWebSocket("/.proxy");

    const handleButtonClick = () => {
      // サーバーにメッセージを送信
      socketRef.current?.send("送信メッセージ");
      setCount((prev) => prev + 1); 
    };
    socket.addEventListener("message", (event) => {
      console.log("Received message:", event.data);
    });

    return () => {
      socket.close();
      socket.removeEventListener("message", handleButtonClick);
    };
  }, []);
  const [count, setCount] = useState(0);

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
        <button
          onClick={() => {
            socketRef.current?.send("送信メッセージ");
          }}
        >
          count is {count}
        </button>
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
