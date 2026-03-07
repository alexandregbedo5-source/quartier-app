import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  'Bricolage', 'Carrelage', 'Cuisine', "Gardiennage", 'Maçonnerie', 'Soutien informatique',
  'Dépannage', 'Transport', '', 'Cours / Soutien',
  , 'Autre'
]

export default function NouveauService() {
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('offre')
  const [categorie, setCategorie] = useState('Autre')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit() {
    if (!titre.trim() || !description.trim()) {
      return setErreur('Titre et description sont obligatoires.')
    }
    setLoading(true)
    setErreur('')

    const { error } = await supabase.from('services').insert({
      user_id: user.id,
      titre, description, type, categorie, statut: 'actif'
    })

    if (error) { setErreur(error.message); setLoading(false) }
    else navigate('/')
  }

  const inputStyle = {
    display: 'block', width: '100%',
    marginBottom: 16, padding: '12px 16px',
    borderRadius: 10, border: '1.5px solid var(--border)',
    fontSize: 15, background: 'var(--bg)',
    boxSizing: 'border-box'
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center', padding: '32px 16px'
    }}>
      <div style={{
        width: '100%', maxWidth: 560,
        background: 'white', borderRadius: 20,
        padding: '36px 32px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        border: '1px solid var(--border)'
      }}>
        <h2 style={{ fontSize: 26, marginBottom: 6 }}>Poster un service</h2>
        <p style={{ color: 'var(--grey)', fontSize: 14, marginBottom: 28 }}>
          Propose ou demande de l'aide à tes voisins
        </p>

        {/* Toggle offre / demande */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, marginBottom: 24
        }}>
          {[
            { val: 'offre', emoji: '✅', label: 'Je propose' },
            { val: 'demande', emoji: '🙋', label: 'Je cherche' }
          ].map(t => (
            <button
              key={t.val}
              onClick={() => setType(t.val)}
              style={{
                padding: '14px 10px', borderRadius: 12,
                border: `2px solid ${type === t.val ? 'var(--primary)' : 'var(--border)'}`,
                background: type === t.val ? 'var(--primary-light)' : 'white',
                color: type === t.val ? 'var(--primary)' : 'var(--grey)',
                fontWeight: 700, fontSize: 15,
                transition: 'all 0.15s'
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <input
          placeholder="Titre du service"
          value={titre}
          onChange={e => setTitre(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Décris ton service en quelques lignes..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <select
          value={categorie}
          onChange={e => setCategorie(e.target.value)}
          style={inputStyle}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {erreur && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#dc2626', padding: '10px 14px',
            borderRadius: 8, marginBottom: 16, fontSize: 14
          }}>
            {erreur}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              flex: 1, padding: 14,
              background: 'white', color: 'var(--dark)',
              border: '1.5px solid var(--border)',
              borderRadius: 10, fontWeight: 600, fontSize: 15
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 2, padding: 14,
              background: loading ? '#f97316' : 'var(--primary)',
              color: 'white', border: 'none',
              borderRadius: 10, fontWeight: 700, fontSize: 15
            }}
          >
            {loading ? 'Publication...' : 'Publier le service'}
          </button>
        </div>
      </div>
    </div>
  )
}