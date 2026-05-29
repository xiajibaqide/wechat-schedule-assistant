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
      <h2>Simulated WeChat Message</h2>
      <form onSubmit={handleSubmit} className="stack">
        <label htmlFor="messageText">Forwarded group chat text</label>
        <textarea
          id="messageText"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          rows="9"
        />
        <div className="button-row">
          <button type="submit">Extract draft</button>
          <button type="button" onClick={() => setMessageText(sampleMessages[1])}>
            Use sample
          </button>
        </div>
      </form>
    </section>
  );
}

export default MessageInput;
