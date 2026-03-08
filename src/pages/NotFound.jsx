import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
      <div style={{
        background: 'var(--dark)', borderRadius: 24,
        padding: '48px 36px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(60deg, transparent, transparent 30px, rgba(232,84,10,0.07) 30px, rgba(232,84,10,0.07) 31px)`,
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🏚️</div>
          <h1 style={{ color: 'white', fontSize: 64, marginBottom: 8, letterSpacing: '-2px' }}>404</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 32 }}>
            Cette page n'existe pas dans le quartier.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '13px 28px', background: '#e8540a',
              color: 'white', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 15
            }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}