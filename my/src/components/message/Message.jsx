import "./Message.css";

export default function Message({ text, type }) {
  return (
    <div
      className="messageBox"
      style={
        type == "error"
          ? {
              backgroundColor: "#dc5b5b",
              border: "solid 3px #e34b4b",
            }
          : {}
      }
    >
      <p>{text}</p>
    </div>
  );
}
