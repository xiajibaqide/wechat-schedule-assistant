import { useState } from 'react';
import { sampleMessages } from '../data/sampleMessages.js';

function MessageInput({ onExtract }) {
  const [messageText, setMessageText] = useState(sampleMessages[0]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    onExtract(messageText);
  }

  return (
    <section className="panel">
      <h2>模拟微信群消息</h2>
      <form onSubmit={handleSubmit} className="stack">
        <label htmlFor="messageText">转发的群聊文字</label>
        <textarea
          id="messageText"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder="粘贴一条模拟微信群消息"
          rows="9"
        />
        <div className="button-row">
          <button type="submit">提取日程草稿</button>
          {sampleMessages.map((sampleMessage, index) => (
            <button
              key={sampleMessage}
              type="button"
              onClick={() => setMessageText(sampleMessage)}
            >
              示例 {index + 1}
            </button>
          ))}
        </div>
      </form>
    </section>
  );
}

export default MessageInput;
