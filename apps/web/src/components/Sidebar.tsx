import { C, FONT, SERIF } from '../support/theme'
import type { AppUser, Role } from '../support/types'

type SidebarProps = {
  role: Role
  user: AppUser
  view: string
  onViewChange: (view: string) => void
  onLogout: () => void
}

export default function Sidebar({
  role,
  user,
  view,
  onViewChange,
  onLogout,
}: SidebarProps) {
  const agentNav = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tickets', label: 'All Tickets' },
    { id: 'open', label: 'Open' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'closed', label: 'Closed' },
    { id: 'export', label: 'Export CSV' },
  ]

  const customerNav = [
    { id: 'my-tickets', label: 'My Tickets' },
    { id: 'new-ticket', label: 'New Ticket' },
  ]

  const nav = role === 'agent' ? agentNav : customerNav

  return (
    <aside
      style={{
        width: 230,
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '20px 16px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `linear-gradient(135deg,${C.amber},${C.terra})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: SERIF,
            fontWeight: 900,
          }}
        >
          SO
        </div>
        <div>
          <div
            style={{
              fontFamily: SERIF,
              color: C.text,
              fontWeight: 700,
              fontSize: 17,
              lineHeight: 1,
            }}
          >
            supportOS
          </div>
          <div
            style={{
              fontFamily: FONT,
              color: C.textMuted,
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            support
          </div>
        </div>
      </div>

      <div
        style={{
          margin: '12px 14px 6px',
          padding: '8px 10px',
          borderRadius: 8,
          background: role === 'agent' ? `${C.amberDim}55` : `${C.skyDim}55`,
          border: `1px solid ${role === 'agent' ? C.amberDim : C.skyDim}`,
          fontFamily: FONT,
          fontSize: 11,
          color: role === 'agent' ? C.amberLight : C.sky,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {role === 'agent' ? 'Agent Portal' : 'Customer Portal'}
      </div>

      <nav
        style={{
          padding: '6px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            style={{
              textAlign: 'left',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontFamily: FONT,
              fontSize: 13,
              padding: '10px 12px',
              background: view === item.id ? `${C.amber}14` : 'transparent',
              color: view === item.id ? C.amberLight : C.textSub,
              borderLeft:
                view === item.id
                  ? `3px solid ${C.amber}`
                  : '3px solid transparent',
              fontWeight: view === item.id ? 700 : 500,
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          borderTop: `1px solid ${C.border}`,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: role === 'agent' ? C.amberDim : C.skyDim,
            border: `1px solid ${role === 'agent' ? '#7A5010' : '#0D3A5E'}`,
            color: role === 'agent' ? C.amberLight : C.sky,
            fontSize: 12,
            fontWeight: 800,
            fontFamily: FONT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {user.avatarInitials}
        </div>
        <div style={{ minWidth: 0, flex: 1, fontFamily: FONT }}>
          <div
            style={{
              color: C.text,
              fontSize: 12,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              color: C.textMuted,
              fontSize: 10,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.email}
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: C.textMuted,
            fontFamily: FONT,
            fontSize: 16,
          }}
          title="Sign out"
        >
          ⏻
        </button>
      </div>
    </aside>
  )
}
