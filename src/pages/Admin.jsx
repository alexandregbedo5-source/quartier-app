import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const ADMIN_ID = 'c22b9331-e3e0-440a-912c-f9967b8fd4fc'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [signalements, setSignalements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.id !== ADMIN_ID) {
      navigate('/')
      return
    }
    chargerSignalements()
  }, [user])

  async function chargerSignalements() {
    const { data, error } = await supabase
      .from('signalements')
      .select('*, services(titre, description, statut, user_id), profiles!signalements_user_id_fkey(nom)')
      .order('created_at', { ascending: false })

    if (error) { console.error(error); setLoading(false); return }
    setSignalements(data || [])
    setLoading(false)
  }

  async function supprimerService(serviceId, signalementId) {
    const ok = window.confirm('Supprimer ce service définitivement ?')
    if (!ok) return
    await supabase.from('services').delete().eq('id', serviceId)
    await supabase.from('signalements').delete().eq('id', signalementId)
    chargerSignalements()
  }

  async function ignorerSignalement(id) {
    await supabase.from('signalements').delete().eq('id', id)
    chargerSignalements()
  }

  if (!user || user.id !== ADMIN_ID) return null

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px' }}>

      {/* Header */}
      <div style={{
        background: 'var(--dark)', borderRadius: 20,
        padding: '32px 28px', marginBottom: 32,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(60deg, transparent, transparent 30px, rgba(232,84,10,0.06) 30px, rgba(232,84,10,0.06) 31px)`,
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(232,84,10,0.2)',
            color: 'var(--primary)', padding: '4px 14px', borderRadius: 20,
            fontSize: 12, fontWeight: 600, marginBottom: 12, letterSpacing: '0.5px'
          }}>
            ADMINISTRATION
          </div>
          <h1 style={{ color: 'white', fontSize: 28, letterSpacing: '-0.5px' }}>
            Signalements
            <span style={{
              marginLeft: 12, background: '#ef4444', color: 'white',
              borderRadius: '50%', width: 32, height: 32,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700, verticalAlign: 'middle'
            }}>
              {signalements.length}
            </span>
          </h1>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--grey)' }}>Chargement...</p>
      ) : signalements.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'white', borderRadius: 16,
          border: '2px dashed var(--border)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ color: 'var(--grey)', fontSize: 16 }}>Aucun signalement en attente.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {signalements.map(s => (
            <div key={s.id} style={{
              background: 'white', borderRadius: 16,
              border: '1px solid var(--border)',
              padding: '20px 24px', boxShadow: 'var(--shadow)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#fef2f2', color: '#dc2626',
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700
                    }}>
                      🚩 Signalement
                    </span>
                    <span style={{
                      background: 'var(--bg)', color: 'var(--grey)',
                      padding: '4px 12px', borderRadius: 20, fontSize: 12
                    }}>
                      Par {s.profiles?.nom}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: 16 }}>
                    Annonce : {s.services?.titre || 'Annonce supprimée'}
                  </h4>
                  <p style={{ color: 'var(--grey)', fontSize: 13, margin: '0 0 8px' }}>
                    {s.services?.description}
                  </p>
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 8, padding: '8px 12px'
                  }}>
                    <strong style={{ fontSize: 13, color: '#dc2626' }}>Raison :</strong>
                    <span style={{ fontSize: 13, color: '#374151', marginLeft: 6 }}>{s.raison}</span>
                  </div>
                  <small style={{ color: 'var(--grey)', fontSize: 12, marginTop: 8, display: 'block' }}>
                    {new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  {s.services && (
                    <button
                      onClick={() => supprimerService(s.service_id, s.id)}
                      style={{
                        padding: '9px 16px', borderRadius: 8,
                        border: 'none', background: '#ef4444',
                        color: 'white', fontSize: 13, fontWeight: 700
                      }}
                    >
                      Supprimer l'annonce
                    </button>
                  )}
                  <button
                    onClick={() => ignorerSignalement(s.id)}
                    style={{
                      padding: '9px 16px', borderRadius: 8,
                      border: '1.5px solid var(--border)',
                      background: 'white', color: 'var(--grey)',
                      fontSize: 13, fontWeight: 600
                    }}
                  >
                    Ignorer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}