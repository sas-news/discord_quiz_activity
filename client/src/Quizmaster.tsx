import useWebSocket from "./Socket";

const Quizmaster = () => {
  const [socket, setSocket] = useWebSocket();

  return (
    <div>
      <h2>管理者ボタン</h2>
      <button onClick={() => setSocket({ btn: "wait" })} className="admin">
        待機
      </button>
      <button onClick={() => setSocket({ btn: "ready" })} className="admin">
        スタート
      </button>
      <p>{socket?.btn}</p>
      <button onClick={() => setSocket({ quizmaster: null })}>
        出題者から降りる
      </button>
    </div>
  );
};
export default Quizmaster;
