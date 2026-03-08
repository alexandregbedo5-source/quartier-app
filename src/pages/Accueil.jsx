import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import BannierePublicitaire from '../components/BannierePublicitaire'

const CATEGORIES = [
  'Toutes', 'Bricolage', 'Jardinage', 'Cuisine', "Garde d'enfants",
  'Courses', 'Transport', 'Informatique', 'Cours / Soutien', 'Animaux', 'Autre'
]

function tempsRelatif(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`
  return new Date(date).toLocaleDateString('fr-FR')
}

export default function Accueil() {
  const [services, setServices] = useState([])
  const [filtre, setFiltre] = useState('tous')
  const [categorie, setCategorie] = useState('Toutes')
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ services: 0, utilisateurs: 0 })
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { chargerServices() }, [filtre, categorie])
  useEffect(() => { chargerStats() }, [])

  async function chargerServices() {
    setLoading(true)
    let query = supabase
      .from('services')
      .select('*, profiles(id, nom, quartier, telephone)')
      .eq('statut', 'actif')
      .order('created_at', { ascending: false })

    if (filtre !== 'tous') query = query.eq('type', filtre)
    if (categorie !== 'Toutes') query = query.eq('categorie', categorie)

    const { data, error } = await query
    if (error) console.error(error)
    setServices(data || [])
    setLoading(false)
  }

  async function chargerStats() {
    const [{ count: nbServices }, { count: nbUsers }] = await Promise.all([
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
    ])
    setStats({ services: nbServices || 0, utilisateurs: nbUsers || 0 })
  }

  async function signalerService(serviceId) {
    if (!user) return navigate('/connexion')
    const raison = prompt('Pourquoi signales-tu cette annonce ?\n(spam, contenu inapproprié, arnaque...)')
    if (!raison) return
    const { error } = await supabase.from('signalements').insert({
      service_id: serviceId,
      user_id: user.id,
      raison
    })
    if (error) {
      if (error.code === '23505') alert('Tu as déjà signalé cette annonce.')
      else console.error(error)
      return
    }
    alert('Signalement envoyé. Merci !')
  }

  const servicesFiltres = services.filter(s =>
    recherche === '' ||
    s.titre.toLowerCase().includes(recherche.toLowerCase()) ||
    s.description.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>

      {/* Hero */}
      <div style={{
        background: 'var(--dark)', borderRadius: 24,
        padding: '48px 36px', marginBottom: 32,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            repeating-linear-gradient(60deg, transparent, transparent 30px, rgba(232,84,10,0.07) 30px, rgba(232,84,10,0.07) 31px),
            repeating-linear-gradient(-60deg, transparent, transparent 30px, rgba(255,255,255,0.03) 30px, rgba(255,255,255,0.03) 31px)
          `,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 240, height: 240, background: 'var(--primary)',
          borderRadius: '50%', opacity: 0.12
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40,
          width: 160, height: 160, background: 'var(--primary)',
          borderRadius: '50%', opacity: 0.06
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(232,84,10,0.2)',
            color: 'var(--primary)', padding: '4px 14px', borderRadius: 20,
            fontSize: 12, fontWeight: 600, marginBottom: 16, letterSpacing: '0.5px'
          }}>
            ÉCHANGES ENTRE VOISINS
          </div>
          <h1 style={{
            color: 'white', fontSize: 'clamp(22px, 5vw, 42px)',
            lineHeight: 1.15, marginBottom: 12, letterSpacing: '-1px'
          }}>
            Services du<br />
            <span style={{ color: 'var(--primary)' }}>quartier</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28, fontSize: 15 }}>
            Propose ou demande de l'aide à tes voisins, facilement!
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              placeholder="🔍 Rechercher un service..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              style={{
                flex: 1, minWidth: 200, padding: '13px 18px',
                borderRadius: 10, border: 'none', fontSize: 15,
                background: 'rgba(255,255,255,0.1)', color: 'white'
              }}
            />
            {user && (
              <button
                onClick={() => navigate('/nouveau')}
                style={{
                  background: 'var(--primary)', color: 'white',
                  border: 'none', padding: '13px 24px',
                  borderRadius: 10, fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap'
                }}
              >
                + Poster
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12, marginBottom: 28
      }}>
        {[
          { label: 'Services actifs', valeur: stats.services, emoji: '📋' },
          { label: 'Voisins inscrits', valeur: stats.utilisateurs, emoji: '👥' },
          { label: 'Échanges réalisés', valeur: '∞', emoji: '🤝' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 14,
            border: '1px solid var(--border)',
            padding: '16px', textAlign: 'center',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{
              fontFamily: 'Unbounded, sans-serif',
              fontSize: 22, fontWeight: 900,
              color: 'var(--primary)', marginBottom: 4
            }}>
              {s.valeur}
            </div>
            <div style={{ color: 'var(--grey)', fontSize: 12 }}>{s.label}</div>
          </div>
        ))}
      </div>
        <BannierePublicitaire />
      {/* Filtres type */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { val: 'tous', label: '🔍 Tous' },
          { val: 'offre', label: '✅ Offres' },
          { val: 'demande', label: '🙋 Demandes' }
        ].map(f => (
          <button
            key={f.val}
            onClick={() => setFiltre(f.val)}
            style={{
              padding: '8px 18px', borderRadius: 24,
              border: '2px solid var(--primary)',
              background: filtre === f.val ? 'var(--primary)' : 'white',
              color: filtre === f.val ? 'white' : 'var(--primary)',
              fontWeight: 600, fontSize: 13
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Filtres catégories */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 28,
        overflowX: 'auto', paddingBottom: 4
      }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategorie(c)}
            style={{
              padding: '6px 14px', borderRadius: 20,
              border: '1.5px solid var(--border)',
              background: categorie === c ? 'var(--dark)' : 'white',
              color: categorie === c ? 'white' : 'var(--grey)',
              fontWeight: 500, fontSize: 12,
              whiteSpace: 'nowrap', flexShrink: 0
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Compteur */}
      {!loading && (
        <p style={{ color: 'var(--grey)', fontSize: 13, marginBottom: 16 }}>
          {servicesFiltres.length} service{servicesFiltres.length !== 1 ? 's' : ''} trouvé{servicesFiltres.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Liste */}
      {loading ? (
        <p style={{ color: 'var(--grey)' }}>Chargement...</p>
      ) : servicesFiltres.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'white', borderRadius: 16,
          border: '2px dashed var(--border)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
          <p style={{ color: 'var(--grey)', fontSize: 16 }}>Aucun service trouvé.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {servicesFiltres.map(s => (
            <div key={s.id} style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 16, padding: '20px 24px', boxShadow: 'var(--shadow)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    background: s.type === 'offre' ? '#d1fae5' : '#fef3c7',
                    color: s.type === 'offre' ? '#065f46' : '#92400e',
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700
                  }}>
                    {s.type === 'offre' ? '✅ Offre' : '🙋 Demande'}
                  </span>
                  {s.categorie && (
                    <span style={{
                      background: 'var(--bg)', color: 'var(--grey)',
                      padding: '4px 12px', borderRadius: 20, fontSize: 12
                    }}>
                      {s.categorie}
                    </span>
                  )}
                </div>
                <small style={{ color: 'var(--grey)', fontSize: 12 }}>
                  {tempsRelatif(s.created_at)}
                </small>
              </div>

              <h3 style={{ margin: '14px 0 8px', fontSize: 17, letterSpacing: '-0.3px' }}>{s.titre}</h3>
              <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{s.description}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div
                  onClick={() => navigate(`/voisin/${s.user_id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, flexShrink: 0
                  }}>
                    {s.profiles?.nom?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>{s.profiles?.nom}</div>
                    <div style={{ color: 'var(--grey)', fontSize: 12 }}>📍 {s.profiles?.quartier}</div>
                    {user && s.profiles?.telephone && (
                      <div style={{ color: 'var(--grey)', fontSize: 12 }}>📞 {s.profiles?.telephone}</div>
                    )}
                  </div>
                </div>

                {user && user.id !== s.user_id && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate('/messages', { state: { service: s } })}
                      style={{
                        padding: '9px 20px', background: 'var(--dark)',
                        color: 'white', border: 'none',
                        borderRadius: 10, fontWeight: 600, fontSize: 14
                      }}
                    >
                      Contacter →
                    </button>
                    <button
                      onClick={() => signalerService(s.id)}
                      style={{
                        padding: '9px 12px', background: 'white',
                        color: '#ef4444', border: '1.5px solid #ef4444',
                        borderRadius: 10, fontWeight: 600, fontSize: 13
                      }}
                      title="Signaler cette annonce"
                    >
                      🚩
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}