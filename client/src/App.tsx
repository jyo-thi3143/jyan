import { useEffect, useRef, useState } from 'react'
import './App.css'
import JyanMascot from './components/JyanMascot'

type Section = 'chat' | 'timer' | 'files' | 'security'
type ChatMessage = { role: 'user' | 'assistant'; content: string }
type SelectedFile = {
  name: string
  size: number
  status: 'uploading' | 'ready' | 'error'
  documentId?: string
  extractedCharacterCount?: number
  error?: string
}
type DocumentUploadResponse = {
  document_id: string
  filename: string
  extracted_character_count: number
  error?: string
}
type ChatStreamEvent =
  | { type: 'search' }
  | { type: 'token'; text: string }
  | { type: 'done'; sources: { title: string; url: string }[] }
  | { type: 'error'; message: string }

const CHAT_ENDPOINT = 'http://127.0.0.1:5001/api/chat'
const DOCUMENT_UPLOAD_ENDPOINT = 'http://127.0.0.1:5001/api/documents'

function handleChatEvent(block: string, onToken: (text: string) => void) {
  const data = block
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n')

  if (!data) return

  const event = JSON.parse(data) as ChatStreamEvent
  if (event.type === 'token') onToken(event.text)
  if (event.type === 'error') throw new Error(event.message)
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

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

type FocusEvent = { kind: string; text: string }
type FocusSnapshot = {
  active: boolean
  remaining?: number
  total?: number
  flags?: number
  away?: number
  events: FocusEvent[]
}

const FOCUS_SESSION_ENDPOINT = 'http://127.0.0.1:5001/api/session'

async function fetchFocusSnapshot(): Promise<FocusSnapshot> {
  const response = await fetch(FOCUS_SESSION_ENDPOINT, { cache: 'no-store' })
  if (!response.ok) throw new Error(`The focus service returned status ${response.status}.`)

  const data = await response.json() as FocusSnapshot
  if (!Array.isArray(data.events) || typeof data.active !== 'boolean') {
    throw new Error('The focus service returned an unexpected response.')
  }
  return data
}

function SecurityDashboard() {
  const [snapshot, setSnapshot] = useState<FocusSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [sessionAction, setSessionAction] = useState<'start' | 'stop' | null>(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let isCancelled = false
    let timeoutId = 0

    const loadSnapshot = async () => {
      try {
        const data = await fetchFocusSnapshot()

        if (!isCancelled) {
          setSnapshot(data)
          setLoadError('')
          setIsLoading(false)
        }
      } catch {
        if (!isCancelled) {
          setLoadError('JYAN could not connect to the focus service. Make sure the Flask backend is running.')
          setIsLoading(false)
        }
      } finally {
        if (!isCancelled) timeoutId = window.setTimeout(loadSnapshot, 2000)
      }
    }

    void loadSnapshot()
    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [])

  const changeFocusSession = async (action: 'start' | 'stop') => {
    setSessionAction(action)
    setActionError('')

    try {
      const requestOptions: RequestInit = { method: 'POST' }
      if (action === 'start') {
        requestOptions.headers = { 'Content-Type': 'application/json' }
        requestOptions.body = JSON.stringify({})
      }

      const response = await fetch(`${FOCUS_SESSION_ENDPOINT}/${action}`, requestOptions)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(errorData?.error ?? `The focus service returned status ${response.status}.`)
      }

      setSnapshot(await fetchFocusSnapshot())
      setLoadError('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update the focus session.')
    } finally {
      setSessionAction(null)
    }
  }

  const statusLabel = isLoading && !snapshot
    ? 'Connecting…'
    : loadError
      ? 'Unavailable'
      : snapshot?.active
        ? 'Monitoring active'
        : 'Monitoring inactive'

  return (
    <section className="security-page" aria-label="Security dashboard">
      <div className="security-page-heading">
        <div>
          <p className="security-eyebrow">A little peace of mind</p>
          <h3>Focus monitoring</h3>
          <p>Focus activity and status from JYAN’s backend.</p>
        </div>
        <span className={`backend-status-badge ${loadError ? 'disconnected' : ''}`}>
          {loadError ? 'API UNAVAILABLE' : snapshot ? 'LIVE BACKEND DATA' : 'CONNECTING'}
        </span>
      </div>

      <div className={`focus-live-note ${loadError ? 'connection-error' : ''}`} role="status">
        <span aria-hidden="true">✳</span>
        <p>
          {loadError
            ? loadError
            : 'Connected to the backend focus service. New focus events refresh about every two seconds.'}
        </p>
      </div>

      <div className="security-summary-grid">
        <section className="security-panel security-status-panel" aria-labelledby="security-status-title">
          <div className="security-panel-heading">
            <div>
              <p className="security-panel-kicker">FOCUS STATUS</p>
              <h4 id="security-status-title">Focus monitoring</h4>
            </div>
            <span className="security-status-icon" aria-hidden="true">◇</span>
          </div>
          <div className={`monitoring-status ${snapshot?.active && !loadError ? 'active' : ''}`}>
            <span className={`monitoring-dot ${snapshot?.active && !loadError ? 'is-active' : ''}`} aria-hidden="true" />
            <strong>{statusLabel}</strong>
          </div>
          <p className="security-panel-note">
            {snapshot?.active && !loadError
              ? `${Math.ceil((snapshot.remaining ?? 0) / 60)} minutes remaining · ${snapshot.flags ?? 0} focus flags`
              : loadError
                ? 'Live monitoring status is unavailable.'
                : snapshot
                  ? 'Start the backend’s default 25-minute focus session to begin monitoring.'
                  : 'Checking the backend focus-session status…'}
          </p>
          <div className="focus-session-actions">
            {snapshot?.active ? (
              <button
                className="focus-stop-button"
                onClick={() => changeFocusSession('stop')}
                disabled={Boolean(sessionAction) || Boolean(loadError)}
              >
                {sessionAction === 'stop' ? 'Stopping…' : 'Stop focus session'}
              </button>
            ) : (
              <button
                className="focus-start-button"
                onClick={() => changeFocusSession('start')}
                disabled={!snapshot || Boolean(sessionAction) || Boolean(loadError)}
              >
                {sessionAction === 'start' ? 'Starting…' : 'Start focus session'}
              </button>
            )}
          </div>
          {actionError && <p className="focus-action-error" role="alert">{actionError}</p>}
        </section>

        <section className="security-panel focus-summary-panel" aria-labelledby="focus-summary-title">
          <div className="security-panel-heading">
            <div>
              <p className="security-panel-kicker">CURRENT SESSION</p>
              <h4 id="focus-summary-title">Session summary</h4>
            </div>
            <span className="focus-summary-icon" aria-hidden="true">◷</span>
          </div>
          <div className="focus-summary-stats">
            <div>
              <span>Distractions flagged</span>
              <strong>{snapshot && !loadError && snapshot.flags !== undefined ? snapshot.flags : '—'}</strong>
            </div>
            <div>
              <span>Time away</span>
              <strong>{snapshot && !loadError && snapshot.away !== undefined ? `${snapshot.away}s` : '—'}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="security-panel security-activity-panel" aria-labelledby="security-activity-title">
        <div className="security-activity-heading">
          <div>
            <p className="security-panel-kicker">BACKEND EVENTS</p>
            <h4 id="security-activity-title">Recent Activity</h4>
          </div>
          <span className="sample-tag">{loadError ? 'Unavailable' : snapshot ? 'Live data' : 'Waiting for data'}</span>
        </div>
        <div className="security-activity-list">
          {snapshot?.events.map((event, index) => {
            const isFocusWarning = event.kind === 'left'
            return (
              <article className={`security-activity-item ${isFocusWarning ? 'warning' : 'normal'}`} key={`${index}-${event.kind}-${event.text}`}>
                <span className="activity-icon" aria-hidden="true">{isFocusWarning ? '!' : '✓'}</span>
                <div className="activity-copy">
                  <h5>{isFocusWarning ? 'Distraction detected' : event.kind === 'finished' ? 'Focus session finished' : 'Focus event'}</h5>
                  <p>{event.text}</p>
                </div>
                <span className="activity-type-label">{isFocusWarning ? 'Focus warning' : 'Session event'}</span>
              </article>
            )
          })}
          {!loadError && snapshot?.events.length === 0 && (
            <div className="security-no-events">
              {snapshot.active ? 'No recent flagged activities.' : 'No active focus session or recent flagged activities.'}
            </div>
          )}
          {isLoading && !snapshot && <div className="security-no-events">Connecting to the focus service…</div>}
          {loadError && <div className="security-no-events">Waiting for the focus service to become available.</div>}
        </div>
      </section>
    </section>
  )
}

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('chat')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState('')
  const [chatError, setChatError] = useState('')
  const [timerInputs, setTimerInputs] = useState({ minutes: '5', seconds: '00' })
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(300)
  const [remainingSeconds, setRemainingSeconds] = useState(300)
  const [timerDeadline, setTimerDeadline] = useState<number | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [fileSearch, setFileSearch] = useState('')
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedFileCard = selectedFile
    ? [{
        name: selectedFile.name,
        kind: selectedFile.status === 'uploading'
          ? 'Uploading DOCX'
          : selectedFile.status === 'ready'
            ? 'DOCX text ready'
            : 'Upload failed',
        icon: '📄',
        details: formatFileSize(selectedFile.size),
        modified: selectedFile.status === 'uploading'
          ? 'Processing now'
          : selectedFile.status === 'ready'
            ? `${selectedFile.extractedCharacterCount?.toLocaleString()} characters extracted`
            : 'Choose another file',
      }]
    : []
  const displayedFiles = [...selectedFileCard, ...exampleFiles]
  const filteredFiles = displayedFiles.filter((file) =>
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

  const uploadDocument = async (file: File) => {
    setSelectedFile({ name: file.name, size: file.size, status: 'uploading' })
    setActiveDocumentId(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(DOCUMENT_UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      })
      const result = await response.json().catch(() => null) as DocumentUploadResponse | null
      if (!response.ok) {
        throw new Error(result?.error ?? `Upload failed with status ${response.status}.`)
      }
      if (!result?.document_id) throw new Error('The server did not return a document ID.')

      setSelectedFile({
        name: result.filename,
        size: file.size,
        status: 'ready',
        documentId: result.document_id,
        extractedCharacterCount: result.extracted_character_count,
      })
      setActiveDocumentId(result.document_id)
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Could not upload this document. Please try again.'
      setSelectedFile({ name: file.name, size: file.size, status: 'error', error: message })
    }
  }

  const handleSend = async () => {
    const message = input.trim()
    if (!message || isSending || selectedFile?.status === 'uploading') return

    const conversation = [...messages, { role: 'user' as const, content: message }]
    setMessages(conversation)
    setInput('')
    setChatError('')
    setIsSending(true)

    let answer = ''
    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversation.map(({ role, content }) => ({ role, content })),
          ...(activeDocumentId ? { document_id: activeDocumentId } : {}),
        }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(result?.error ?? `The server returned status ${response.status}.`)
      }
      if (!response.body) throw new Error('The server did not return a chat response.')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        buffer += decoder.decode(value, { stream: !done })
        const blocks = buffer.split(/\r?\n\r?\n/)
        buffer = blocks.pop() ?? ''

        for (const block of blocks) {
          handleChatEvent(block, (text) => {
            answer += text
            setStreamingResponse(answer)
          })
        }

        if (done) {
          if (buffer.trim()) {
            handleChatEvent(buffer, (text) => {
              answer += text
              setStreamingResponse(answer)
            })
          }
          break
        }
      }

      if (!answer.trim()) throw new Error('The chat service returned an empty response.')
      setMessages((currentMessages) => [...currentMessages, { role: 'assistant', content: answer.trim() }])
    } catch (error) {
      if (error instanceof TypeError) {
        setChatError("I can't connect to JYAN's backend at 127.0.0.1:5001. Start the Flask server and try again.")
      } else if (error instanceof Error) {
        setChatError(`I couldn't get a reply this time. ${error.message}`)
      } else {
        setChatError("I couldn't get a reply this time. Please try again in a moment.")
      }
    } finally {
      setStreamingResponse('')
      setIsSending(false)
    }
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
                      : 'Focus activity from your backend'}
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
                    <div className={`message-row ${message.role === 'user' ? 'user-row' : ''}`} key={`${index}-${message.role}`}>
                      {message.role === 'assistant' && <span className="tiny-avatar" aria-hidden="true">✳</span>}
                      <div className={`message ${message.role === 'user' ? 'user-message' : 'jyan-message'}`}>
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {isSending && (
                    <div className="message-row">
                      <span className="tiny-avatar" aria-hidden="true">✳</span>
                      <div className="message jyan-message loading-message">
                        {streamingResponse || 'JYAN is thinking'}
                        <span className="typing-dots" aria-label="Loading"> ···</span>
                      </div>
                    </div>
                  )}

                  {chatError && (
                    <div className="message-row" role="alert">
                      <span className="tiny-avatar" aria-hidden="true">✳</span>
                      <div className="message chat-error-message">{chatError}</div>
                    </div>
                  )}
                </section>

                <div className="chat-input-wrap">
                  {activeDocumentId && selectedFile?.status === 'ready' && (
                    <div className="chat-document-context" role="status">
                      <span aria-hidden="true">📄</span>
                      <span>Using <strong>{selectedFile.name}</strong> as chat context</span>
                      <button onClick={() => setActiveDocumentId(null)}>Remove</button>
                    </div>
                  )}
                  <div className="chat-input">
                    <input
                      type="text"
                      aria-label="Message JYAN"
                      placeholder={activeDocumentId ? 'Ask JYAN about your document...' : 'Write a message...'}
                      value={input}
                      disabled={isSending || selectedFile?.status === 'uploading'}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      onClick={handleSend}
                      aria-label="Send message"
                      disabled={isSending || selectedFile?.status === 'uploading' || !input.trim()}
                    >
                      {isSending ? 'Sending' : 'Send'} <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                  <p className="input-hint">
                    {selectedFile?.status === 'uploading' ? 'Uploading and reading your document…' : 'Press Enter to send'}
                  </p>
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
                    <p className="files-description">Upload a .docx file to ask JYAN questions about its contents.</p>
                  </div>
                  <button className="files-choose-button" onClick={() => fileInputRef.current?.click()}>
                    <span aria-hidden="true">＋</span> Choose a file
                  </button>
                  <input
                    ref={fileInputRef}
                    className="files-hidden-input"
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    aria-label="Choose a file from your device"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      event.currentTarget.value = ''
                      if (file) void uploadDocument(file)
                    }}
                  />
                </div>

                <div className="files-tools">
                  <label className="files-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      aria-label="Search displayed files"
                      placeholder="Search sample or uploaded files..."
                      value={fileSearch}
                      onChange={(event) => setFileSearch(event.target.value)}
                    />
                  </label>
                  <span className="files-count">
                    {filteredFiles.length} {filteredFiles.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {selectedFile && (
                  <div className={`files-selection ${selectedFile.status === 'error' ? 'upload-error' : ''}`} role="status">
                    {selectedFile.status === 'uploading' ? (
                      <span>Uploading and extracting text from <strong>{selectedFile.name}</strong>…</span>
                    ) : selectedFile.status === 'error' ? (
                      <span><strong>{selectedFile.name}</strong>: {selectedFile.error}</span>
                    ) : (
                      <>
                        <span>
                          <strong>{selectedFile.name}</strong> is ready ({selectedFile.extractedCharacterCount?.toLocaleString()} characters extracted).
                        </span>
                        <button
                          className="files-context-toggle"
                          onClick={() => setActiveDocumentId(activeDocumentId ? null : selectedFile.documentId ?? null)}
                        >
                          {activeDocumentId ? 'Remove from chat' : 'Use in chat'}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {filteredFiles.length > 0 ? (
                  <div className="files-grid">
                    {filteredFiles.map((file) => (
                      <article className="file-card" key={`${file.kind}-${file.name}`}>
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
                    <h4>No files match this search</h4>
                    <p>Search the sample files or the file selected from your device.</p>
                    <button className="files-clear-search" onClick={() => setFileSearch('')}>Clear search</button>
                  </div>
                )}
                <p className="files-prototype-note">
                  Sample cards are previews. Uploaded DOCX text is kept in backend memory and can be used in Chat.
                </p>
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
