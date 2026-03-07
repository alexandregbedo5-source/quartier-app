import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Connexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [quartier, setQuartier] = useState('')
  const [mode, setMode] = useState('login')
  const [erreur, setErreur] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    setErreur('')
    setMsg('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setErreur(error.message); setLoading(false); return }
      navigate('/')
    } else {
      if (!nom.trim() || !quartier.trim()) {
        setErreur('Prénom et quartier sont obligatoires.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setErreur(error.message); setLoading(false); return }
      if (data.user) {
        const { error: profilError } = await supabase.from('profiles').insert({
          id: data.user.id, nom, quartier
        })
        if (profilError) { setErreur(profilError.message); setLoading(false); return }
      }
      setMsg('Compte créé ! Tu peux te connecter.')
      setMode('login')
    }
    setLoading(false)
  }

  const inputStyle = {
    display: 'block', width: '100%',
    marginBottom: 14, padding: '12px 16px',
    borderRadius: 10, border: '1.5px solid var(--border)',
    fontSize: 15, background: 'var(--bg)',
    boxSizing: 'border-box'
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'white', borderRadius: 20,
        padding: '36px 32px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        border: '1px solid var(--border)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏘️</div>
          <h2 style={{ fontSize: 26, marginBottom: 6 }}>
            {mode === 'login' ? 'Bon retour !' : 'Rejoins le quartier'}
          </h2>
          <p style={{ color: 'var(--grey)', fontSize: 14 }}>
            {mode === 'login'
              ? 'Connecte-toi pour accéder à ta communauté'
              : 'Crée ton compte gratuitement'}
          </p>
        </div>

        {mode === 'register' && (
          <>
            <input
              placeholder="Ton prénom"
              value={nom}
              onChange={e => setNom(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Ton quartier"
              value={quartier}
              onChange={e => setQuartier(e.target.value)}
              style={inputStyle}
            />
          </>
        )}

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        {erreur && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#dc2626', padding: '10px 14px',
            borderRadius: 8, marginBottom: 14, fontSize: 14
          }}>
            {erreur}
          </div>
        )}
        {msg && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            color: '#16a34a', padding: '10px 14px',
            borderRadius: 8, marginBottom: 14, fontSize: 14
          }}>
            {msg}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: 14,
            background: loading ? '#f97316' : 'var(--primary)',
            color: 'white', border: 'none',
            borderRadius: 10, fontSize: 16,
            fontWeight: 700, marginBottom: 16
          }}
        >
          {loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </button>

        <p
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErreur(''); setMsg('') }}
          style={{
            textAlign: 'center', cursor: 'pointer',
            color: 'var(--primary)', fontSize: 14, fontWeight: 600
          }}
        >
          {mode === 'login' ? "Pas de compte ? S'inscrire →" : '← Déjà un compte ? Se connecter'}
        </p>
      </div>
    </div>
  )
}