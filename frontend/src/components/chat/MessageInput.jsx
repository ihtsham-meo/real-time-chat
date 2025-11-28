import React, { useState, useRef } from "react";
import { socket } from "../../socket";
import { uploadMessageFile } from "../../api/messageApi";

export default function MessageInput({ chatId }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  const handleSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview({ url: URL.createObjectURL(f), type: f.type, name: f.name });
  };

  const handleSend = async () => {
    if (!chatId) return;

    // If file attached: upload via REST (backend sendMessage handles file and returns created message)
    if (file) {
      try {
        const res = await uploadMessageFile(chatId, file, text);
        const msg = res.message;
        // emit to socket so other clients get newMessage (if server doesn't auto-broadcast)
        socket.emit("sendMessage", {
          chatId,
          content: msg.content,
          messageType: msg.messageType,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
        });
        setFile(null);
        setPreview(null);
        setText("");
        inputRef.current.value = "";
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // If text only
    if (text.trim()) {
      // we emit via socket (socket handler will create message in DB)
      socket.emit("sendMessage", { chatId, content: text, messageType: "text" });
      setText("");
    }
  };

  return (
    <div className="message-input">
      {preview && (
        <div className="preview">
          {preview.type.startsWith("image") ? (
            <img src={preview.url} alt="preview" />
          ) : preview.type.startsWith("video") ? (
            <video src={preview.url} controls />
          ) : preview.type.startsWith("audio") ? (
            <audio src={preview.url} controls />
          ) : (
            <div className="file-name">{preview.name}</div>
          )}
          <button onClick={() => { setPreview(null); setFile(null); }}>Remove</button>
        </div>
      )}

      <div className="input-row">
        <label className="attach">
          📎
          <input ref={inputRef} type="file" onChange={handleSelect} />
        </label>

        <input
          className="text-input"
          placeholder="Message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
        />

        <button className="send-btn" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
