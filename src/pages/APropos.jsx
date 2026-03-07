export default function APropos() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 16px' }}>

      {/* Hero */}
      <div style={{
        background: 'var(--dark)', borderRadius: 24,
        padding: '52px 40px', marginBottom: 48,
        position: 'relative', overflow: 'hidden', textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            repeating-linear-gradient(60deg, transparent, transparent 30px, rgba(232,84,10,0.06) 30px, rgba(232,84,10,0.06) 31px),
            repeating-linear-gradient(-60deg, transparent, transparent 30px, rgba(255,255,255,0.02) 30px, rgba(255,255,255,0.02) 31px)
          `,
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(232,84,10,0.2)', color: 'var(--primary)',
            padding: '4px 16px', borderRadius: 20,
            fontSize: 12, fontWeight: 600, marginBottom: 20, letterSpacing: '0.5px'
          }}>
            À PROPOS
          </div>
          <h1 style={{
            color: 'white', fontSize: 'clamp(24px, 5vw, 44px)',
            lineHeight: 1.15, marginBottom: 16, letterSpacing: '-1px'
          }}>
            L'histoire de<br />
            <span style={{ color: 'var(--primary)' }}>MonQuartier</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Une initiative locale née d'un constat simple : les services sont compliqués à trouver.
          </p>
        </div>
      </div>

      {/* Histoire */}
      <div style={{
        background: 'white', borderRadius: 20,
        border: '1px solid var(--border)',
        padding: '36px 32px', marginBottom: 28,
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Notre histoire</h2>
        <p style={{ color: 'var(--grey)', fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
          MonQuartier est né d'une observation du quotidien : dans nos villes, les gens vivent côte à côte sans jamais vraiment se rencontrer. On hésite à demander de l'aide à un voisin qu'on ne connaît pas, et pourtant chacun a des compétences et du temps à partager.
        </p>
        <p style={{ color: 'var(--grey)', fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
          Cette plateforme a été créée pour briser cette barrière. Ici, pas d'argent, pas de transactions complexes — juste des services échangés librement entre personnes d'un même quartier.
        </p>
        <p style={{ color: 'var(--grey)', fontSize: 15, lineHeight: 1.8 }}>
          Le projet est simple, gratuit, et pensé pour durer. Chaque inscription est une pierre de plus dans la construction d'une communauté de proximité solidaire.
        </p>
      </div>

      {/* Fondateur */}
      <div style={{
        background: 'var(--dark)', borderRadius: 20,
        padding: '36px 32px', marginBottom: 28,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160, background: 'var(--primary)',
          borderRadius: '50%', opacity: 0.1
        }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <img
            src="https://grfxhaoifxxexswxjzby.supabase.co/storage/v1/object/public/Avatar/50054.jpg"
            alt="GBEDO Alexandre"
            style={{
              width: 80, height: 80, borderRadius: '50%',
              objectFit: 'cover', flexShrink: 0,
              border: '3px solid var(--primary)'
            }}
          />
          <div>
            <div style={{
              color: 'rgba(255,255,255,0.4)', fontSize: 12,
              fontWeight: 600, letterSpacing: '1px', marginBottom: 6
            }}>
              FONDATEUR
            </div>
            <h3 style={{ color: 'white', fontSize: 22, marginBottom: 6 }}>GBEDO Alexandre</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 12 }}>
              Développeur & initiateur du projet MonQuartier
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="tel:0142470420" style={{
                color: 'var(--primary)', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                📞 01 42 47 04 20
              </a>
              <a href="tel:0193716700" style={{
                color: 'var(--primary)', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                📞 01 93 71 67 00
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Notre mission</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 48 }}>
        {[
          { emoji: '🌍', titre: 'Créer du lien', description: "Rapprocher les habitants d'un même quartier à travers l'entraide." },
          { emoji: '♻️', titre: 'Économie circulaire', description: "Valoriser les compétences locales sans passer par l'argent." },
          { emoji: '🚀', titre: 'Accessibilité', description: 'Une plateforme simple, rapide, gratuite pour tous.' },
          { emoji: '🤝', titre: 'Solidarité', description: "Construire une communauté où chacun peut compter sur l'autre." },
        ].map((m, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 14,
            border: '1px solid var(--border)', padding: '22px 18px',
            boxShadow: 'var(--shadow)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{m.emoji}</div>
            <h4 style={{ fontSize: 15, marginBottom: 8 }}>{m.titre}</h4>
            <p style={{ color: 'var(--grey)', fontSize: 13, lineHeight: 1.6 }}>{m.description}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        background: 'var(--primary)', borderRadius: 20,
        padding: '40px 32px', textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', fontSize: 24, marginBottom: 12 }}>
          Rejoins l'aventure
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 24, fontSize: 15 }}>
          Ensemble, faisons de nos quartiers des lieux de vie solidaires.
        </p>
        <a href="/connexion" style={{
          display: 'inline-block',
          background: 'white', color: 'var(--primary)',
          padding: '13px 32px', borderRadius: 10,
          fontWeight: 700, fontSize: 15
        }}>
          Créer mon compte →
        </a>
      </div>
    </div>
  )
}