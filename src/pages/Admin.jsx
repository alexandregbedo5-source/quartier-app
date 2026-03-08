import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const ADMIN_ID = 'c22b9331-e3e0-440a-912c-f9967b8fd4fc'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [onglet, setOnglet] = useState('signalements')
  const [signalements, setSignalements] = useState([])
  const [pubs, setPubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [nouvellePub, setNouvellePub] = useState({ nom_commerce: '', slogan: '', lien: '' })
  const [msgPub, setMsgPub] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    if (!user || user.id !== ADMIN_ID) { navigate('/'); return }
    chargerSignalements()
    chargerPubs()
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

  async function chargerPubs() {
    const { data } = await supabase.from('publicites').select('*').order('created_at', { ascending: false })
    setPubs(data || [])
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

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function ajouterPub() {
    if (!nouvellePub.nom_commerce.trim()) {
      setMsgPub('Le nom du commerce est obligatoire.')
      return
    }
    setUploadLoading(true)
    let image_url = ''

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `pub_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(path, imageFile, { upsert: true })
      if (uploadError) {
        console.error(uploadError)
        setMsgPub('Erreur upload image.')
        setUploadLoading(false)
        return
      }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      image_url = data.publicUrl
    }

    const { error } = await supabase.from('publicites').insert({
      ...nouvellePub,
      image_url
    })

    if (error) {
      console.error(error)
      setMsgPub('Erreur lors de l\'ajout.')
      setUploadLoading(false)
      return
    }

    setNouvellePub({ nom_commerce: '', slogan: '', lien: '' })
    setImageFile(null)
    setImagePreview(null)
    setMsgPub('✅ Pub ajoutée avec succès !')
    setTimeout(() => setMsgPub(''), 3000)
    chargerPubs()
    setUploadLoading(false)
  }

  async function togglePub(pub) {
    await supabase.from('publicites').update({ actif: !pub.actif }).eq('id', pub.id)
    chargerPubs()
  }

  async function supprimerPub(id) {
    const ok = window.confirm('Supprimer cette publicité ?')
    if (!ok) return
    await supabase.from('publicites').delete().eq('id', id)
    chargerPubs()
  }

  if (!user || user.id !== ADMIN_ID) return null

  const inputStyle = {
    display: 'block', width: '100%', marginBottom: 12,
    padding: '11px 14px', borderRadius: 8,
    border: '1.5px solid var(--border)', fontSize: 14,
    background: 'var(--bg)', boxSizing: 'border-box',
    color: 'var(--dark)'
  }

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
            color: '#e8540a', padding: '4px 14px', borderRadius: 20,
            fontSize: 12, fontWeight: 600, marginBottom: 12, letterSpacing: '0.5px'
          }}>
            ADMINISTRATION
          </div>
          <h1 style={{ color: 'white', fontSize: 28, letterSpacing: '-0.5px', margin: 0 }}>
            Tableau de bord
          </h1>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <button
          onClick={() => setOnglet('signalements')}
          style={{
            padding: '12px 24px', borderRadius: 10, cursor: 'pointer',
            border: '2px solid #e8540a', fontWeight: 700, fontSize: 14,
            background: onglet === 'signalements' ? '#e8540a' : 'white',
            color: onglet === 'signalements' ? 'white' : '#e8540a'
          }}
        >
          🚩 Signalements ({signalements.length})
        </button>
        <button
          onClick={() => setOnglet('pubs')}
          style={{
            padding: '12px 24px', borderRadius: 10, cursor: 'pointer',
            border: '2px solid #e8540a', fontWeight: 700, fontSize: 14,
            background: onglet === 'pubs' ? '#e8540a' : 'white',
            color: onglet === 'pubs' ? 'white' : '#e8540a'
          }}
        >
          📢 Publicités ({pubs.length})
        </button>
      </div>

      {/* SIGNALEMENTS */}
      {onglet === 'signalements' && (
        loading ? <p style={{ color: 'var(--grey)' }}>Chargement...</p> :
        signalements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '2px dashed var(--border)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: 'var(--grey)', fontSize: 16 }}>Aucun signalement en attente.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {signalements.map(s => (
              <div key={s.id} style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🚩 Signalement</span>
                      <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>Par {s.profiles?.nom}</span>
                    </div>
                    <h4 style={{ margin: '0 0 6px', fontSize: 16 }}>Annonce : {s.services?.titre || 'Annonce supprimée'}</h4>
                    <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 8px' }}>{s.services?.description}</p>
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px' }}>
                      <strong style={{ fontSize: 13, color: '#dc2626' }}>Raison :</strong>
                      <span style={{ fontSize: 13, color: '#374151', marginLeft: 6 }}>{s.raison}</span>
                    </div>
                    <small style={{ color: '#6b7280', fontSize: 12, marginTop: 8, display: 'block' }}>
                      {new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </small>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {s.services && (
                      <button onClick={() => supprimerService(s.service_id, s.id)} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        Supprimer l'annonce
                      </button>
                    )}
                    <button onClick={() => ignorerSignalement(s.id)} style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Ignorer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* PUBLICITÉS */}
      {onglet === 'pubs' && (
        <div>
          {/* Formulaire */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: '24px', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Ajouter une publicité</h3>

            <input
              placeholder="Nom du commerce *"
              value={nouvellePub.nom_commerce}
              onChange={e => setNouvellePub({ ...nouvellePub, nom_commerce: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Slogan ou description courte"
              value={nouvellePub.slogan}
              onChange={e => setNouvellePub({ ...nouvellePub, slogan: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Lien vers le site web (optionnel)"
              value={nouvellePub.lien}
              onChange={e => setNouvellePub({ ...nouvellePub, lien: e.target.value })}
              style={inputStyle}
            />

            {/* Upload logo */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Logo / Image du commerce</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }} />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🏪</div>
                )}
                <button
                  onClick={() => fileRef.current.click()}
                  style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'white', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {imagePreview ? 'Changer l\'image' : 'Choisir une image'}
                </button>
                {imagePreview && (
                  <button
                    onClick={() => { setImagePreview(null); setImageFile(null) }}
                    style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid #ef4444', background: 'white', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}
                  >
                    Supprimer
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>

            {msgPub && (
              <p style={{ color: msgPub.startsWith('✅') ? '#16a34a' : '#dc2626', fontSize: 14, marginBottom: 12, fontWeight: 600 }}>
                {msgPub}
              </p>
            )}

            <button
              onClick={ajouterPub}
              disabled={uploadLoading}
              style={{ padding: '12px 28px', background: '#e8540a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: uploadLoading ? 0.7 : 1 }}
            >
              {uploadLoading ? 'Ajout en cours...' : 'Ajouter la publicité'}
            </button>
          </div>

          {/* Liste pubs */}
          {pubs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 16, border: '2px dashed var(--border)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📢</div>
              <p style={{ color: '#6b7280' }}>Aucune publicité pour l'instant.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {pubs.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: '16px 20px', opacity: p.actif ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.nom_commerce} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: 56, height: 56, borderRadius: 10, background: '#e8540a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white' }}>🏪</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.nom_commerce}</div>
                        {p.slogan && <div style={{ color: '#6b7280', fontSize: 13 }}>{p.slogan}</div>}
                        <span style={{ fontSize: 12, color: p.actif ? '#16a34a' : '#6b7280', fontWeight: 600 }}>
                          {p.actif ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => togglePub(p)} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e8540a', background: 'white', color: '#e8540a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        {p.actif ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => supprimerPub(p.id)} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #ef4444', background: 'white', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}