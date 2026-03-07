import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const [conversations, setConversations] = useState([])
  const [convActive, setConvActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [contenu, setContenu] = useState('')
  const [loading, setLoading] = useState(true)
  const [vue, setVue] = useState('liste') // 'liste' ou 'chat' sur mobile
  const { user } = useAuth()
  const location = useLocation()
  const serviceEntrant = location.state?.service
  const bottomRef = useRef(null)

  useEffect(() => { chargerConversations() }, [])

  useEffect(() => {
    if (convActive) {
      chargerMessages(convActive)
      const sub = supabase
        .channel('messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
          chargerMessages(convActive)
          chargerConversations()
        })
        .subscribe()
      return () => supabase.removeChannel(sub)
    }
  }, [convActive])

  useEffect(() => {
    if (serviceEntrant && serviceEntrant.user_id !== user.id) {
      const conv = {
        interlocuteur_id: serviceEntrant.user_id,
        interlocuteur_nom: serviceEntrant.profiles?.nom,
        service_id: serviceEntrant.id,
        service_titre: serviceEntrant.titre
      }
      setConvActive(conv)
      setVue('chat')
    }
  }, [serviceEntrant])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function chargerConversations() {
    const { data, error } = await supabase
      .from('messages')
      .select('*, expediteur:profiles!messages_expediteur_id_fkey(nom), destinataire:profiles!messages_destinataire_id_fkey(nom), services(titre)')
      .or(`expediteur_id.eq.${user.id},destinataire_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) { console.error(error); setLoading(false); return }

    const vues = new Set()
    const convs = []
    for (const m of data || []) {
      const interlocuteur_id = m.expediteur_id === user.id ? m.destinataire_id : m.expediteur_id
      const interlocuteur_nom = m.expediteur_id === user.id ? m.destinataire?.nom : m.expediteur?.nom
      const cle = `${interlocuteur_id}-${m.service_id}`
      if (!vues.has(cle)) {
        vues.add(cle)
        const nonLus = data.filter(msg =>
          msg.service_id === m.service_id &&
          msg.destinataire_id === user.id &&
          msg.expediteur_id === interlocuteur_id &&
          !msg.lu
        ).length
        convs.push({
          interlocuteur_id, interlocuteur_nom,
          service_id: m.service_id,
          service_titre: m.services?.titre,
          dernier_message: m.contenu,
          nonLus
        })
      }
    }
    setConversations(convs)
    setLoading(false)
  }

  async function chargerMessages(conv) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('service_id', conv.service_id)
      .or(`and(expediteur_id.eq.${user.id},destinataire_id.eq.${conv.interlocuteur_id}),and(expediteur_id.eq.${conv.interlocuteur_id},destinataire_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    if (error) console.error(error)
    setMessages(data || [])

    await supabase
      .from('messages')
      .update({ lu: true })
      .eq('destinataire_id', user.id)
      .eq('service_id', conv.service_id)

    chargerConversations()
  }

  async function envoyerMessage() {
    if (!contenu.trim() || !convActive) return
    const { error } = await supabase.from('messages').insert({
      expediteur_id: user.id,
      destinataire_id: convActive.interlocuteur_id,
      service_id: convActive.service_id,
      contenu
    })
    if (error) { console.error(error); return }
    setContenu('')
    chargerMessages(convActive)
    chargerConversations()
  }

  function ouvrirConv(c) {
    setConvActive(c)
    setVue('chat')
  }

  const totalNonLus = conversations.reduce((acc, c) => acc + (c.nonLus || 0), 0)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ marginBottom: 20, fontSize: 26, display: 'flex', alignItems: 'center', gap: 10 }}>
        Messages
        {totalNonLus > 0 && (
          <span style={{
            background: '#ef4444', color: 'white', borderRadius: '50%',
            width: 26, height: 26, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700
          }}>
            {totalNonLus}
          </span>
        )}
      </h2>

      {/* Desktop layout */}
      <div className="messages-desktop" style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: 16,
        height: 'calc(100vh - 180px)',
        minHeight: 400
      }}>
        {/* Liste conversations */}
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid var(--border)',
          overflowY: 'auto', padding: 12
        }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--grey)' }}>CONVERSATIONS</p>
          {loading ? (
            <p style={{ color: 'var(--grey)', fontSize: 14 }}>Chargement...</p>
          ) : conversations.length === 0 ? (
            <p style={{ color: 'var(--grey)', fontSize: 14 }}>Aucune conversation</p>
          ) : conversations.map((c, i) => (
            <div
              key={i}
              onClick={() => ouvrirConv(c)}
              style={{
                padding: '12px 14px', borderRadius: 10,
                cursor: 'pointer', marginBottom: 6,
                background: convActive?.interlocuteur_id === c.interlocuteur_id &&
                  convActive?.service_id === c.service_id ? 'var(--primary-light)' : 'white',
                border: `1px solid ${convActive?.interlocuteur_id === c.interlocuteur_id &&
                  convActive?.service_id === c.service_id ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.interlocuteur_nom}</div>
                {c.nonLus > 0 && (
                  <span style={{
                    background: '#ef4444', color: 'white', borderRadius: '50%',
                    width: 20, height: 20, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 11, fontWeight: 700
                  }}>
                    {c.nonLus}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, margin: '2px 0' }}>{c.service_titre}</div>
              <div style={{ fontSize: 12, color: 'var(--grey)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.dernier_message}
              </div>
            </div>
          ))}
        </div>

        {/* Zone chat desktop */}
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {!convActive ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--grey)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p>Sélectionne une conversation</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                <strong>{convActive.interlocuteur_nom}</strong>
                <span style={{ color: 'var(--grey)', fontSize: 13, marginLeft: 8 }}>— {convActive.service_titre}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.length === 0 && (
                  <p style={{ color: 'var(--grey)', textAlign: 'center', marginTop: 40 }}>Commence la conversation !</p>
                )}
                {messages.map(m => (
                  <div key={m.id} style={{
                    alignSelf: m.expediteur_id === user.id ? 'flex-end' : 'flex-start',
                    background: m.expediteur_id === user.id ? 'var(--dark)' : 'var(--bg)',
                    color: m.expediteur_id === user.id ? 'white' : 'var(--dark)',
                    padding: '10px 16px', borderRadius: 16,
                    maxWidth: '72%', fontSize: 14, lineHeight: 1.5
                  }}>
                    {m.contenu}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <input
                  placeholder="Ton message..."
                  value={contenu}
                  onChange={e => setContenu(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && envoyerMessage()}
                  style={{
                    flex: 1, padding: '11px 16px', borderRadius: 24,
                    border: '1px solid var(--border)', fontSize: 14, background: 'var(--bg)'
                  }}
                />
                <button
                  onClick={envoyerMessage}
                  style={{
                    padding: '11px 22px', background: 'var(--primary)',
                    color: 'white', border: 'none', borderRadius: 24,
                    fontWeight: 700, fontSize: 14
                  }}
                >
                  Envoyer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="messages-mobile">

        {/* Vue liste mobile */}
        {vue === 'liste' && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--grey)' }}>CONVERSATIONS</p>
            {loading ? (
              <p style={{ color: 'var(--grey)', fontSize: 14 }}>Chargement...</p>
            ) : conversations.length === 0 ? (
              <p style={{ color: 'var(--grey)', fontSize: 14 }}>Aucune conversation</p>
            ) : conversations.map((c, i) => (
              <div
                key={i}
                onClick={() => ouvrirConv(c)}
                style={{
                  padding: '14px', borderRadius: 10,
                  cursor: 'pointer', marginBottom: 8,
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.interlocuteur_nom}</div>
                  {c.nonLus > 0 && (
                    <span style={{
                      background: '#ef4444', color: 'white', borderRadius: '50%',
                      width: 22, height: 22, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 12, fontWeight: 700
                    }}>
                      {c.nonLus}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, margin: '4px 0' }}>{c.service_titre}</div>
                <div style={{ fontSize: 13, color: 'var(--grey)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.dernier_message}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vue chat mobile */}
        {vue === 'chat' && convActive && (
          <div style={{
            background: 'white', borderRadius: 16,
            border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            height: 'calc(100vh - 200px)'
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setVue('liste')}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 0 }}
              >
                ←
              </button>
              <div>
                <strong style={{ fontSize: 15 }}>{convActive.interlocuteur_nom}</strong>
                <div style={{ color: 'var(--grey)', fontSize: 12 }}>{convActive.service_titre}</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.length === 0 && (
                <p style={{ color: 'var(--grey)', textAlign: 'center', marginTop: 40 }}>Commence la conversation !</p>
              )}
              {messages.map(m => (
                <div key={m.id} style={{
                  alignSelf: m.expediteur_id === user.id ? 'flex-end' : 'flex-start',
                  background: m.expediteur_id === user.id ? 'var(--dark)' : 'var(--bg)',
                  color: m.expediteur_id === user.id ? 'white' : 'var(--dark)',
                  padding: '10px 14px', borderRadius: 16,
                  maxWidth: '80%', fontSize: 14, lineHeight: 1.5
                }}>
                  {m.contenu}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input
                placeholder="Ton message..."
                value={contenu}
                onChange={e => setContenu(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && envoyerMessage()}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 24,
                  border: '1px solid var(--border)', fontSize: 14, background: 'var(--bg)'
                }}
              />
              <button
                onClick={envoyerMessage}
                style={{
                  padding: '10px 18px', background: 'var(--primary)',
                  color: 'white', border: 'none', borderRadius: 24,
                  fontWeight: 700, fontSize: 14
                }}
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .messages-desktop { display: grid; }
        .messages-mobile { display: none; }
        @media (max-width: 640px) {
          .messages-desktop { display: none !important; }
          .messages-mobile { display: block !important; }
        }
      `}</style>
    </div>
  )
}