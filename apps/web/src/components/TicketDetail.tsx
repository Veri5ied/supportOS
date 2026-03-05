import { useState } from 'react'
import type { CSSProperties } from 'react'
import { C, FONT } from '../support/theme'
import { formatDate, toDisplayName, toInitials, toRole } from '../support/utils'
import type { Role, TicketDetail } from '../support/types'

type TicketDetailProps = {
  role: Role
  ticket: TicketDetail
  onBack: () => void
  onSubmitComment: (body: string) => void
  commentPending: boolean
  onUpdateStatus: (status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED') => void
  statusPending: boolean
}

export default function TicketDetailView({
  role,
  ticket,
  onBack,
  onSubmitComment,
  commentPending,
  onUpdateStatus,
  statusPending,
}: TicketDetailProps) {
  const [body, setBody] = useState('')

  const agentCommentExists = ticket.comments.some(
    (comment) => toRole(comment.user.role) === 'agent'
  )
  const canCustomerReply = role === 'agent' || agentCommentExists

  const submit = () => {
    if (!body.trim()) return
    onSubmitComment(body.trim())
    setBody('')
  }

  return (
    <div style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <button
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          border: 'none',
          background: 'transparent',
          color: C.textSub,
          fontFamily: FONT,
          cursor: 'pointer',
          padding: 0,
          marginBottom: 14,
          fontSize: 13,
        }}
      >
        ← Back to tickets
      </button>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 10 }}>
          <div>
            <div style={{ color: C.amber, fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>
              {ticket.id}
            </div>
            <h2 style={{ color: C.text, margin: '6px 0 0', fontFamily: FONT, fontWeight: 700, fontSize: 20 }}>
              {ticket.subject}
            </h2>
          </div>

          {role === 'agent' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <button
                disabled={statusPending}
                onClick={() => onUpdateStatus('OPEN')}
                style={statusButton(ticket.status === 'open')}
              >
                Open
              </button>
              <button
                disabled={statusPending}
                onClick={() => onUpdateStatus('IN_PROGRESS')}
                style={statusButton(ticket.status === 'in_progress')}
              >
                In Progress
              </button>
              <button
                disabled={statusPending}
                onClick={() => onUpdateStatus('CLOSED')}
                style={statusButton(ticket.status === 'closed')}
              >
                Closed
              </button>
            </div>
          )}
        </div>

        <div style={{ color: C.textSub, fontFamily: FONT, fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
          {ticket.description}
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontFamily: FONT, fontSize: 12 }}>
          <Meta label="Status" value={ticket.status} />
          <Meta label="Customer" value={ticket.customer.email} />
          <Meta label="Created" value={formatDate(ticket.createdAt)} />
          <Meta label="Updated" value={formatDate(ticket.updatedAt)} />
          <Meta label="Closed" value={formatDate(ticket.closedAt)} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ticket.comments.length === 0 ? (
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
              No conversation yet
            </div>
            <div style={{ color: C.textMuted, fontFamily: FONT, fontSize: 12, marginTop: 5 }}>
              {role === 'agent'
                ? 'Send the first response to start the thread.'
                : 'Waiting for the first agent response.'}
            </div>
          </div>
        ) : (
          ticket.comments.map((comment) => {
            const commentRole = toRole(comment.user.role)
            const authorName = toDisplayName(comment.user.email)
            return (
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 14,
                  display: 'flex',
                  gap: 10,
                }}
                key={comment.id}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: commentRole === 'agent' ? C.amberDim : C.skyDim,
                    color: commentRole === 'agent' ? C.amberLight : C.sky,
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {toInitials(authorName)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 6,
                      fontFamily: FONT,
                    }}
                  >
                    <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{authorName}</div>
                    <div style={{ color: C.textMuted, fontSize: 11 }}>{formatDate(comment.createdAt)}</div>
                  </div>
                  <div style={{ color: C.textSub, fontFamily: FONT, fontSize: 13, lineHeight: 1.6 }}>
                    {comment.body}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {ticket.status !== 'closed' && (
        <div
          style={{
            marginTop: 14,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 12,
          }}
        >
          {role === 'customer' && !canCustomerReply && (
            <div
              style={{
                color: C.amberLight,
                fontFamily: FONT,
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              You can reply after an agent comments on this ticket.
            </div>
          )}

          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            disabled={role === 'customer' && !canCustomerReply}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              resize: 'none',
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.bg,
              color: C.text,
              fontFamily: FONT,
              padding: '10px 12px',
              fontSize: 13,
              outline: 'none',
            }}
            placeholder="Write a reply"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={submit}
              disabled={commentPending || !body.trim() || (role === 'customer' && !canCustomerReply)}
              style={{
                border: 'none',
                borderRadius: 9,
                padding: '10px 16px',
                background: `linear-gradient(135deg,${C.amber},${C.terra})`,
                color: '#000',
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                opacity:
                  commentPending ||
                  !body.trim() ||
                  (role === 'customer' && !canCustomerReply)
                    ? 0.5
                    : 1,
              }}
            >
              {commentPending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          color: C.textMuted,
          fontFamily: FONT,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ color: C.text, fontFamily: FONT, fontSize: 12 }}>{value}</div>
    </div>
  )
}

function statusButton(active: boolean): CSSProperties {
  return {
    border: `1px solid ${active ? C.amber : C.border}`,
    borderRadius: 8,
    background: active ? `${C.amber}18` : 'transparent',
    color: active ? C.amberLight : C.textSub,
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 700,
    padding: '8px 10px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }
}
