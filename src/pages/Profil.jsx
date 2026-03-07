import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Profil() {
  const [nom, setNom] = useState('')
  const [quartier, setQuartier] = useState('')
  const [bio, setBio] = useState('')
  const [telephone, setTelephone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [mesServices, setMesServices] = useState([])
  const [msg, setMsg] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const { user } = useAuth()
  const fileRef = useRef()

  useEffect(() => {
    chargerProfil()
    chargerMesServices()
  }, [])

  async function chargerProfil() {
    const { data, error } = await supabase
      .from('profiles').select('*')
      .eq('id', user.id).single()
    if (error) { console.error(error); setLoading(false); return }
    setNom(data.nom || '')
    setQuartier(data.quartier || '')
    setBio(data.bio || '')
    setTelephone(data.telephone || '')
    setAvatarUrl(data.avatar_url || null)
    setLoading(false)
  }

  async function chargerMesServices() {
    const { data, error } = await supabase
      .from('services').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setMesServices(data || [])
  }

  async function uploadAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadLoading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { console.error(uploadError); setUploadLoading(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${data.publicUrl}?t=${Date.now()}`
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    setAvatarUrl(url)
    setUploadLoading(false)
  }

  async function sauvegarder() {
    setMsg(''); setErreur('')
    const { error } = await supabase
      .from('profiles').update({ nom, quartier, bio, telephone })
      .eq('id', user.id)
    if (error) return setErreur(error.message)
    setMsg('Profil mis à jour !')
    setTimeout(() => setMsg(''), 3000)
  }

  async function supprimerService(id) {
    const ok = window.confirm('Tu veux vraiment supprimer ce service ? Cette action est irréversible.')
    if (!ok) return
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) return console.error(error)
    chargerMesServices()
  }

  async function toggleStatut(service) {
    const nouveau = service.statut === 'actif' ? 'inactif' : 'actif'
    const { error } = await supabase
      .from('services').update({ statut: nouveau }).eq('id', service.id)
    if (error) return console.error(error)
    chargerMesServices()
  }

  async function marquerResolu(id) {
    const ok = window.confirm('Marquer ce service comme résolu ? Il sera retiré de la liste publique.')
    if (!ok) return
    const { error } = await supabase
      .from('services').update({ statut: 'resolu' }).eq('id', id)
    if (error) return console.error(error)
    chargerMesServices()
  }

  const inputStyle = {
    display: 'block', width: '100%',
    marginBottom: 14, padding: '12px 16px',
    borderRadius: 10, border: '1.5px solid var(--border)',
    fontSize: 15, background: 'var(--bg)',
    boxSizing: 'border-box'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--grey)' }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>

      {/* Avatar + nom */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {avatarUrl ? (
            <img
              src={avatarUrl} alt="avatar"
              style={{
                width: 80, height: 80, borderRadius: '50%',
                objectFit: 'cover', border: '3px solid var(--primary)'
              }}
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 900, fontFamily: 'Unbounded, sans-serif'
            }}>
              {nom?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <button
            onClick={() => fileRef.current.click()}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--dark)', color: 'white',
              border: '2px solid white', fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {uploadLoading ? '...' : '✏️'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} style={{ display: 'none' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>{nom || 'Mon profil'}</h2>
          <p style={{ color: 'var(--grey)', fontSize: 14 }}>📍 {quartier || 'Quartier non défini'}</p>
        </div>
      </div>

      {/* Formulaire */}
      <div style={{
        background: 'white', borderRadius: 20,
        padding: '28px 24px', marginBottom: 28,
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)'
      }}>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>Modifier mon profil</h3>
        <input placeholder="Ton prénom" value={nom} onChange={e => setNom(e.target.value)} style={inputStyle} />
        <input placeholder="Ton quartier" value={quartier} onChange={e => setQuartier(e.target.value)} style={inputStyle} />
        <input placeholder="Ton numéro de téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} style={inputStyle} />
        <textarea placeholder="Parle un peu de toi..." value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

        {erreur && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 14 }}>
            {erreur}
          </div>
        )}
        {msg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 14 }}>
            {msg}
          </div>
        )}

        <button
          onClick={sauvegarder}
          style={{
            padding: '12px 28px', background: 'var(--primary)',
            color: 'white', border: 'none', borderRadius: 10,
            fontWeight: 700, fontSize: 15
          }}
        >
          Sauvegarder
        </button>
      </div>

      {/* Mes services */}
      <h3 style={{ fontSize: 20, marginBottom: 16 }}>
        Mes services
        <span style={{
          marginLeft: 10, background: 'var(--primary-light)',
          color: 'var(--primary)', padding: '2px 10px',
          borderRadius: 20, fontSize: 14, fontWeight: 600
        }}>
          {mesServices.length}
        </span>
      </h3>

      {mesServices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 16, border: '2px dashed var(--border)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <p style={{ color: 'var(--grey)' }}>Tu n'as pas encore posté de service.</p>
        </div>
      ) : (
        mesServices.map(s => (
          <div key={s.id} style={{
            background: 'white', borderRadius: 14,
            border: '1px solid var(--border)', padding: '18px 20px',
            marginBottom: 12, boxShadow: 'var(--shadow)',
            opacity: s.statut !== 'actif' ? 0.5 : 1
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    background: s.type === 'offre' ? '#d1fae5' : '#fef3c7',
                    color: s.type === 'offre' ? '#065f46' : '#92400e',
                    padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700
                  }}>
                    {s.type === 'offre' ? '✅ Offre' : '🙋 Demande'}
                  </span>
                  <span style={{
                    background: s.statut === 'actif' ? '#eff6ff' : s.statut === 'resolu' ? '#f0fdf4' : '#f3f4f6',
                    color: s.statut === 'actif' ? '#2563eb' : s.statut === 'resolu' ? '#16a34a' : 'var(--grey)',
                    padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
                  }}>
                    {s.statut === 'actif' ? '● Actif' : s.statut === 'resolu' ? '✅ Résolu' : '○ Inactif'}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: 16 }}>{s.titre}</h4>
                <p style={{ color: 'var(--grey)', fontSize: 13, margin: 0 }}>{s.description}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                {s.statut === 'actif' && (
                  <button
                    onClick={() => marquerResolu(s.id)}
                    style={{
                      padding: '7px 14px', borderRadius: 8,
                      border: '1.5px solid #16a34a',
                      background: 'white', color: '#16a34a',
                      fontSize: 13, fontWeight: 600
                    }}
                  >
                    ✅ Résolu
                  </button>
                )}
                {s.statut !== 'resolu' && (
                  <button
                    onClick={() => toggleStatut(s)}
                    style={{
                      padding: '7px 14px', borderRadius: 8,
                      border: '1.5px solid var(--primary)',
                      background: 'white', color: 'var(--primary)',
                      fontSize: 13, fontWeight: 600
                    }}
                  >
                    {s.statut === 'actif' ? 'Désactiver' : 'Réactiver'}
                  </button>
                )}
                <button
                  onClick={() => supprimerService(s.id)}
                  style={{
                    padding: '7px 14px', borderRadius: 8,
                    border: '1.5px solid #ef4444',
                    background: 'white', color: '#ef4444',
                    fontSize: 13, fontWeight: 600
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}