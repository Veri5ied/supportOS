import { C, FONT } from '../support/theme'
import type { TicketSummary } from '../support/types'

type TicketListProps = {
  title: string
  tickets: TicketSummary[]
  onSelect: (ticket: TicketSummary) => void
}

function StatusBadge({ status }: { status: TicketSummary['status'] }) {
  const map = {
    open: { label: 'Open', bg: C.jadeDim, color: C.jade },
    in_progress: { label: 'In Progress', bg: '#2A2208', color: C.amberLight },
    closed: { label: 'Closed', bg: '#1A1A18', color: C.textMuted },
  }
  const selected = map[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 18,
        padding: '3px 10px',
        background: selected.bg,
        color: selected.color,
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
      }}
    >
      {selected.label}
    </span>
  )
}

function PriorityText({ count }: { count: number }) {
  return (
    <span style={{ color: C.textSub, fontFamily: FONT, fontSize: 11 }}>
      {count} comment{count === 1 ? '' : 's'}
    </span>
  )
}

export default function TicketList({ title, tickets, onSelect }: TicketListProps) {
  const isCustomerList = title.toLowerCase().includes('my tickets')

  return (
    <div style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 18 }}>
        <h2
          style={{
            margin: 0,
            color: C.text,
            fontFamily: FONT,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {title}
        </h2>
        <p style={{ margin: '4px 0 0', color: C.textMuted, fontFamily: FONT, fontSize: 13 }}>
          {tickets.length} ticket{tickets.length === 1 ? '' : 's'}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 120px 110px 170px',
          gap: 10,
          borderBottom: `1px solid ${C.border}`,
          padding: '8px 12px',
          fontFamily: FONT,
          fontSize: 10,
          fontWeight: 700,
          color: C.textMuted,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <span>ID</span>
        <span>Subject</span>
        <span>Status</span>
        <span>Comments</span>
        <span>Updated</span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {tickets.length === 0 ? (
          <div
            style={{
              margin: '18px 8px',
              borderRadius: 12,
              border: `1px dashed ${C.border}`,
              background: C.surfaceAlt,
              padding: '20px 18px',
              textAlign: 'center',
            }}
          >
            <div style={{ color: C.text, fontFamily: FONT, fontSize: 14, fontWeight: 700 }}>
              {isCustomerList ? 'No tickets submitted yet' : 'No tickets in this view'}
            </div>
            <div style={{ color: C.textMuted, fontFamily: FONT, fontSize: 12, marginTop: 5 }}>
              {isCustomerList
                ? 'Create a new ticket to start a support conversation.'
                : 'Try another filter or check back shortly.'}
            </div>
          </div>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelect(ticket)}
              style={{
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                display: 'grid',
                gridTemplateColumns: '120px 1fr 120px 110px 170px',
                gap: 10,
                padding: '12px',
                borderBottom: `1px solid ${C.border}`,
                cursor: 'pointer',
                fontFamily: FONT,
              }}
            >
              <span style={{ color: C.amber, fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>
                {ticket.id}
              </span>
              <div>
                <div
                  style={{
                    color: C.text,
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {ticket.subject}
                </div>
                <div style={{ color: C.textMuted, fontSize: 11 }}>{ticket.customer.email}</div>
              </div>
              <div style={{ paddingTop: 2 }}>
                <StatusBadge status={ticket.status} />
              </div>
              <div style={{ paddingTop: 6 }}>
                <PriorityText count={ticket.commentCount} />
              </div>
              <span style={{ color: C.textMuted, fontSize: 12, paddingTop: 6 }}>
                {new Date(ticket.updatedAt).toLocaleString()}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
