import { useCallback, useEffect, useState } from "react";
import { Types } from "@discord/embedded-app-sdk";
import discordSdk, { setupDiscordSdk } from "./Discord";
import useWebSocket from "./Socket";

type Auth = {
  access_token: string;
  user: {
    username: string;
    discriminator: string;
    id: string;
    public_flags: number;
    avatar?: string | null | undefined;
    global_name?: string | null | undefined;
  };
  scopes: (
    | -1
    | "identify"
    | "email"
    | "connections"
    | "guilds"
    | "guilds.join"
    | "guilds.members.read"
    | "gdm.join"
    | "bot"
    | "rpc"
    | "rpc.notifications.read"
    | "rpc.voice.read"
    | "rpc.voice.write"
    | "rpc.video.read"
    | "rpc.video.write"
    | "rpc.screenshare.read"
    | "rpc.screenshare.write"
    | "rpc.activities.write"
    | "webhook.incoming"
    | "messages.read"
    | "applications.builds.upload"
    | "applications.builds.read"
    | "applications.commands"
    | "applications.commands.permissions.update"
    | "applications.commands.update"
    | "applications.store.update"
    | "applications.entitlements"
    | "activities.read"
    | "activities.write"
    | "relationships.read"
    | "relationships.write"
    | "voice"
    | "dm_channels.read"
    | "role_connections.write"
    | "presences.read"
    | "presences.write"
    | "openid"
    | "dm_channels.messages.read"
    | "dm_channels.messages.write"
    | "gateway.connect"
    | "account.global_name.update"
    | "payment_sources.country_code"
  )[];
  expires: string;
  application: {
    id: string;
    description: string;
    name: string;
    icon?: string | null | undefined;
    rpc_origins?: string[] | undefined;
  };
};

const App = () => {
  const [voiceChannelName, setVoiceChannelName] = useState("");
  const [playerList, setPlayerList] = useState<
    Types.GetActivityInstanceConnectedParticipantsResponse["participants"]
  >([]);
  const [auth, setAuth] = useState<Auth>();

  const [socketData, setSocket] = useWebSocket(
    `wss://${
      import.meta.env.VITE_DISCORD_CLIENT_ID
    }.discordsays.com/.proxy/api/ws?channel=${discordSdk.channelId}`
  );

  useEffect(() => {
    if (socketData != null) {
      console.log("Received from WebSocket", socketData);
    }
  }, [socketData?.btn]);

  useEffect(() => {
    setupDiscordSdk().then((authToken) => {
      console.log("Discord SDK is authenticated", authToken);
      setAuth(authToken);
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

  const renderPlayer = (player: string) => {
    switch (socketData?.btn) {
      case "wait":
        return "wait";
      case "ready":
        return "ready";
      case player:
        return "on";
      default:
        return "off";
    }
  };

  const handleClick = useCallback(() => {
    setSocket({ btn: auth?.user.username });
  }, [setSocket]);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">{voiceChannelName}</p>
      <h2>{socketData?.btn}</h2>
      <ul>
        {playerList.map((player) => (
          <button
            key={player.id}
            onClick={handleClick}
            className={renderPlayer(player.username)}
          >
            {player.username}
          </button>
        ))}
      </ul>
    </>
  );
};

export default App;
