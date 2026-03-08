import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function BannierePublicitaire() {
  const [pubs, setPubs] = useState([])
  const [index, setIndex] = useState(0)

  useEffect(() => { chargerPubs() }, [])

  useEffect(() => {
    if (pubs.length <= 1) return
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % pubs.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [pubs])

  async function chargerPubs() {
    const { data } = await supabase.from('publicites').select('*').eq('actif', true)
    setPubs(data || [])
  }

  if (pubs.length === 0) return (
    <div style={{ background: 'white', borderRadius: 14, border: '2px dashed var(--border)', padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--grey)', fontWeight: 600, marginBottom: 4 }}>ESPACE PUBLICITAIRE</div>
        <p style={{ color: 'var(--grey)', fontSize: 14 }}>Votre commerce ici — contactez-nous au 01 42 47 04 80</p>
      </div>
      <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
        À partir de 2000f/mois
      </div>
    </div>
  )

  const pub = pubs[index]

  return (
    <a href={pub.lien || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--bg)', color: 'var(--grey)', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
          SPONSORISÉ
        </div>
        {pub.image_url ? (
          <img src={pub.image_url} alt={pub.nom_commerce} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏪</div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{pub.nom_commerce}</div>
          {pub.slogan && <p style={{ color: 'var(--grey)', fontSize: 13, margin: 0 }}>{pub.slogan}</p>}
        </div>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          Découvrir →
        </div>
        {pubs.length > 1 && (
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
            {pubs.map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === index ? 'var(--primary)' : 'var(--border)' }} />
            ))}
          </div>
        )}
      </div>
    </a>
  )
}