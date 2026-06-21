export function CopyRight() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-center text-fd-muted-foreground">
      <p>
        <a
          href="https://github.com/Genshin-bots/gsuid_core/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-fd-foreground"
        >
          GPL v3 License
        </a>
        {' | '}
        Theme by{' '}
        <a
          href="https://github.com/Genshin-bots/gsuid_core"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-fd-foreground"
        >
          GsCore
        </a>
      </p>
    </div>
  )
}
