import { useCallback, useEffect, useState } from "react";
import { Types } from "@discord/embedded-app-sdk";
import discordSdk, { setupDiscordSdk } from "./Discord";
import LoadingPage from "./Loading";
import useWebSocket from "./Socket";
import Quizmaster from "./Quizmaster";

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
  const [isLoading, setIsLoading] = useState(true);

  const [socket, addSocket] = useWebSocket();

  useEffect(() => {
    setupDiscordSdk().then((authToken) => {
      console.log("Discord SDK is authenticated", authToken);
      setAuth(authToken);
      appendVoiceChannelName();
      setIsLoading(false);
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

  const appendPlayer = async (
    participants: Types.GetActivityInstanceConnectedParticipantsResponse["participants"]
  ) => {
    setPlayerList(participants);
  };

  const renderPlayer = (player: string) => {
    switch (socket?.btn) {
      case "ready":
        return "ready";
      case player:
        return "on disabled";
      default:
        return "off disabled";
    }
  };

  const handleClick = useCallback(() => {
    addSocket({ btn: auth?.user.username });
  }, [addSocket]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { participants } =
        await discordSdk.commands.getInstanceConnectedParticipants();

      const extractUsernames = (
        list: Types.GetActivityInstanceConnectedParticipantsResponse["participants"]
      ) => list.map((player) => player.username);

      const participantUsernames = extractUsernames(participants);
      const playerListUsernames = extractUsernames(playerList);

      if (
        JSON.stringify(participantUsernames) !==
        JSON.stringify(playerListUsernames)
      ) {
        console.log("プレイヤー更新");
        appendPlayer(participants);
        if (
          !participants.some((player) => player.username === socket?.quizmaster)
        ) {
          addSocket({ quizmaster: null });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [playerList]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (socket?.quizmaster == auth?.user.username) {
    return <Quizmaster />;
  }

  return (
    <>
      <h1>早押しクイズ</h1>
      <p className="read-the-docs">{voiceChannelName}</p>
      <h2>{socket?.btn}</h2>
      <div className="wrap">
        <div className="back" />
        <div className="main" onClick={handleClick}>
          {playerList.map((player) => (
            <div
              className={`switch ${renderPlayer(player.username)}`}
              key={player.username}
            >
              <div className="button">
                <div className="light" />
                <div className="dots" />
              </div>
              <p>{player.nickname ? player.nickname : player.global_name}</p>
            </div>
          ))}
        </div>
      </div>
      <br />
      {socket?.quizmaster ? null : (
        <>
          <label>
            <input type="checkbox" />
            AIモード
          </label>
          <button
            onClick={() => {
              addSocket({ quizmaster: auth?.user.username });
            }}
          >
            出題者になる
          </button>
        </>
      )}
    </>
  );
};

export default App;
