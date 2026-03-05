// src/App.jsx  — QuickQuotesUSA full MVP
import { useState, useEffect, useRef } from 'react'
import {
  supabase, signUp, signIn, signOut, onAuthChange,
  getProfile, getJobs, getMyJobs, createJob, uploadJobPhotos,
  getBidsForJob, getMyBids, submitBid, updateBidStatus,
  getTopContractors, getPortfolio, getReviews,
  updateProfile, uploadAvatar,
} from './lib/supabase'

// ── THEME ────────────────────────────────────────────────────
const C = {
  sky: '#4BBFED', navy: '#1B2A6B', red: '#E84B4B',
  white: '#FFFFFF', off: '#F5F7FA', light: '#E8ECF2',
  mid: '#8A95A8', dark: '#2D3748',
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Barlow:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'Barlow',sans-serif;background:${C.off};color:${C.dark};min-height:100vh}
:root{--sky:${C.sky};--navy:${C.navy};--red:${C.red}}

/* NAV */
.nav{background:${C.navy};height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:100;box-shadow:0 2px 16px rgba(27,42,107,.35)}
.logo{display:flex;align-items:center;gap:6px;cursor:pointer}
.logo-lines{display:flex;flex-direction:column;gap:3px;margin-right:2px}
.logo-line{height:3px;border-radius:2px;background:${C.red}}
.logo-text{font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:900;font-style:italic;line-height:1}
.logo-quick{color:${C.sky}}
.logo-quotes{color:#fff}
.logo-usa{background:${C.red};color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:800;padding:2px 5px;border-radius:3px;letter-spacing:.5px;align-self:flex-start;margin-top:1px}
.nav-right{display:flex;align-items:center;gap:8px}
.nav-btn{padding:8px 16px;border-radius:7px;border:none;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;letter-spacing:.4px;transition:all .15s}
.nav-btn.ghost{background:transparent;color:rgba(255,255,255,.75)}
.nav-btn.ghost:hover{background:rgba(255,255,255,.12);color:#fff}
.nav-btn.sky{background:${C.sky};color:${C.navy}}
.nav-btn.sky:hover{background:#3AAFD9}
.nav-tab{padding:7px 14px;border-radius:7px;border:none;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;letter-spacing:.4px;transition:all .15s;background:transparent;color:rgba(255,255,255,.7)}
.nav-tab:hover{background:rgba(255,255,255,.1);color:#fff}
.nav-tab.active{background:${C.sky};color:${C.navy}}

/* LAYOUT */
.page{max-width:1100px;margin:0 auto;padding:28px 20px;width:100%}
.two-col{display:grid;grid-template-columns:1fr 300px;gap:22px}
.three-col{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.two-col-equal{display:grid;grid-template-columns:1fr 1fr;gap:16px}

/* CARDS */
.card{background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,.06);overflow:hidden}
.card-pad{padding:18px}
.card-header{background:${C.navy};color:#fff;padding:12px 18px;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:800;letter-spacing:.6px;text-transform:uppercase}

/* BUTTONS */
.btn{padding:10px 20px;border-radius:8px;border:none;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:15px;letter-spacing:.5px;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
.btn-sky{background:${C.sky};color:${C.navy}}
.btn-sky:hover{background:#3AAFD9;transform:translateY(-1px)}
.btn-navy{background:${C.navy};color:#fff}
.btn-navy:hover{background:#263a8a}
.btn-red{background:${C.red};color:#fff}
.btn-red:hover{background:#cc3d3d}
.btn-outline{background:transparent;color:${C.navy};border:2px solid ${C.navy}}
.btn-outline:hover{background:${C.navy};color:#fff}
.btn-ghost{background:transparent;color:${C.mid};border:2px solid ${C.light}}
.btn-ghost:hover{border-color:${C.mid};color:${C.dark}}
.btn-sm{padding:7px 14px;font-size:13px}
.btn-full{width:100%;justify-content:center}

/* FORMS */
.form-group{margin-bottom:16px}
.label{display:block;font-size:12px;font-weight:700;color:${C.dark};margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px}
.input{width:100%;padding:10px 13px;border:2px solid ${C.light};border-radius:8px;font-size:14px;font-family:'Barlow',sans-serif;outline:none;transition:border-color .15s;background:#fff}
.input:focus{border-color:${C.sky}}
.input-error{border-color:${C.red}!important}
textarea.input{resize:vertical;min-height:80px}
select.input{cursor:pointer}
.error-msg{color:${C.red};font-size:12px;margin-top:4px;font-weight:600}

/* BADGE / CHIPS */
.badge{padding:3px 10px;border-radius:20px;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;display:inline-block}
.badge-sky{background:rgba(75,191,237,.15);color:#1a7fa8}
.badge-navy{background:rgba(27,42,107,.1);color:${C.navy}}
.badge-green{background:#d1fae5;color:#065f46}
.badge-yellow{background:#fef3c7;color:#92400e}
.badge-red{background:#fee2e2;color:#991b1b}
.chip{padding:5px 12px;border-radius:20px;border:2px solid ${C.light};background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;font-family:'Barlow Condensed',sans-serif;letter-spacing:.3px}
.chip.active{border-color:${C.sky};background:${C.sky};color:${C.navy}}

/* AVATAR */
.avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:900;color:#fff;flex-shrink:0}

/* STARS */
.stars{color:#f6c544;letter-spacing:1px}
.stars-gray{color:#ddd;letter-spacing:1px}

/* JOB CARD */
.job-card{background:#fff;border-radius:14px;margin-bottom:16px;box-shadow:0 2px 12px rgba(0,0,0,.06);overflow:hidden;transition:box-shadow .2s}
.job-card:hover{box-shadow:0 5px 24px rgba(0,0,0,.12)}
.job-card-head{display:flex;align-items:center;gap:10px;padding:14px 16px 10px}
.job-imgs{display:grid;gap:2px}
.job-imgs.n1{grid-template-columns:1fr}
.job-imgs.n2{grid-template-columns:1fr 1fr}
.job-imgs.n3{grid-template-columns:2fr 1fr}
.job-img{width:100%;height:190px;object-fit:cover}
.img-placeholder{width:100%;height:190px;display:flex;align-items:center;justify-content:center;font-size:40px}
.job-body{padding:14px 16px}
.job-title{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:900;color:${C.navy};margin-bottom:4px}
.job-desc{font-size:14px;color:#555;line-height:1.55;margin-bottom:10px}
.meta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px}
.meta{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:${C.mid}}
.job-footer{display:flex;align-items:center;gap:8px;padding:0 16px 14px}
.bid-count{margin-left:auto;font-size:13px;font-weight:700;color:${C.sky}}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:200;padding:16px}
.modal{background:#fff;border-radius:16px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.modal-title{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:900;color:${C.navy};margin-bottom:20px;text-transform:uppercase}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:4px}

/* TOAST */
.toast{position:fixed;bottom:24px;right:24px;background:${C.navy};color:#fff;padding:13px 18px;border-radius:10px;font-weight:600;font-size:14px;z-index:400;display:flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(0,0,0,.2);animation:toastIn .3s ease}
@keyframes toastIn{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}

/* PROFILE COVER */
.cover{height:150px;border-radius:14px;position:relative;overflow:hidden;margin-bottom:0}
.cover-pattern{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,rgba(75,191,237,.09) 0px,rgba(75,191,237,.09) 1px,transparent 1px,transparent 20px)}
.profile-card{background:#fff;border-radius:14px;padding:18px;margin-top:-44px;position:relative;box-shadow:0 2px 12px rgba(0,0,0,.08)}
.profile-av-row{display:flex;align-items:flex-end;gap:14px;margin-bottom:12px}
.profile-stats{display:flex;gap:20px;border-top:1px solid ${C.light};padding-top:14px;margin-top:14px;flex-wrap:wrap}
.pstat-n{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:900;color:${C.navy}}
.pstat-l{font-size:11px;color:${C.mid};text-transform:uppercase;letter-spacing:.5px;font-weight:600}

/* AUTH PAGE */
.auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${C.navy} 0%,#243a9a 100%);padding:16px}
.auth-box{background:#fff;border-radius:20px;padding:36px;width:100%;max-width:420px;box-shadow:0 24px 64px rgba(0,0,0,.25)}
.auth-logo{display:flex;justify-content:center;align-items:center;gap:6px;margin-bottom:28px}
.auth-tabs{display:flex;gap:0;margin-bottom:24px;border-radius:8px;overflow:hidden;border:2px solid ${C.light}}
.auth-tab{flex:1;padding:10px;text-align:center;cursor:pointer;font-weight:700;font-size:14px;font-family:'Barlow Condensed',sans-serif;letter-spacing:.4px;transition:all .15s;border:none;background:transparent;color:${C.mid}}
.auth-tab.active{background:${C.navy};color:#fff}
.role-select{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.role-opt{padding:14px;border-radius:10px;border:2px solid ${C.light};cursor:pointer;text-align:center;transition:all .15s}
.role-opt.active{border-color:${C.sky};background:rgba(75,191,237,.08)}
.role-opt-icon{font-size:28px;display:block;margin-bottom:4px}
.role-opt-label{font-weight:700;font-size:14px;color:${C.navy}}
.role-opt-sub{font-size:11px;color:${C.mid}}

/* LOADING */
.spinner{width:40px;height:40px;border:3px solid ${C.light};border-top-color:${C.sky};border-radius:50%;animation:spin .7s linear infinite;margin:60px auto}
@keyframes spin{to{transform:rotate(360deg)}}

/* BID ROW */
.bid-row{background:#fff;border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;margin-bottom:10px;box-shadow:0 1px 8px rgba(0,0,0,.05)}

/* PRICING */
.price-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.07);transition:transform .2s}
.price-card:hover{transform:translateY(-4px)}
.price-card.featured{border:3px solid ${C.sky}}
.price-head{padding:22px;text-align:center;background:${C.off}}
.price-card.featured .price-head{background:${C.navy};color:#fff}
.price-tier{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:1px}
.price-amount{font-family:'Barlow Condensed',sans-serif;font-size:52px;font-weight:900;line-height:1;margin:8px 0 4px}
.price-body{padding:20px}
.price-feat{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:14px;font-weight:500}
.check{color:#22c55e;font-weight:700}

/* DIVIDER */
.divider{height:1px;background:${C.light};margin:16px 0}

/* SECTION TITLE */
.sec-title{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:900;color:${C.navy};text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px}

/* PHOTO UPLOAD */
.photo-drop{border:2px dashed ${C.light};border-radius:10px;padding:24px;text-align:center;cursor:pointer;transition:border-color .15s}
.photo-drop:hover{border-color:${C.sky}}
.photo-preview{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.photo-thumb{width:72px;height:72px;border-radius:8px;object-fit:cover;position:relative}
`

// ── HELPERS ──────────────────────────────────────────────────
const TRADES = ['Flooring','Roofing','Plumbing','HVAC','Electrical','Painting','General','Landscaping','Masonry','Carpentry']
const AVATAR_COLORS = ['#4BBFED','#E84B4B','#1B2A6B','#22C55E','#F59E0B','#8B5CF6','#EC4899']
const avatarColor = (str = '') => AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length]
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
const fmt$ = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—'
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'})
const TRADE_EMOJI = {Flooring:'🪵',Roofing:'🏚️',Plumbing:'🔧',HVAC:'❄️',Electrical:'⚡',Painting:'🎨',General:'🔨',Landscaping:'🌿',Masonry:'🧱',Carpentry:'🪚'}

function Stars({ rating = 0, size = 14 }) {
  const full = Math.round(rating)
  return (
    <span>
      <span className="stars" style={{ fontSize: size }}>{'★'.repeat(full)}</span>
      <span className="stars-gray" style={{ fontSize: size }}>{'★'.repeat(5 - full)}</span>
      <span style={{ fontSize: size - 2, color: C.mid, marginLeft: 4 }}>{Number(rating).toFixed(1)}</span>
    </span>
  )
}

function Avatar({ name, url, size = 40, color }) {
  const bg = color || avatarColor(name)
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: bg }}>
      {initials(name)}
    </div>
  )
}

function Toast({ msg }) {
  if (!msg) return null
  return <div className="toast">✅ {msg}</div>
}

// ── AUTH PAGE ────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('homeowner')
  const [form, setForm] = useState({ email: '', password: '', fullName: '', company: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handle() {
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        await signIn({ email: form.email, password: form.password })
      } else {
        await signUp({ email: form.email, password: form.password, fullName: form.fullName || form.email, role })
      }
      onAuth()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <style>{css}</style>
      <div className="auth-box">
        <div className="auth-logo">
          <div style={{ display:'flex',flexDirection:'column',gap:3,marginRight:4 }}>
            {[16,22,12].map((w,i) => <div key={i} style={{ height:3,width:w,borderRadius:2,background:C.red }} />)}
          </div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,fontStyle:'italic',lineHeight:1 }}>
            <span style={{ color:C.sky }}>QUICK</span>
            <span style={{ color:C.navy }}>QUOTES</span>
          </div>
          <div style={{ background:C.red,color:'#fff',fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:800,padding:'2px 5px',borderRadius:3,alignSelf:'flex-start',marginTop:2 }}>USA</div>
        </div>

        <div className="auth-tabs">
          {['login','signup'].map(m => (
            <button key={m} className={`auth-tab${mode===m?' active':''}`} onClick={() => setMode(m)}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {mode === 'signup' && (
          <>
            <div className="label" style={{ marginBottom: 8 }}>I am a…</div>
            <div className="role-select">
              {[
                { id:'homeowner', icon:'🏠', label:'Homeowner', sub:'Post jobs & get bids' },
                { id:'contractor', icon:'🔨', label:'Contractor', sub:'Find work & submit bids' },
              ].map(r => (
                <div key={r.id} className={`role-opt${role===r.id?' active':''}`} onClick={() => setRole(r.id)}>
                  <span className="role-opt-icon">{r.icon}</span>
                  <div className="role-opt-label">{r.label}</div>
                  <div className="role-opt-sub">{r.sub}</div>
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="label">Full Name {role==='contractor'&&'/ Company'}</label>
              <input className="input" placeholder="Your name" value={form.fullName} onChange={set('fullName')} />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
        </div>
        <div className="form-group">
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 12 }}>⚠️ {error}</div>}

        <button className="btn btn-navy btn-full" onClick={handle} disabled={loading}>
          {loading ? 'Loading…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>
      </div>
    </div>
  )
}

// ── JOB CARD ─────────────────────────────────────────────────
function JobCard({ job, onBid, isContractor, myBids = [] }) {
  const photos = job.photos || []
  const hasBid = myBids.some(b => b.job_id === job.id)
  const emoji = TRADE_EMOJI[job.trade] || '🔨'
  const n = photos.length || 1
  const cls = n >= 3 ? 'n3' : n === 2 ? 'n2' : 'n1'

  return (
    <div className="job-card">
      <div className="job-card-head">
        <Avatar name={job.owner?.full_name} url={job.owner?.avatar_url} size={42} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{job.owner?.full_name}</div>
          <div style={{ fontSize: 12, color: C.mid }}>📍 {job.location} · {fmtDate(job.created_at)}</div>
        </div>
        <span className="badge badge-navy">{job.trade}</span>
      </div>

      <div className={`job-imgs ${cls}`}>
        {photos.length > 0
          ? photos.slice(0,3).map((p,i) => <img key={i} className="job-img" src={p.url} alt="" />)
          : <div className="img-placeholder" style={{ background: `hsl(210,18%,90%)` }}>{emoji}</div>
        }
      </div>

      <div className="job-body">
        <div className="job-title">{job.title}</div>
        <div className="job-desc">{job.description}</div>
        <div className="meta-row">
          {job.area_size && <div className="meta">📐 {job.area_size}</div>}
          {(job.budget_min || job.budget_max) && (
            <div className="meta">💰 {fmt$(job.budget_min)} – {fmt$(job.budget_max)}</div>
          )}
          <div className="meta">📍 {job.location}</div>
        </div>
      </div>

      <div className="job-footer">
        {isContractor ? (
          hasBid
            ? <span className="badge badge-green">✓ Bid Submitted</span>
            : <button className="btn btn-sky btn-sm" onClick={() => onBid(job)}>Submit Bid</button>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={() => onBid(job)}>View Bids ({job.bid_count || 0})</button>
        )}
        <div className="bid-count">💬 {job.bid_count || 0} bids</div>
      </div>
    </div>
  )
}

// ── POST JOB MODAL ───────────────────────────────────────────
function PostJobModal({ profile, onClose, onPosted, showToast }) {
  const [form, setForm] = useState({ title:'', description:'', trade:'Flooring', location: profile.location||'', budgetMin:'', budgetMax:'', areaSize:'' })
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit() {
    if (!form.title || !form.description) return
    setLoading(true)
    try {
      const job = await createJob({
        ownerId: profile.id, title: form.title, description: form.description,
        trade: form.trade, location: form.location,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
        areaSize: form.areaSize,
      })
      if (files.length) await uploadJobPhotos(job.id, files)
      showToast('Job posted successfully!')
      onPosted()
      onClose()
    } catch (e) {
      showToast('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">📋 Post a Job</div>

        <div className="form-group">
          <label className="label">Job Title *</label>
          <input className="input" placeholder="e.g. Hardwood floor replacement – living room" value={form.title} onChange={set('title')} />
        </div>
        <div className="two-col-equal" style={{ gap: 12 }}>
          <div className="form-group">
            <label className="label">Trade *</label>
            <select className="input" value={form.trade} onChange={set('trade')}>
              {TRADES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Location *</label>
            <input className="input" placeholder="City, ST" value={form.location} onChange={set('location')} />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Description *</label>
          <textarea className="input" rows={3} placeholder="Describe the work needed, materials, timeline preferences…" value={form.description} onChange={set('description')} />
        </div>
        <div className="three-col" style={{ gap: 12 }}>
          <div className="form-group">
            <label className="label">Budget Min ($)</label>
            <input className="input" type="number" placeholder="2000" value={form.budgetMin} onChange={set('budgetMin')} />
          </div>
          <div className="form-group">
            <label className="label">Budget Max ($)</label>
            <input className="input" type="number" placeholder="5000" value={form.budgetMax} onChange={set('budgetMax')} />
          </div>
          <div className="form-group">
            <label className="label">Area Size</label>
            <input className="input" placeholder="400 sq ft" value={form.areaSize} onChange={set('areaSize')} />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Photos (optional)</label>
          <div className="photo-drop" onClick={() => fileRef.current.click()}>
            <div style={{ fontSize: 24 }}>📷</div>
            <div style={{ fontSize: 13, color: C.mid, marginTop: 4 }}>Click to add photos</div>
            <input ref={fileRef} type="file" multiple accept="image/*" style={{ display:'none' }}
              onChange={e => setFiles(Array.from(e.target.files))} />
          </div>
          {files.length > 0 && (
            <div className="photo-preview">
              {files.map((f,i) => (
                <img key={i} className="photo-thumb" src={URL.createObjectURL(f)} alt="" />
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-red" onClick={submit} disabled={loading}>
            {loading ? 'Posting…' : 'Post Job →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SUBMIT BID MODAL ─────────────────────────────────────────
function BidModal({ job, profile, onClose, onSubmitted, showToast }) {
  const [form, setForm] = useState({ amount:'', timeline:'', message:'' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit() {
    if (!form.amount) return
    setLoading(true)
    try {
      await submitBid({ jobId: job.id, contractorId: profile.id, amount: Number(form.amount), timeline: form.timeline, message: form.message })
      showToast('Bid submitted!')
      onSubmitted()
      onClose()
    } catch(e) {
      showToast('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">💼 Submit a Bid</div>
        <div style={{ background: C.off, borderRadius: 10, padding: 12, marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{job.title}</div>
          <div style={{ fontSize: 12, color: C.mid }}>📍 {job.location} · Budget: {fmt$(job.budget_min)} – {fmt$(job.budget_max)}</div>
        </div>
        <div className="form-group">
          <label className="label">Your Bid Amount ($) *</label>
          <input className="input" type="number" placeholder="4200" value={form.amount} onChange={set('amount')} />
        </div>
        <div className="form-group">
          <label className="label">Estimated Timeline</label>
          <input className="input" placeholder="e.g. 5 business days" value={form.timeline} onChange={set('timeline')} />
        </div>
        <div className="form-group">
          <label className="label">Message to Client</label>
          <textarea className="input" placeholder="Introduce yourself and describe your approach…" value={form.message} onChange={set('message')} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-red" onClick={submit} disabled={loading}>{loading ? 'Submitting…' : 'Submit Bid →'}</button>
        </div>
      </div>
    </div>
  )
}

// ── VIEW BIDS MODAL (homeowner) ──────────────────────────────
function ViewBidsModal({ job, onClose, showToast, onAccepted }) {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBidsForJob(job.id).then(setBids).finally(() => setLoading(false))
  }, [job.id])

  async function accept(bid) {
    try {
      await updateBidStatus(bid.id, 'accepted')
      showToast(`Accepted bid from ${bid.contractor?.full_name}!`)
      onAccepted?.()
      onClose()
    } catch(e) { showToast('Error: ' + e.message) }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">📬 Bids for "{job.title}"</div>
        {loading ? <div className="spinner" /> : bids.length === 0
          ? <p style={{ color: C.mid, textAlign:'center', padding: '24px 0' }}>No bids yet. Check back soon!</p>
          : bids.map(b => (
            <div key={b.id} className="bid-row" style={{ flexWrap:'wrap', gap: 10 }}>
              <Avatar name={b.contractor?.full_name || b.contractor?.company_name} url={b.contractor?.avatar_url} size={40} />
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{b.contractor?.company_name || b.contractor?.full_name}</div>
                <Stars rating={b.contractor?.rating} size={12} />
                {b.timeline && <div style={{ fontSize: 12, color: C.mid }}>⏱ {b.timeline}</div>}
                {b.message && <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{b.message}</div>}
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 24, color: C.sky }}>{fmt$(b.amount)}</div>
                {b.status === 'pending'
                  ? <button className="btn btn-sky btn-sm" style={{ marginTop: 4 }} onClick={() => accept(b)}>Accept</button>
                  : <span className="badge badge-green">✓ Accepted</span>
                }
              </div>
            </div>
          ))
        }
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── FEED TAB ─────────────────────────────────────────────────
function FeedTab({ profile, showToast }) {
  const [jobs, setJobs] = useState([])
  const [trade, setTrade] = useState('All')
  const [loading, setLoading] = useState(true)
  const [activeBidJob, setActiveBidJob] = useState(null)
  const [myBids, setMyBids] = useState([])
  const [showPost, setShowPost] = useState(false)
  const [topContractors, setTopContractors] = useState([])
  const isContractor = profile.role === 'contractor'

  const load = async () => {
    setLoading(true)
    try {
      const [j, tc] = await Promise.all([
        getJobs({ trade: trade === 'All' ? null : trade }),
        getTopContractors(null, 4),
      ])
      setJobs(j)
      setTopContractors(tc)
      if (isContractor) setMyBids(await getMyBids(profile.id))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [trade])

  return (
    <div className="two-col">
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
          <div className="sec-title">📋 Local Job Posts</div>
          {!isContractor && (
            <button className="btn btn-red btn-sm" onClick={() => setShowPost(true)}>+ Post a Job</button>
          )}
        </div>
        <div style={{ display:'flex', gap: 8, flexWrap:'wrap', marginBottom: 16 }}>
          {['All', ...TRADES.slice(0,7)].map(t => (
            <button key={t} className={`chip${trade===t?' active':''}`} onClick={() => setTrade(t)}>{t}</button>
          ))}
        </div>
        {loading ? <div className="spinner" />
          : jobs.length === 0
            ? <div style={{ textAlign:'center', padding:'40px 0', color: C.mid }}>No open jobs in this category yet.</div>
            : jobs.map(j => (
              <JobCard key={j.id} job={j} isContractor={isContractor} myBids={myBids}
                onBid={setActiveBidJob} />
            ))
        }
      </div>

      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">⭐ Top Contractors</div>
          <div className="card-pad">
            {topContractors.map((c,i) => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: i < topContractors.length-1 ? 14 : 0 }}>
                <Avatar name={c.company_name || c.full_name} url={c.avatar_url} size={38} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>{c.company_name || c.full_name}</div>
                  <Stars rating={c.rating} size={12} />
                  <div style={{ fontSize: 11, color: C.mid }}>{c.trade} · {c.review_count} reviews</div>
                </div>
              </div>
            ))}
            {topContractors.length === 0 && <p style={{ fontSize: 13, color: C.mid }}>Contractors will appear here once they sign up.</p>}
          </div>
        </div>
        <div className="card">
          <div className="card-header">⚡ Quick Stats</div>
          <div className="card-pad">
            {[['Open Jobs', jobs.length], ['Your Role', profile.role === 'contractor' ? 'Contractor' : 'Homeowner'], ['Location', profile.location || 'Not set']].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: C.mid }}>{l}</span>
                <span style={{ fontWeight: 700, color: C.navy }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPost && <PostJobModal profile={profile} onClose={() => setShowPost(false)} onPosted={load} showToast={showToast} />}
      {activeBidJob && (
        isContractor
          ? <BidModal job={activeBidJob} profile={profile} onClose={() => setActiveBidJob(null)} onSubmitted={load} showToast={showToast} />
          : <ViewBidsModal job={activeBidJob} onClose={() => setActiveBidJob(null)} showToast={showToast} onAccepted={load} />
      )}
    </div>
  )
}

// ── MY JOBS TAB (homeowner) ──────────────────────────────────
function MyJobsTab({ profile, showToast }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewBidsJob, setViewBidsJob] = useState(null)

  const load = () => getMyJobs(profile.id).then(setJobs).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="sec-title">📋 My Posted Jobs</div>
      {loading ? <div className="spinner" /> : jobs.length === 0
        ? <div style={{ textAlign:'center', padding:'40px 0', color: C.mid }}>You haven't posted any jobs yet. Go to the Feed to post one!</div>
        : jobs.map(j => (
          <div key={j.id} className="card" style={{ marginBottom: 14 }}>
            <div className="card-pad">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, color: C.navy }}>{j.title}</div>
                  <div style={{ fontSize: 13, color: C.mid }}>📍 {j.location} · {fmtDate(j.created_at)} · {j.trade}</div>
                </div>
                <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
                  <span className={`badge ${j.status === 'open' ? 'badge-green' : 'badge-navy'}`}>{j.status}</span>
                  <button className="btn btn-sky btn-sm" onClick={() => setViewBidsJob(j)}>View {j.bid_count||0} Bids</button>
                </div>
              </div>
              {j.budget_min && (
                <div style={{ fontSize: 13, color: C.mid, marginTop: 6 }}>Budget: {fmt$(j.budget_min)} – {fmt$(j.budget_max)}</div>
              )}
            </div>
          </div>
        ))
      }
      {viewBidsJob && <ViewBidsModal job={viewBidsJob} onClose={() => setViewBidsJob(null)} showToast={showToast} onAccepted={load} />}
    </div>
  )
}

// ── MY BIDS TAB (contractor) ─────────────────────────────────
function MyBidsTab({ profile }) {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getMyBids(profile.id).then(setBids).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? bids : bids.filter(b => b.status === filter)

  return (
    <div>
      <div className="sec-title">💼 My Submitted Bids</div>
      <div style={{ display:'flex', gap: 8, marginBottom: 16, flexWrap:'wrap' }}>
        {['all','pending','accepted','declined'].map(s => (
          <button key={s} className={`chip${filter===s?' active':''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <div className="spinner" /> : filtered.length === 0
        ? <div style={{ textAlign:'center', padding:'40px 0', color: C.mid }}>No bids in this category.</div>
        : filtered.map(b => (
          <div key={b.id} className="bid-row" style={{ flexWrap:'wrap' }}>
            <div style={{ fontSize: 28 }}>{TRADE_EMOJI[b.job?.trade] || '🔨'}</div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{b.job?.title}</div>
              <div style={{ fontSize: 12, color: C.mid }}>📍 {b.job?.location} · {fmtDate(b.created_at)}</div>
              {b.timeline && <div style={{ fontSize: 12, color: C.mid }}>⏱ {b.timeline}</div>}
            </div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 24, color: C.sky }}>{fmt$(b.amount)}</div>
            <span className={`badge ${b.status==='accepted'?'badge-green':b.status==='declined'?'badge-red':'badge-yellow'}`}>
              {b.status === 'accepted' ? '✓ Accepted' : b.status === 'declined' ? 'Declined' : 'Pending'}
            </span>
          </div>
        ))
      }
    </div>
  )
}

// ── PROFILE TAB ──────────────────────────────────────────────
function ProfileTab({ profile, onUpdate, showToast }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: profile.full_name||'', location: profile.location||'', phone: profile.phone||'', bio: profile.bio||'', company_name: profile.company_name||'', trade: profile.trade||'Flooring', license_no: profile.license_no||'' })
  const [loading, setLoading] = useState(false)
  const [portfolio, setPortfolio] = useState([])
  const [reviews, setReviews] = useState([])
  const fileRef = useRef()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const isContractor = profile.role === 'contractor'

  useEffect(() => {
    if (isContractor) {
      getPortfolio(profile.id).then(setPortfolio)
      getReviews(profile.id).then(setReviews)
    }
  }, [])

  async function save() {
    setLoading(true)
    try {
      const updated = await updateProfile(profile.id, form)
      onUpdate(updated)
      showToast('Profile updated!')
      setEditing(false)
    } catch(e) { showToast('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  const coverBg = isContractor
    ? `linear-gradient(135deg,${C.red},#b83535)`
    : `linear-gradient(135deg,${C.navy},#2A4BAF)`

  return (
    <div className={isContractor ? 'two-col' : ''}>
      <div>
        <div className="cover" style={{ background: coverBg }}><div className="cover-pattern" /></div>
        <div className="profile-card">
          <div className="profile-av-row">
            <Avatar name={profile.company_name || profile.full_name} url={profile.avatar_url} size={76}
              color={isContractor ? C.red : C.sky} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 900, color: C.navy }}>
                {profile.company_name || profile.full_name}
              </div>
              <div style={{ fontSize: 13, color: C.mid }}>
                {profile.location && `📍 ${profile.location}`}
                {isContractor && profile.trade && ` · ${profile.trade}`}
              </div>
              {isContractor && <Stars rating={profile.rating} />}
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>
          </div>
          {profile.bio && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.55, marginBottom: 12 }}>{profile.bio}</p>}
          <div className="profile-stats">
            {(isContractor
              ? [['Jobs Done', profile.jobs_completed||0], ['Reviews', profile.review_count||0], ['Rating', Number(profile.rating||0).toFixed(1)]]
              : [['Posted Jobs', '—'], ['Bids Received', '—'], ['Completed', '—']]
            ).map(([l,v]) => (
              <div key={l}><div className="pstat-n">{v}</div><div className="pstat-l">{l}</div></div>
            ))}
          </div>
        </div>

        {isContractor && portfolio.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header">📸 Portfolio</div>
            <div className="card-pad">
              <div className="three-col" style={{ gap: 8 }}>
                {portfolio.map((p,i) => (
                  <img key={i} src={p.url} alt={p.caption} style={{ width:'100%', height: 100, objectFit:'cover', borderRadius: 8 }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {isContractor && reviews.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header">💬 Reviews</div>
            <div className="card-pad">
              {reviews.map((r,i) => (
                <div key={i} style={{ background: C.off, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
                    <Avatar name={r.reviewer?.full_name} size={30} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.reviewer?.full_name}</div>
                      <Stars rating={r.rating} size={12} />
                    </div>
                    <div style={{ marginLeft:'auto', fontSize: 11, color: C.mid }}>{fmtDate(r.created_at)}</div>
                  </div>
                  {r.comment && <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{r.comment}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isContractor && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">⚡ Your Plan</div>
            <div className="card-pad" style={{ textAlign:'center' }}>
              <div style={{ background: C.sky, color: C.navy, borderRadius: 20, display:'inline-block', padding:'2px 12px', fontSize: 12, fontWeight: 800, marginBottom: 8, fontFamily:"'Barlow Condensed',sans-serif" }}>
                {(profile.plan||'starter').toUpperCase()}
              </div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: 40, fontWeight: 900, color: C.navy }}>
                {profile.plan === 'pro' ? '$5.99' : profile.plan === 'unlimited' ? '$9.99' : '$1.99'}
              </div>
              <div style={{ fontSize: 12, color: C.mid, marginBottom: 14 }}>per month</div>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 14 }}>
                {profile.bids_used||0} / {profile.plan === 'unlimited' ? '∞' : profile.bids_limit} bids used
              </div>
              <button className="btn btn-outline btn-full">Upgrade Plan</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header">📊 Ratings</div>
            <div className="card-pad">
              {[5,4,3,2,1].map(s => {
                const count = reviews.filter(r => r.rating === s).length
                const pct = reviews.length ? (count/reviews.length)*100 : 0
                return (
                  <div key={s} style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.mid, width: 30 }}>{s} ★</span>
                    <div style={{ flex:1, height: 8, background: C.light, borderRadius: 4 }}>
                      <div style={{ width:`${pct}%`, height: 8, background:'#F6C544', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, color: C.mid, width: 24, textAlign:'right' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">✏️ Edit Profile</div>
            {isContractor && (
              <>
                <div className="form-group">
                  <label className="label">Company Name</label>
                  <input className="input" value={form.company_name} onChange={set('company_name')} />
                </div>
                <div className="two-col-equal" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="label">Trade</label>
                    <select className="input" value={form.trade} onChange={set('trade')}>
                      {TRADES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">License #</label>
                    <input className="input" value={form.license_no} onChange={set('license_no')} />
                  </div>
                </div>
              </>
            )}
            <div className="form-group">
              <label className="label">Full Name</label>
              <input className="input" value={form.full_name} onChange={set('full_name')} />
            </div>
            <div className="two-col-equal" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="label">Location</label>
                <input className="input" placeholder="City, ST" value={form.location} onChange={set('location')} />
              </div>
              <div className="form-group">
                <label className="label">Phone</label>
                <input className="input" placeholder="(555) 000-0000" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Bio</label>
              <textarea className="input" placeholder="Tell people about yourself…" value={form.bio} onChange={set('bio')} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-navy" onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── PRICING TAB ──────────────────────────────────────────────
function PricingTab() {
  const plans = [
    { tier:'Starter', price:'$1.99', featured:false, bids:'10 bids / month', features:['Basic profile page','Email notifications','Standard listing','Job feed access'] },
    { tier:'Pro',     price:'$5.99', featured:true,  bids:'50 bids / month', features:['Featured profile badge','Push notifications','Priority listing','Analytics dashboard','Client messaging priority'] },
    { tier:'Unlimited', price:'$9.99', featured:false, bids:'Unlimited bids', features:['Top placement in search','Advanced analytics','Dedicated support','Early access to new features'] },
  ]
  return (
    <div>
      <div style={{ textAlign:'center', marginBottom: 28 }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: 34, fontWeight: 900, color: C.navy, textTransform:'uppercase' }}>Contractor Pricing Plans</div>
        <p style={{ color: C.mid, marginTop: 8, fontSize: 15 }}>Buy bids and grow your business. No hidden fees, cancel anytime.</p>
      </div>
      <div className="three-col">
        {plans.map(p => (
          <div key={p.tier} className={`price-card${p.featured?' featured':''}`}>
            <div className="price-head">
              {p.featured && <div style={{ background: C.sky, color: C.navy, borderRadius: 20, display:'inline-block', padding:'2px 12px', fontSize: 12, fontWeight: 800, marginBottom: 8, fontFamily:"'Barlow Condensed',sans-serif" }}>MOST POPULAR</div>}
              <div className="price-tier" style={{ color: p.featured ? '#fff' : C.navy }}>{p.tier}</div>
              <div className="price-amount" style={{ color: p.featured ? C.sky : C.navy }}>{p.price}</div>
              <div style={{ fontSize: 12, color: p.featured ? 'rgba(255,255,255,.6)' : C.mid }}>/month</div>
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: p.featured ? 'rgba(255,255,255,.85)' : C.dark }}>{p.bids}</div>
            </div>
            <div className="price-body">
              {p.features.map(f => <div key={f} className="price-feat"><span className="check">✓</span>{f}</div>)}
              <button className={`btn btn-full ${p.featured ? 'btn-sky' : 'btn-outline'}`} style={{ marginTop: 16 }}>
                Get {p.tier}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="two-col-equal" style={{ marginTop: 24, gap: 20 }}>
        <div className="card">
          <div className="card-pad">
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, color: C.navy, marginBottom: 10 }}>💰 5% Commission Model</div>
            <p style={{ fontSize: 14, color:'#555', lineHeight:1.6 }}>Alternatively, contractors pay a <strong>5% fee</strong> on each completed project. A $5,000 job = $250 to QuickQuotesUSA. Scales naturally with project size.</p>
          </div>
        </div>
        <div className="card">
          <div className="card-pad">
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, color: C.navy, marginBottom: 10 }}>🏦 In-House Financing <span className="badge badge-yellow" style={{ verticalAlign:'middle' }}>Coming Soon</span></div>
            <p style={{ fontSize: 14, color:'#555', lineHeight:1.6 }}>Clients will finance projects similar to Affirm. QuickQuotesUSA acts as a trusted 3rd-party to protect both clients and contractors.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ROOT APP ─────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('feed')
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    getSession().then(s => {
      setSession(s)
      if (s) getProfile(s.user.id).then(setProfile)
    })
    const { data: { subscription } } = onAuthChange(async s => {
      setSession(s)
      if (s) {
        const p = await getProfile(s.user.id)
        setProfile(p)
      } else {
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await signOut()
    setTab('feed')
  }

  if (session === undefined) return (
    <>
      <style>{css}</style>
      <div className="spinner" style={{ marginTop: 100 }} />
    </>
  )

  if (!session) return <AuthPage onAuth={() => {}} />

  const isContractor = profile?.role === 'contractor'
  const TABS = [
    { id:'feed', label:'📋 Feed' },
    ...(isContractor
      ? [{ id:'bids', label:'💼 My Bids' }]
      : [{ id:'myjobs', label:'📋 My Jobs' }]
    ),
    { id:'profile', label:'👤 Profile' },
    { id:'pricing', label:'💳 Pricing' },
  ]

  return (
    <div>
      <style>{css}</style>
      <nav className="nav">
        <div className="logo" onClick={() => setTab('feed')}>
          <div className="logo-lines">
            {[16,22,12].map((w,i) => <div key={i} className="logo-line" style={{ width: w }} />)}
          </div>
          <div className="logo-text"><span className="logo-quick">QUICK</span><span className="logo-quotes">QUOTES</span></div>
          <div className="logo-usa">USA</div>
        </div>
        <div className="nav-right">
          {TABS.map(t => (
            <button key={t.id} className={`nav-tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
          {profile && (
            <div style={{ display:'flex', alignItems:'center', gap: 8, marginLeft: 8 }}>
              <Avatar name={profile.company_name||profile.full_name} url={profile.avatar_url} size={32} color={isContractor ? C.red : C.sky} />
              <button className="nav-btn ghost" onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
      </nav>

      <div className="page">
        {!profile ? <div className="spinner" /> : (
          <>
            {tab === 'feed'    && <FeedTab    profile={profile} showToast={showToast} />}
            {tab === 'myjobs'  && <MyJobsTab  profile={profile} showToast={showToast} />}
            {tab === 'bids'    && <MyBidsTab  profile={profile} />}
            {tab === 'profile' && <ProfileTab profile={profile} onUpdate={setProfile} showToast={showToast} />}
            {tab === 'pricing' && <PricingTab />}
          </>
        )}
      </div>

      <Toast msg={toast} />
    </div>
  )
}
