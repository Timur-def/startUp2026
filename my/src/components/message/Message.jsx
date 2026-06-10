import "./Message.css";

export default function Message({ text, type }) {
  return (
    <div
      className={`messageBox ${type == "error" ? 'error' : ''}`}
    >
      <p>{text}</p>
    </div>
  );
}
