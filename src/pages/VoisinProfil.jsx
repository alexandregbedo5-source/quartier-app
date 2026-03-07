import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

function etoiles(note) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < note ? '#f59e0b' : '#d1d5db', fontSize: 18 }}>★</span>
  ))
}

function tempsRelatif(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`
  return new Date(date).toLocaleDateString('fr-FR')
}

export default function VoisinProfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profil, setProfil] = useState(null)
  const [services, setServices] = useState([])
  const [notations, setNotations] = useState([])
  const [maNote, setMaNote] = useState(0)
  const [monCommentaire, setMonCommentaire] = useState('')
  const [dejaNote, setDejaNote] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    chargerTout()
  }, [id])

  async function chargerTout() {
    setLoading(true)

    const [{ data: p }, { data: s }, { data: n }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('services').select('*').eq('user_id', id).eq('statut', 'actif').order('created_at', { ascending: false }),
      supabase.from('notations').select('*, evaluateur:profiles!notations_evaluateur_id_fkey(nom)').eq('evalue_id', id).order('created_at', { ascending: false })
    ])

    setProfil(p)
    setServices(s || [])
    setNotations(n || [])

    if (user) {
      const existe = (n || []).find(n => n.evaluateur_id === user.id)
      if (existe) {
        setDejaNote(true)
        setMaNote(existe.note)
        setMonCommentaire(existe.commentaire || '')
      }
    }

    setLoading(false)
  }

  async function envoyerNotation() {
    if (!maNote || !user) return
    const { error } = await supabase.from('notations').insert({
      evaluateur_id: user.id,
      evalue_id: id,
      note: maNote,
      commentaire: monCommentaire
    })
    if (error) { console.error(error); return }
    setDejaNote(true)
    setMsg('Merci pour ton avis !')
    chargerTout()
  }

  const moyenneNote = notations.length
    ? (notations.reduce((acc, n) => acc + n.note, 0) / notations.length).toFixed(1)
    : null

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--grey)' }}>Chargement...</p>
    </div>
  )

  if (!profil) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <p style={{ color: 'var(--grey)' }}>Profil introuvable.</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px' }}>

      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: 'none',
          color: 'var(--grey)', fontSize: 14,
          marginBottom: 24, padding: 0,
          display: 'flex', alignItems: 'center', gap: 6
        }}
      >
        ← Retour
      </button>

      {/* Carte profil */}
      <div style={{
        background: 'var(--dark)', borderRadius: 20,
        padding: '32px 28px', marginBottom: 24,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 180, height: 180,
          background: 'var(--primary)',
          borderRadius: '50%', opacity: 0.1
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 900,
            fontFamily: 'Unbounded, sans-serif',
            flexShrink: 0
          }}>
            {profil.nom?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ color: 'white', fontSize: 24, marginBottom: 4 }}>{profil.nom}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 6 }}>
              📍 {profil.quartier}
            </p>
            {profil.telephone && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 6 }}>
                📞 {profil.telephone}
              </p>
            )}
            {moyenneNote && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#f59e0b', fontSize: 20 }}>★</span>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{moyenneNote}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                  ({notations.length} avis)
                </span>
              </div>
            )}
          </div>
        </div>

        {profil.bio && (
          <p style={{
            color: 'rgba(255,255,255,0.6)', marginTop: 20,
            fontSize: 14, lineHeight: 1.7,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 20
          }}>
            {profil.bio}
          </p>
        )}
      </div>

      {/* Services actifs */}
      {services.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 17, marginBottom: 14 }}>
            Services actifs
            <span style={{
              marginLeft: 10, background: 'var(--primary-light)',
              color: 'var(--primary)', padding: '2px 10px',
              borderRadius: 20, fontSize: 13
            }}>
              {services.length}
            </span>
          </h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {services.map(s => (
              <div key={s.id} style={{
                background: 'white', borderRadius: 12,
                border: '1px solid var(--border)',
                padding: '16px 18px',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    background: s.type === 'offre' ? '#d1fae5' : '#fef3c7',
                    color: s.type === 'offre' ? '#065f46' : '#92400e',
                    padding: '3px 10px', borderRadius: 20,
                    fontSize: 12, fontWeight: 700
                  }}>
                    {s.type === 'offre' ? '✅ Offre' : '🙋 Demande'}
                  </span>
                  <span style={{ color: 'var(--grey)', fontSize: 12, alignSelf: 'center' }}>
                    {tempsRelatif(s.created_at)}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: 15 }}>{s.titre}</h4>
                <p style={{ color: 'var(--grey)', fontSize: 13, margin: 0 }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Laisser un avis */}
      {user && user.id !== id && (
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid var(--border)',
          padding: '24px', marginBottom: 28,
          boxShadow: 'var(--shadow)'
        }}>
          <h3 style={{ fontSize: 17, marginBottom: 16 }}>
            {dejaNote ? 'Ton avis' : 'Laisser un avis'}
          </h3>

          {/* Étoiles */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <span
                key={i}
                onClick={() => !dejaNote && setMaNote(i)}
                style={{
                  fontSize: 32,
                  color: i <= maNote ? '#f59e0b' : '#d1d5db',
                  cursor: dejaNote ? 'default' : 'pointer',
                  transition: 'color 0.1s'
                }}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Ajoute un commentaire (optionnel)..."
            value={monCommentaire}
            onChange={e => !dejaNote && setMonCommentaire(e.target.value)}
            disabled={dejaNote}
            rows={3}
            style={{
              display: 'block', width: '100%',
              padding: '12px 14px', borderRadius: 10,
              border: '1.5px solid var(--border)',
              fontSize: 14, marginBottom: 14,
              resize: 'vertical', boxSizing: 'border-box',
              background: dejaNote ? 'var(--bg)' : 'white',
              color: 'var(--dark)'
            }}
          />

          {msg && (
            <p style={{ color: '#16a34a', fontSize: 14, marginBottom: 10 }}>{msg}</p>
          )}

          {!dejaNote && (
            <button
              onClick={envoyerNotation}
              disabled={!maNote}
              style={{
                padding: '11px 24px',
                background: maNote ? 'var(--primary)' : 'var(--border)',
                color: maNote ? 'white' : 'var(--grey)',
                border: 'none', borderRadius: 10,
                fontWeight: 700, fontSize: 14
              }}
            >
              Envoyer mon avis
            </button>
          )}
        </div>
      )}

      {/* Avis reçus */}
      {notations.length > 0 && (
        <div>
          <h3 style={{ fontSize: 17, marginBottom: 14 }}>
            Avis reçus
            <span style={{
              marginLeft: 10, background: 'var(--primary-light)',
              color: 'var(--primary)', padding: '2px 10px',
              borderRadius: 20, fontSize: 13
            }}>
              {notations.length}
            </span>
          </h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {notations.map(n => (
              <div key={n.id} style={{
                background: 'white', borderRadius: 12,
                border: '1px solid var(--border)',
                padding: '16px 18px',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'var(--dark)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700
                    }}>
                      {n.evaluateur?.nom?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{n.evaluateur?.nom}</span>
                  </div>
                  <div>{etoiles(n.note)}</div>
                </div>
                {n.commentaire && (
                  <p style={{ color: '#374151', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                    {n.commentaire}
                  </p>
                )}
                <small style={{ color: 'var(--grey)', fontSize: 12 }}>
                  {tempsRelatif(n.created_at)}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}