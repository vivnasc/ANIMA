'use client'

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8" style={{ backgroundColor: '#ddd8cf' }}>
      <div className="max-w-md text-center space-y-4">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: '#f0ece6' }}>
          <span className="text-2xl">!</span>
        </div>
        <h2 className="text-lg font-heading font-semibold" style={{ color: '#2a2520' }}>
          Algo correu mal
        </h2>
        <p className="text-sm" style={{ color: '#7a746b' }}>
          {error.message || 'Ocorreu um erro ao carregar a sessão. Tenta novamente.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#10b981' }}
          >
            Tentar novamente
          </button>
          <a
            href="/mirrors"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#f0ece6', color: '#7a746b' }}
          >
            Voltar aos espelhos
          </a>
        </div>
      </div>
    </div>
  )
}
