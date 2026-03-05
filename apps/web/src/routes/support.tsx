import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import Sidebar from '../components/Sidebar'
import TicketList from '../components/TicketList'
import TicketDetailView from '../components/TicketDetail'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { useCreateComment } from '../hooks/useComments'
import {
  useClosedTicketsCsv,
  useCreateTicket,
  useTicket,
  useTickets,
  useUpdateTicketStatus,
} from '../hooks/useTickets'
import { C, FONT, SERIF } from '../support/theme'
import type { Role, TicketStatus, TicketSummary } from '../support/types'

export const Route = createFileRoute('/support')({
  component: SupportPage,
})

export function SupportPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
      <AuthProvider>
        <SupportPortal />
      </AuthProvider>
    </>
  )
}

function SupportPortal() {
  const auth = useAuth()
  const [view, setView] = useState('dashboard')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  const role = auth.user?.role || 'customer'
  const statusFilter = viewToStatus(view)

  const listQuery = useTickets(role, statusFilter, auth.isAuthenticated && !selectedTicketId)
  const dashboardQuery = useTickets(
    role,
    undefined,
    auth.isAuthenticated && role === 'agent' && view === 'dashboard'
  )
  const ticketQuery = useTicket(selectedTicketId, auth.isAuthenticated && !!selectedTicketId)
  const csvQuery = useClosedTicketsCsv(auth.isAuthenticated && role === 'agent' && view === 'export')

  const createTicket = useCreateTicket(() => {
    void listQuery.refresh()
    setView('my-tickets')
  })

  const addComment = useCreateComment(() => {
    void ticketQuery.refresh()
    void listQuery.refresh()
  })

  const updateStatus = useUpdateTicketStatus(() => {
    void ticketQuery.refresh()
    void listQuery.refresh()
  })

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user) {
      return
    }
    if (auth.user.role === 'agent') {
      setView('dashboard')
      return
    }
    setView('my-tickets')
  }, [auth.isAuthenticated, auth.user])

  const dashboardStats = useMemo(() => {
    const rows = dashboardQuery.data || []
    const openCount = rows.filter((ticket) => ticket.status === 'open').length
    const inProgressCount = rows.filter((ticket) => ticket.status === 'in_progress').length
    const closedCount = rows.filter((ticket) => ticket.status === 'closed').length
    return { openCount, inProgressCount, closedCount }
  }, [dashboardQuery.data])

  if (auth.isHydrating) {
    return <LoadingScreen label="Restoring session..." />
  }

  if (!auth.isAuthenticated || !auth.user) {
    return <AuthScreen />
  }

  const openDetail = (id: string) => {
    setSelectedTicketId(id)
    setView('ticket-detail')
  }

  const backToList = () => {
    setSelectedTicketId(null)
    setView(role === 'agent' ? 'tickets' : 'my-tickets')
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: C.bg,
        color: C.text,
        fontFamily: FONT,
      }}
    >
      <Sidebar
        role={role}
        user={auth.user}
        view={view}
        onViewChange={(next) => {
          setSelectedTicketId(null)
          setView(next)
        }}
        onLogout={auth.logout}
      />

      <main style={{ flex: 1, overflow: 'auto' }}>{renderView()}</main>
    </div>
  )

  function renderView() {
    if (view === 'dashboard' && role === 'agent') {
      return (
        <AgentDashboard
          stats={dashboardStats}
          recentTickets={(dashboardQuery.data || []).slice(0, 5)}
          onOpenTicket={(id) => openDetail(id)}
        />
      )
    }

    if (view === 'new-ticket' && role === 'customer') {
      return (
        <NewTicket
          pending={createTicket.isPending}
          error={createTicket.error?.message || null}
          onSubmit={(subject, description) => {
            void createTicket.mutate({ subject, description })
          }}
        />
      )
    }

    if (view === 'export' && role === 'agent') {
      if (csvQuery.isError) {
        return (
          <ErrorState
            title="Could not load CSV data"
            message={csvQuery.error?.message || 'Try again'}
            actionLabel="Retry"
            onAction={() => void csvQuery.refresh()}
          />
        )
      }
      return <ExportCsv csv={csvQuery.data || ''} loading={csvQuery.isLoading} />
    }

    if (view === 'ticket-detail') {
      if (ticketQuery.isLoading) {
        return <LoadingScreen label="Loading ticket..." />
      }
      if (ticketQuery.isError) {
        return (
          <ErrorState
            title="Could not load ticket"
            message={ticketQuery.error?.message || 'Try again'}
            actionLabel="Retry"
            onAction={() => void ticketQuery.refresh()}
          />
        )
      }
      if (ticketQuery.data) {
        return (
          <TicketDetailView
            role={role}
            ticket={ticketQuery.data}
            onBack={backToList}
            onSubmitComment={(body) => {
              void addComment.mutate({ ticketId: ticketQuery.data!.id, body })
            }}
            commentPending={addComment.isPending}
            onUpdateStatus={(status) => {
              void updateStatus.mutate({ ticketId: ticketQuery.data!.id, status })
            }}
            statusPending={updateStatus.isPending}
          />
        )
      }
    }

    if (listQuery.isLoading) {
      return <LoadingScreen label="Loading tickets..." />
    }

    if (listQuery.isError) {
      return (
        <ErrorState
          title="Could not load tickets"
          message={listQuery.error?.message || 'Try again'}
          actionLabel="Retry"
          onAction={() => void listQuery.refresh()}
        />
      )
    }

    const tickets = listQuery.data || []

    return (
      <TicketList
        title={listTitle(view, role)}
        tickets={tickets}
        onSelect={(ticket) => {
          openDetail(ticket.id)
        }}
      />
    )
  }
}

function AuthScreen() {
  const auth = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState<Role>('customer')

  const submit = () => {
    if (!email || !password) return
    if (mode === 'signin') {
      void auth.login(email, password)
      return
    }
    void auth.signUp(email, password, passwordConfirmation || password, role)
  }
  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        color: C.text,
        fontFamily: FONT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 28,
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: 6,
            fontSize: 28,
            fontFamily: SERIF,
            fontWeight: 700,
            color: C.text,
          }}
        >
          Support Portal
        </h1>
        <p style={{ margin: '0 0 18px', color: C.textMuted, fontSize: 13 }}>
          {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <TabButton active={mode === 'signin'} onClick={() => setMode('signin')}>
            Sign In
          </TabButton>
          <TabButton active={mode === 'signup'} onClick={() => setMode('signup')}>
            Sign Up
          </TabButton>
        </div>

        <label style={labelStyle}>Email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={inputStyle}
          placeholder="you@example.com"
          type="email"
        />

        <label style={labelStyle}>Password</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={inputStyle}
          placeholder="password"
          type="password"
        />

        {mode === 'signup' && (
          <>
            <label style={labelStyle}>Confirm Password</label>
            <input
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              style={inputStyle}
              placeholder="confirm password"
              type="password"
            />

            <label style={labelStyle}>Role</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value === 'agent' ? 'agent' : 'customer')}
              style={inputStyle}
            >
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
            </select>
          </>
        )}

        {auth.authError && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 9,
              background: C.roseDim,
              color: C.rose,
              fontSize: 12,
            }}
          >
            {auth.authError}
          </div>
        )}

        <button
          onClick={submit}
          disabled={auth.isLoading}
          style={{
            marginTop: 16,
            width: '100%',
            border: 'none',
            borderRadius: 10,
            padding: '12px 14px',
            cursor: 'pointer',
            fontFamily: FONT,
            fontWeight: 700,
            background: `linear-gradient(135deg,${C.amber},${C.terra})`,
            color: '#000',
            opacity: auth.isLoading ? 0.6 : 1,
          }}
        >
          {auth.isLoading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}

function AgentDashboard({
  stats,
  recentTickets,
  onOpenTicket,
}: {
  stats: { openCount: number; inProgressCount: number; closedCount: number }
  recentTickets: TicketSummary[]
  onOpenTicket: (id: string) => void
}) {
  const cards = [
    { label: 'Open Tickets', value: stats.openCount, color: C.jade },
    { label: 'In Progress', value: stats.inProgressCount, color: C.amber },
    { label: 'Closed', value: stats.closedCount, color: C.textSub },
  ]

  return (
    <div style={{ padding: '30px 32px', maxWidth: 960 }}>
      <h2 style={{ margin: 0, marginBottom: 4, color: C.text, fontFamily: SERIF, fontSize: 28 }}>
        Agent Dashboard
      </h2>
      <p style={{ margin: 0, color: C.textMuted, fontFamily: FONT, fontSize: 13 }}>
        Live queue overview
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 22 }}>
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 18,
            }}
          >
            <div style={{ color: card.color, fontFamily: SERIF, fontSize: 38, fontWeight: 700 }}>
              {card.value}
            </div>
            <div style={{ color: C.textSub, fontFamily: FONT, fontSize: 13 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 18,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 16,
        }}
      >
        <div
          style={{
            color: C.textMuted,
            fontFamily: FONT,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 10,
          }}
        >
          Recent Activity
        </div>

        {recentTickets.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            message="Incoming tickets will appear here."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => onOpenTicket(ticket.id)}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  background: C.surfaceAlt,
                  cursor: 'pointer',
                  padding: '10px 12px',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      color: C.text,
                      fontFamily: FONT,
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {ticket.subject}
                  </div>
                  <div style={{ color: C.textMuted, fontFamily: FONT, fontSize: 11 }}>
                    {ticket.customer.email}
                  </div>
                </div>
                <div style={{ color: C.amber, fontFamily: FONT, fontSize: 12, fontWeight: 700 }}>
                  {ticket.id}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NewTicket({
  pending,
  error,
  onSubmit,
}: {
  pending: boolean
  error: string | null
  onSubmit: (subject: string, description: string) => void
}) {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div style={{ padding: '30px 32px', maxWidth: 760 }}>
      <h2 style={{ margin: 0, marginBottom: 4, color: C.text, fontFamily: SERIF, fontSize: 28 }}>
        New Ticket
      </h2>
      <p style={{ margin: 0, color: C.textMuted, fontFamily: FONT, fontSize: 13 }}>
        Send a support request
      </p>

      <label style={labelStyle}>Subject</label>
      <input
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        style={inputStyle}
        placeholder="Ticket subject"
      />

      <label style={labelStyle}>Description</label>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={8}
        style={{ ...inputStyle, resize: 'vertical' }}
        placeholder="Describe your issue"
      />

      {error && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 12px',
            borderRadius: 9,
            background: C.roseDim,
            color: C.rose,
            fontSize: 12,
            fontFamily: FONT,
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={() => onSubmit(subject, description)}
        disabled={pending || !subject.trim() || !description.trim()}
        style={{
          marginTop: 14,
          border: 'none',
          borderRadius: 10,
          padding: '12px 16px',
          cursor: 'pointer',
          fontFamily: FONT,
          fontWeight: 700,
          background: `linear-gradient(135deg,${C.amber},${C.terra})`,
          color: '#000',
          opacity: pending || !subject.trim() || !description.trim() ? 0.6 : 1,
        }}
      >
        {pending ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  )
}

function ExportCsv({ csv, loading }: { csv: string; loading: boolean }) {
  const preview = csv
    .split('\n')
    .filter(Boolean)
    .slice(0, 10)
    .join('\n')

  const download = () => {
    if (!csv) return
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'closed-tickets-last-month.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '30px 32px', maxWidth: 900 }}>
      <h2 style={{ margin: 0, marginBottom: 4, color: C.text, fontFamily: SERIF, fontSize: 28 }}>
        Closed Tickets CSV
      </h2>
      <p style={{ margin: 0, color: C.textMuted, fontFamily: FONT, fontSize: 13 }}>
        Export closed tickets from the last one month
      </p>

      <button
        onClick={download}
        disabled={loading || !csv}
        style={{
          marginTop: 14,
          border: 'none',
          borderRadius: 10,
          padding: '10px 14px',
          cursor: 'pointer',
          fontFamily: FONT,
          fontWeight: 700,
          background: `linear-gradient(135deg,${C.amber},${C.terra})`,
          color: '#000',
          opacity: loading || !csv ? 0.6 : 1,
        }}
      >
        {loading ? 'Loading...' : 'Download CSV'}
      </button>

      <pre
        style={{
          marginTop: 14,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 14,
          color: C.textSub,
          fontSize: 12,
          lineHeight: 1.5,
          overflow: 'auto',
          maxHeight: 420,
        }}
      >
        {preview || 'No closed tickets found'}
      </pre>
    </div>
  )
}

function LoadingScreen({ label = 'Loading...' }: { label?: string }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.textMuted,
        fontFamily: FONT,
      }}
    >
      {label}
    </div>
  )
}

function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px dashed ${C.border}`,
        background: C.surfaceAlt,
        padding: '18px 16px',
        textAlign: 'center',
      }}
    >
      <div style={{ color: C.text, fontFamily: FONT, fontSize: 14, fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ color: C.textMuted, fontFamily: FONT, fontSize: 12, marginTop: 5 }}>
        {message}
      </div>
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          style={{
            marginTop: 10,
            border: 'none',
            borderRadius: 9,
            padding: '9px 14px',
            background: `linear-gradient(135deg,${C.amber},${C.terra})`,
            color: '#000',
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

function ErrorState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div style={{ padding: '34px 32px', maxWidth: 760 }}>
      <div
        style={{
          borderRadius: 12,
          border: `1px solid ${C.roseDim}`,
          background: C.surface,
          padding: '16px 18px',
        }}
      >
        <div style={{ color: C.rose, fontFamily: FONT, fontSize: 14, fontWeight: 700 }}>
          {title}
        </div>
        <div style={{ color: C.textSub, fontFamily: FONT, fontSize: 12, marginTop: 6 }}>
          {message}
        </div>
        {actionLabel && onAction ? (
          <button
            onClick={onAction}
            style={{
              marginTop: 10,
              border: 'none',
              borderRadius: 9,
              padding: '9px 14px',
              background: C.roseDim,
              color: C.rose,
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function viewToStatus(view: string): TicketStatus | undefined {
  if (view === 'open') return 'open'
  if (view === 'in_progress') return 'in_progress'
  if (view === 'closed') return 'closed'
  return undefined
}

function listTitle(view: string, role: Role) {
  if (view === 'open') return 'Open Tickets'
  if (view === 'in_progress') return 'In Progress Tickets'
  if (view === 'closed') return 'Closed Tickets'
  if (role === 'customer') return 'My Tickets'
  return 'All Tickets'
}

const labelStyle: CSSProperties = {
  color: C.textSub,
  fontFamily: FONT,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  display: 'block',
  marginTop: 12,
  marginBottom: 6,
}

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: C.surfaceAlt,
  color: C.text,
  fontFamily: FONT,
  fontSize: 13,
  padding: '10px 12px',
  outline: 'none',
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: `1px solid ${active ? C.amber : C.border}`,
        borderRadius: 9,
        background: active ? `${C.amber}14` : 'transparent',
        color: active ? C.amberLight : C.textSub,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 12,
        padding: '9px 12px',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}
