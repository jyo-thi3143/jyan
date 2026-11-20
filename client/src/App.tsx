import { useEffect, useRef, useState } from 'react'
import './App.css'
import JyanMascot from './components/JyanMascot'

type Section = 'chat' | 'timer' | 'files' | 'security'

const sections: { id: Section; label: string; icon: string; message: string }[] = [
  { id: 'chat', label: 'Chat', icon: '◌', message: '' },
  { id: 'timer', label: 'Timer', icon: '◷', message: 'Timer coming soon' },
  { id: 'files', label: 'Files', icon: '▱', message: '' },
  { id: 'security', label: 'Security', icon: '◇', message: 'Security coming soon' },
]

const exampleFiles = [
  { name: 'JYAN project', kind: 'Folder', icon: '📁', details: '8 items', modified: 'Today' },
  { name: 'Brand notes.pdf', kind: 'PDF', icon: '📄', details: '2.4 MB', modified: 'Yesterday' },
  { name: 'Moodboard.png', kind: 'Image', icon: '🖼️', details: '1.8 MB', modified: 'Nov 18' },
  { name: 'Launch checklist.docx', kind: 'Document', icon: '📝', details: '420 KB', modified: 'Nov 16' },
  { name: 'Research', kind: 'Folder', icon: '📁', details: '4 items', modified: 'Nov 14' },
  { name: 'Meeting notes.txt', kind: 'Text file', icon: '📃', details: '12 KB', modified: 'Nov 12' },
]

const sampleSecurityActivity = [
  { type: 'normal', title: 'Example: Settings reviewed', detail: 'Sample activity · Today, 9:41 AM', icon: '✓' },
  { type: 'normal', title: 'Example: New session started', detail: 'Sample activity · Today, 9:38 AM', icon: '↗' },
  { type: 'warning', title: 'Warning style preview', detail: 'Display example only · No warning was detected', icon: '!' },
]

function SecurityDashboard() {
  return (
    <section className="security-page" aria-label="Security dashboard">
      <div className="security-page-heading">
        <div>
          <p className="security-eyebrow">A little peace of mind</p>
          <h3>Security</h3>
          <p>Friendly visibility into your device’s safety.</p>
        </div>
        <span className="security-demo-badge">DEMO PREVIEW</span>
      </div>

      <div className="security-demo-notice" role="note">
        <span aria-hidden="true">✳</span>
        <p><strong>Demo data only.</strong> JYAN is not monitoring applications, processes, or activity on this computer.</p>
      </div>

      <div className="security-summary-grid">
        <section className="security-panel security-status-panel" aria-labelledby="security-status-title">
          <div className="security-panel-heading">
            <div>
              <p className="security-panel-kicker">SECURITY STATUS</p>
              <h4 id="security-status-title">Monitoring status</h4>
            </div>
            <span className="security-status-icon" aria-hidden="true">◇</span>
          </div>
          <div className="monitoring-status">
            <span className="monitoring-dot" aria-hidden="true" />
            <strong>Monitoring active</strong>
            <span className="sample-tag">Sample</span>
          </div>
          <p className="security-panel-note">This is an example status for the interface preview.</p>
        </section>

        <section className="security-panel security-alerts-panel" aria-labelledby="security-alerts-title">
          <div className="security-panel-heading">
            <div>
              <p className="security-panel-kicker">ALL CLEAR</p>
              <h4 id="security-alerts-title">Security Alerts</h4>
            </div>
            <span className="alert-status-icon" aria-hidden="true">✓</span>
          </div>
          <div className="no-alerts">
            <span aria-hidden="true">♡</span>
            <div>
              <strong>No alerts detected</strong>
              <p>No real monitoring is active in this preview.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="security-panel security-activity-panel" aria-labelledby="security-activity-title">
        <div className="security-activity-heading">
          <div>
            <p className="security-panel-kicker">SAMPLE EVENTS</p>
            <h4 id="security-activity-title">Recent Activity</h4>
          </div>
          <span className="sample-tag">Example data</span>
        </div>
        <div className="security-activity-list">
          {sampleSecurityActivity.map((activity) => (
            <article className={`security-activity-item ${activity.type}`} key={activity.title}>
              <span className="activity-icon" aria-hidden="true">{activity.icon}</span>
              <div className="activity-copy">
                <h5>{activity.title}</h5>
                <p>{activity.detail}</p>
              </div>
              <span className="activity-type-label">
                {activity.type === 'warning' ? 'Demo warning' : 'Normal · sample'}
              </span>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('chat')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [timerInputs, setTimerInputs] = useState({ minutes: '5', seconds: '00' })
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(300)
  const [remainingSeconds, setRemainingSeconds] = useState(300)
  const [timerDeadline, setTimerDeadline] = useState<number | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [fileSearch, setFileSearch] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredFiles = exampleFiles.filter((file) =>
    `${file.name} ${file.kind} ${file.details}`.toLowerCase().includes(fileSearch.trim().toLowerCase()),
  )

  useEffect(() => {
    if (!isTimerRunning || timerDeadline === null) return

    const updateRemainingTime = () => {
      const remaining = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000))
      setRemainingSeconds(remaining)

      if (remaining === 0) {
        setIsTimerRunning(false)
        setTimerDeadline(null)
      }
    }

    updateRemainingTime()
    const intervalId = window.setInterval(updateRemainingTime, 250)
    return () => window.clearInterval(intervalId)
  }, [isTimerRunning, timerDeadline])

  const updateTimerInputs = (minutes: string, seconds: string) => {
    const duration = Math.max(0, Number(minutes) || 0) * 60 + Math.min(59, Math.max(0, Number(seconds) || 0))
    setTimerInputs({ minutes, seconds })
    setInitialTimerSeconds(duration)
    setRemainingSeconds(duration)
  }

  const startTimer = () => {
    if (remainingSeconds <= 0) return
    setTimerDeadline(Date.now() + remainingSeconds * 1000)
    setIsTimerRunning(true)
  }

  const pauseTimer = () => {
    if (timerDeadline !== null) {
      setRemainingSeconds(Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000)))
    }
    setTimerDeadline(null)
    setIsTimerRunning(false)
  }

  const resetTimer = () => {
    setTimerDeadline(null)
    setIsTimerRunning(false)
    setRemainingSeconds(initialTimerSeconds)
  }

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
              {sections.map(({ id, label, icon }) => (
                <button
                  key={id}
                  className={activeSection === id ? 'active' : undefined}
                  aria-current={activeSection === id ? 'page' : undefined}
                  onClick={() => setActiveSection(id)}
                >
                  <span className="nav-icon" aria-hidden="true">{icon}</span>
                  <span className="nav-text">{label}</span>
                </button>
              ))}
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
                  <h2>{activeSection === 'chat' ? 'JYAN' : sections.find(({ id }) => id === activeSection)?.label}</h2>
                  <p>{activeSection === 'chat' ? 'Your desktop. Your rules.' : 'A little space for your desktop companion'}</p>
                </div>
              </div>
              <span className="header-caption">
                {activeSection === 'chat'
                  ? 'A little help, whenever you need it'
                  : activeSection === 'timer'
                    ? 'A little timer for your day'
                    : activeSection === 'files'
                      ? 'Your files, all tucked in'
                      : 'Demo preview · no monitoring yet'}
              </span>
            </header>

            {activeSection === 'chat' ? (
              <>
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
              </>
            ) : activeSection === 'timer' ? (
              <section className="timer-page" aria-label="Timer">
                <p className="timer-eyebrow">A little moment for you</p>
                <div className="timer-display" role="timer" aria-live="off">
                  {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}
                  <span>:</span>
                  {String(remainingSeconds % 60).padStart(2, '0')}
                </div>
                <div className="timer-duration" aria-label="Timer duration">
                  <label>
                    <span>Minutes</span>
                    <input
                      type="number"
                      min="0"
                      value={timerInputs.minutes}
                      disabled={isTimerRunning}
                      onChange={(event) => updateTimerInputs(event.target.value, timerInputs.seconds)}
                    />
                  </label>
                  <span className="timer-duration-separator">:</span>
                  <label>
                    <span>Seconds</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={timerInputs.seconds}
                      disabled={isTimerRunning}
                      onChange={(event) => updateTimerInputs(timerInputs.minutes, event.target.value)}
                    />
                  </label>
                </div>
                <div className="timer-actions">
                  <button className="timer-start" onClick={startTimer} disabled={isTimerRunning || remainingSeconds === 0}>
                    Start
                  </button>
                  <button onClick={pauseTimer} disabled={!isTimerRunning}>Pause</button>
                  <button onClick={resetTimer}>Reset</button>
                </div>
                <p className="timer-caption">
                  {isTimerRunning ? 'You’ve got this — take it one moment at a time.' : 'Set a time, then settle in.'}
                </p>
              </section>
            ) : activeSection === 'files' ? (
              <section className="files-page" aria-label="Files">
                <div className="files-heading">
                  <div>
                    <p className="files-eyebrow">A tidy little space</p>
                    <h3>Your files</h3>
                    <p className="files-description">Browse these sample items or choose a file from your device.</p>
                  </div>
                  <button className="files-choose-button" onClick={() => fileInputRef.current?.click()}>
                    <span aria-hidden="true">＋</span> Choose a file
                  </button>
                  <input
                    ref={fileInputRef}
                    className="files-hidden-input"
                    type="file"
                    aria-label="Choose a file from your device"
                    onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name ?? '')}
                  />
                </div>

                <div className="files-tools">
                  <label className="files-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      aria-label="Search example files"
                      placeholder="Search your files..."
                      value={fileSearch}
                      onChange={(event) => setFileSearch(event.target.value)}
                    />
                  </label>
                  <span className="files-count">{filteredFiles.length} items</span>
                </div>

                {selectedFileName && (
                  <p className="files-selection" role="status">
                    Selected locally: <strong>{selectedFileName}</strong>. No upload has taken place.
                  </p>
                )}

                {filteredFiles.length > 0 ? (
                  <div className="files-grid">
                    {filteredFiles.map((file) => (
                      <article className="file-card" key={file.name}>
                        <div className={`file-card-icon ${file.kind === 'Folder' ? 'folder-icon' : ''}`} aria-hidden="true">
                          {file.icon}
                        </div>
                        <div className="file-card-copy">
                          <h4 title={file.name}>{file.name}</h4>
                          <p>{file.kind} <span>·</span> {file.details}</p>
                          <small>Modified {file.modified}</small>
                        </div>
                        <span className="file-card-more" aria-hidden="true">···</span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="files-empty">
                    <span aria-hidden="true">⌕</span>
                    <h4>No matching examples</h4>
                    <p>Try another search to find a sample file.</p>
                  </div>
                )}
                <p className="files-prototype-note">These are example items. JYAN doesn’t have access to your desktop files yet.</p>
              </section>
            ) : activeSection === 'security' ? (
              <SecurityDashboard />
            ) : (
              <section className="placeholder-page" aria-live="polite">
                <span className="placeholder-icon" aria-hidden="true">
                  {sections.find(({ id }) => id === activeSection)?.icon}
                </span>
                <h3>{sections.find(({ id }) => id === activeSection)?.message}</h3>
                <p>JYAN is getting this little corner ready for you.</p>
              </section>
            )}
          </main>
        </>
      )}
    </div>
  )
}

export default App
