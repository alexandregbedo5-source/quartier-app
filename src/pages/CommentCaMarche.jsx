export default function CommentCaMarche() {
  const etapes = [
    {
      numero: '01',
      titre: 'Crée ton compte',
      description: 'Inscris-toi gratuitement avec ton email. Remplis ton profil avec ton prénom, ton quartier et une photo.',
      emoji: '👤'
    },
    {
      numero: '02',
      titre: 'Poste une annonce',
      description: 'Propose un service que tu peux rendre (bricolage, jardinage, cuisine...) ou demande de l\'aide pour quelque chose.',
      emoji: '📝'
    },
    {
      numero: '03',
      titre: 'Entre en contact',
      description: 'Clique sur "Contacter" pour envoyer un message directement au voisin. Échangez et organisez-vous.',
      emoji: '💬'
    },
    {
      numero: '04',
      titre: 'Échangez & notez',
      description: 'Réalisez l\'échange. Laissez un avis sur le profil du voisin pour aider la communauté.',
      emoji: '⭐'
    }
  ]

  const valeurs = [
    { emoji: '🤝', titre: 'Solidarité', description: 'Chaque échange renforce le lien social dans le quartier.' },
    { emoji: '🆓', titre: 'Gratuit', description: 'Aucun paiement, aucune commission. Juste du service trouvé.' },
    { emoji: '🔒', titre: 'Confiance', description: 'Profils vérifiés, système de notation, messagerie sécurisée.' },
    { emoji: '📍', titre: 'Local', description: 'Uniquement des voisins de ton quartier. Pas d\'inconnus.' },
  ]

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 16px' }}>

      {/* Hero */}
      <div style={{
        background: 'var(--dark)', borderRadius: 24,
        padding: '52px 40px', marginBottom: 56,
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
            PLATEFORME GRATUITE
          </div>
          <h1 style={{
            color: 'white', fontSize: 'clamp(24px, 5vw, 44px)',
            lineHeight: 1.15, marginBottom: 16, letterSpacing: '-1px'
          }}>
            Comment ça<br />
            <span style={{ color: 'var(--primary)' }}>marche ?</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            MonQuartier connecte les voisins pour s'entraider. En 4 étapes simples.
          </p>
        </div>
      </div>

      {/* Étapes */}
      <h2 style={{ fontSize: 22, marginBottom: 28, letterSpacing: '-0.5px' }}>Les 4 étapes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 64 }}>
        {etapes.map((e, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 16,
            padding: '28px 20px', border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)', position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: -10, right: -10,
              fontFamily: 'Unbounded, sans-serif',
              fontSize: 64, fontWeight: 900,
              color: 'rgba(232,84,10,0.06)', lineHeight: 1
            }}>
              {e.numero}
            </div>
            <div style={{ fontSize: 36, marginBottom: 14 }}>{e.emoji}</div>
            <div style={{
              fontFamily: 'Unbounded, sans-serif',
              fontSize: 11, color: 'var(--primary)',
              fontWeight: 700, marginBottom: 8, letterSpacing: '1px'
            }}>
              ÉTAPE {e.numero}
            </div>
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>{e.titre}</h3>
            <p style={{ color: 'var(--grey)', fontSize: 13, lineHeight: 1.7 }}>{e.description}</p>
          </div>
        ))}
      </div>

      {/* Valeurs */}
      <h2 style={{ fontSize: 22, marginBottom: 28, letterSpacing: '-0.5px' }}>Nos valeurs</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 64 }}>
        {valeurs.map((v, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 14,
            padding: '22px 18px', border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{v.emoji}</div>
            <h4 style={{ fontSize: 15, marginBottom: 8 }}>{v.titre}</h4>
            <p style={{ color: 'var(--grey)', fontSize: 13, lineHeight: 1.6 }}>{v.description}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 style={{ fontSize: 22, marginBottom: 28, letterSpacing: '-0.5px' }}>Questions fréquentes</h2>
      <div style={{ display: 'grid', gap: 12, marginBottom: 48 }}>
        {[
          { q: "C'est vraiment gratuit ?", r: "Oui, totalement. Aucun paiement n'est demandé ni entre voisins ni pour utiliser la plateforme." },
          { q: "Comment savoir si un voisin est fiable ?", r: "Consulte son profil public : ses avis, sa note moyenne, et ses services actifs. Le bouche à oreille numérique." },
          { q: "Je n'arrive pas à contacter un voisin ?", r: "Tu dois être connecté pour envoyer un message. Crée un compte en 30 secondes." },
          { q: "Puis-je supprimer mon annonce ?", r: "Oui, depuis ton profil tu peux désactiver ou supprimer tes services à tout moment." },
        ].map((faq, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 12,
            border: '1px solid var(--border)', padding: '20px 22px',
            boxShadow: 'var(--shadow)'
          }}>
            <h4 style={{ fontSize: 15, marginBottom: 8, color: 'var(--primary)' }}>❓ {faq.q}</h4>
            <p style={{ color: 'var(--grey)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{faq.r}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        background: 'var(--primary)', borderRadius: 20,
        padding: '40px 32px', textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', fontSize: 24, marginBottom: 12 }}>
          Prêt à commencer ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 24, fontSize: 15 }}>
          Crée ton compte gratuitement et poste ton premier service en 2 minutes.
        </p>
        <a href="/connexion" style={{
          display: 'inline-block',
          background: 'white', color: 'var(--primary)',
          padding: '13px 32px', borderRadius: 10,
          fontWeight: 700, fontSize: 15
        }}>
          Commencer maintenant →
        </a>
      </div>
    </div>
  )
}