import { useState } from 'react'
import './App.css'
import JyanMascot from './components/JyanMascot'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<string[]>([])

  const handleSend = () => {
    const message = input.trim()
    if (!message) return

    setMessages((currentMessages) => [...currentMessages, message])
    setInput('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSend()
  }

  return (
    <div className="jyan-app">
      <JyanMascot onClick={() => setIsOpen((open) => !open)} />

      {isOpen && (
        <>
          <aside className="sidebar">
            <div className="brand">
              <h1>JYAN</h1>
              <p>Your little desktop companion</p>
            </div>

            <p className="nav-label">Workspace</p>
            <nav aria-label="Workspace">
              <button className="active" aria-current="page">
                <span className="nav-icon" aria-hidden="true">◌</span>
                <span className="nav-text">Chat</span>
              </button>
              <button>
                <span className="nav-icon" aria-hidden="true">◷</span>
                <span className="nav-text">Timer</span>
              </button>
              <button>
                <span className="nav-icon" aria-hidden="true">▱</span>
                <span className="nav-text">Files</span>
              </button>
              <button>
                <span className="nav-icon" aria-hidden="true">◇</span>
                <span className="nav-text">Security</span>
              </button>
            </nav>

            <div className="sidebar-note">
              <span className="online-dot" aria-hidden="true" />
              <span>Here when you need me</span>
            </div>
          </aside>

          <main className="chat">
            <header className="chat-header">
              <div className="chat-title">
                <span className="chat-avatar" aria-hidden="true">✳</span>
                <div>
                  <h2>JYAN</h2>
                  <p>Your desktop. Your rules.</p>
                </div>
              </div>
              <span className="header-caption">A little help, whenever you need it</span>
            </header>

            <section className="messages" aria-label="Chat messages" aria-live="polite">
              <div className="message-row">
                <span className="tiny-avatar" aria-hidden="true">✳</span>
                <div className="message jyan-message">Hi! I'm JYAN. How can I help you?</div>
              </div>

              {messages.map((message, index) => (
                <div className="message-row user-row" key={`${index}-${message}`}>
                  <div className="message user-message">{message}</div>
                </div>
              ))}
            </section>

            <div className="chat-input-wrap">
              <div className="chat-input">
                <input
                  type="text"
                  aria-label="Message JYAN"
                  placeholder="Write a message..."
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button onClick={handleSend} aria-label="Send message">
                  Send <span aria-hidden="true">↗</span>
                </button>
              </div>
              <p className="input-hint">Press Enter to send</p>
            </div>
          </main>
        </>
      )}
    </div>
  )
}

export default App
