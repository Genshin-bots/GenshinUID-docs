interface Member {
  name: string;
  title: string;
  avatar: string;
  link: string;
}

interface MembersProps {
  members: Member[];
}

export function Members({ members }: MembersProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1.5em',
        margin: '2em 0',
      }}
    >
      {members.map((member) => (
        <a
          key={member.name}
          href={member.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5em',
            padding: '1em',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'var(--color-fd-foreground)',
            minWidth: '120px',
            transition: 'all 0.2s',
          }}
        >
          <img
            src={member.avatar}
            alt={member.name}
            width={80}
            height={80}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '3px solid var(--color-fd-primary)',
            }}
            loading="lazy"
          />
          <div style={{ fontSize: '1.1em', fontWeight: 600 }}>
            {member.name}
          </div>
          <div
            style={{
              fontSize: '0.85em',
              color: 'var(--color-fd-muted-foreground)',
            }}
          >
            {member.title}
          </div>
        </a>
      ))}
    </div>
  );
}
