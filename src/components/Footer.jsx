import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Footer() {
  const [nom, setNom] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('suggestion')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function envoyer() {
    if (!message.trim()) return
    setLoading(true)
    const { error } = await supabase.from('feedbacks').insert({ nom, message, type })
    if (error) { console.error(error); setLoading(false); return }
    setMsg('Merci pour ton retour !')
    setNom('')
    setMessage('')
    setTimeout(() => setMsg(''), 4000)
    setLoading(false)
  }

  return (
    <footer style={{
      background: 'var(--dark)', marginTop: 80,
      padding: '60px 24px 32px',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          repeating-linear-gradient(60deg, transparent, transparent 40px, rgba(232,84,10,0.04) 40px, rgba(232,84,10,0.04) 41px),
          repeating-linear-gradient(-60deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px)
        `,
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 48, marginBottom: 48
        }}>

          {/* Colonne 1 — Identité */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, background: 'var(--primary)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'Unbounded, sans-serif', fontWeight: 900, fontSize: 16, color: 'white' }}>
                MON<span style={{ color: 'var(--primary)' }}>QUARTIER</span>
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Plateforme gratuite d'échange de services entre voisins. Ensemble, construisons une communauté solidaire.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="tel:0142470420" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                📞 <span>01 42 47 04 80</span>
              </a>
              <a href="tel:0193716700" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                📞 <span>01 93 71 67 00</span>
              </a>
            </div>
          </div>

          {/* Colonne 2 — Feedback */}
          <div>
            <h4 style={{ color: 'white', fontSize: 15, marginBottom: 16, fontFamily: 'Unbounded, sans-serif' }}>
              Ton avis compte
            </h4>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[
                { val: 'suggestion', label: '💡 Suggestion' },
                { val: 'commentaire', label: '💬 Commentaire' }
              ].map(t => (
                <button
                  key={t.val}
                  onClick={() => setType(t.val)}
                  style={{
                    padding: '6px 14px', borderRadius: 20,
                    border: `1.5px solid ${type === t.val ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`,
                    background: type === t.val ? 'var(--primary)' : 'transparent',
                    color: type === t.val ? 'white' : 'rgba(255,255,255,0.5)',
                    fontSize: 12, fontWeight: 600
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              placeholder="Ton prénom (optionnel)"
              value={nom}
              onChange={e => setNom(e.target.value)}
              style={{
                display: 'block', width: '100%', marginBottom: 10,
                padding: '10px 14px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.07)',
                color: 'white', fontSize: 14, boxSizing: 'border-box'
              }}
            />
            <textarea
              placeholder={type === 'suggestion' ? 'Une idée pour améliorer la plateforme...' : 'Un commentaire, une question...'}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              style={{
                display: 'block', width: '100%', marginBottom: 10,
                padding: '10px 14px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.07)',
                color: 'white', fontSize: 14,
                resize: 'vertical', boxSizing: 'border-box'
              }}
            />
            {msg && <p style={{ color: '#4ade80', fontSize: 13, marginBottom: 8 }}>{msg}</p>}
            <button
              onClick={envoyer}
              disabled={loading || !message.trim()}
              style={{
                padding: '10px 22px',
                background: message.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                color: 'white', border: 'none', borderRadius: 8,
                fontWeight: 700, fontSize: 13
              }}
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>

        {/* Bas du footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12
        }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            © {new Date().getFullYear()} MonQuartier — Tous droits réservés
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/a-propos" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>À propos</Link>
            <Link to="/comment-ca-marche" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Comment ça marche</Link>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Développé par <span style={{ color: 'var(--primary)', fontWeight: 700 }}>GBEDO Alexandre</span>
          </p>
        </div>
      </div>
    </footer>
  )
}