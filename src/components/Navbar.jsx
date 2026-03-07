import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [nonLus, setNonLus] = useState(0)

  useEffect(() => {
    if (!user) return
    compterNonLus()
    const sub = supabase
      .channel('navbar-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        compterNonLus()
      })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [user])

  async function compterNonLus() {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('destinataire_id', user.id)
      .eq('lu', false)
    setNonLus(count || 0)
  }

  async function handleDeconnexion() {
    await supabase.auth.signOut()
    navigate('/')
    setMenuOpen(false)
  }

  const lienStyle = {
    color: 'rgba(255,255,255,0.75)',
    padding: '9px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500
  }

  return (
    <nav style={{
      background: 'var(--dark)', padding: '0 32px', height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 24px rgba(0,0,0,0.2)',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }}>

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, background: 'var(--primary)',
          borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/>
          </svg>
        </div>
        <span style={{
          fontFamily: 'Unbounded, sans-serif', fontWeight: 900,
          fontSize: 17, color: 'white', letterSpacing: '-0.5px'
        }}>
          MON<span style={{ color: 'var(--primary)' }}>QUARTIER</span>
        </span>
      </Link>

      {/* Desktop menu */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-menu">

        <Link to="/comment-ca-marche" style={lienStyle}>
          Comment ça marche
        </Link>

        {user ? (
          <>
            <Link to="/nouveau" style={{
              background: 'var(--primary)', color: 'white',
              padding: '9px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600
            }}>
              + Poster
            </Link>

            <Link to="/messages" style={{
              ...lienStyle,
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              Messages
              {nonLus > 0 && (
                <span style={{
                  background: '#ef4444', color: 'white', borderRadius: '50%',
                  width: 20, height: 20, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 11, fontWeight: 700
                }}>
                  {nonLus > 9 ? '9+' : nonLus}
                </span>
              )}
            </Link>

           <Link to="/profil" style={lienStyle}>
              Mon profil
            </Link>
            <button
              onClick={toggle}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                padding: '9px 12px', borderRadius: 8, fontSize: 16
              }}
              title={dark ? 'Mode clair' : 'Mode sombre'}
            >
              {dark ? '☀️' : '🌙'}
            </button>

            <button
              onClick={handleDeconnexion}
              style={{
                background: 'var(--primary)', color: 'white',
                border: 'none', padding: '9px 18px',
                borderRadius: 8, fontSize: 14, fontWeight: 600
              }}
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/connexion" style={{
              background: 'var(--primary)', color: 'white',
              padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14
            }}>
              Connexion
            </Link>
          </>
        )}
      </div>

      {/* Burger mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="burger"
        style={{
          display: 'none', background: 'none',
          border: 'none', color: 'white', fontSize: 24, padding: 4
        }}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Menu mobile */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 68, left: 0, right: 0,
          background: 'var(--dark)', padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 4,
          borderTop: '1px solid rgba(255,255,255,0.08)', zIndex: 99
        }}>
          <Link to="/comment-ca-marche" onClick={() => setMenuOpen(false)} style={{ color: 'white', padding: '12px 0', fontSize: 15 }}>
            Comment ça marche
          </Link>
          {user ? (
            <>
              <Link to="/nouveau" onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 700, padding: '12px 0', fontSize: 15 }}>
                + Poster un service
              </Link>
              <Link to="/messages" onClick={() => setMenuOpen(false)} style={{ color: 'white', padding: '12px 0', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                Messages
                {nonLus > 0 && (
                  <span style={{
                    background: '#ef4444', color: 'white', borderRadius: '50%',
                    width: 20, height: 20, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 11, fontWeight: 700
                  }}>
                    {nonLus > 9 ? '9+' : nonLus}
                  </span>
                )}
              </Link>
              <Link to="/profil" onClick={() => setMenuOpen(false)} style={{ color: 'white', padding: '12px 0', fontSize: 15 }}>
                Mon profil
              </Link>
              <button
                onClick={handleDeconnexion}
                style={{
                  background: 'var(--primary)', color: 'white',
                  border: 'none', borderRadius: 8,
                  textAlign: 'left', padding: '12px 16px',
                  fontSize: 15, fontWeight: 600, marginTop: 4
                }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/connexion" onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 700, padding: '12px 0', fontSize: 15 }}>
              Connexion
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-menu { display: none !important; }
          .burger { display: block !important; }
        }
      `}</style>
    </nav>
  )
}