import { useEffect, useState } from 'react'
import Filters from './components/Filters'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({})
  const [showForm, setShowForm] = useState(false)

  const fetchItems = async (params = {}) => {
    setLoading(true)
    setError('')
    try {
      const query = new URLSearchParams()
      if (params.q) query.set('q', params.q)
      if (params.rank) query.set('rank', params.rank)
      if (params.min_price) query.set('min_price', params.min_price)
      if (params.max_price) query.set('max_price', params.max_price)
      const res = await fetch(`${baseUrl}/api/accounts?${query.toString()}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems(filters)
  }, [JSON.stringify(filters)])

  const createOrder = async (accountId, payload) => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_id: accountId, ...payload })
    })
    if (!res.ok) throw new Error('Gagal membuat pesanan')
    return res.json()
  }

  const AddAccountForm = ({ onClose }) => {
    const [form, setForm] = useState({
      title: '', description: '', rank: 'Epic', price: '', hero_count: '', skin_count: '', login_method: 'Moonton', email_access: false, images: ''
    })
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState('')

    const handleSubmit = async (e) => {
      e.preventDefault()
      setSaving(true)
      setMsg('')
      try {
        const payload = {
          ...form,
          price: parseFloat(form.price || 0),
          hero_count: form.hero_count ? parseInt(form.hero_count) : undefined,
          skin_count: form.skin_count ? parseInt(form.skin_count) : undefined,
          images: form.images ? form.images.split(',').map(s => s.trim()) : []
        }
        const res = await fetch(`${baseUrl}/api/accounts`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Gagal menambah akun')
        await res.json()
        setMsg('✅ Akun berhasil ditambahkan')
        setForm({ title: '', description: '', rank: 'Epic', price: '', hero_count: '', skin_count: '', login_method: 'Moonton', email_access: false, images: '' })
        fetchItems(filters)
      } catch (err) {
        setMsg('❌ ' + err.message)
      } finally {
        setSaving(false)
      }
    }

    const inputCls = 'w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Tambah Akun</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className={inputCls} placeholder="Judul" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
            <select className={inputCls} value={form.rank} onChange={e=>setForm({...form,rank:e.target.value})}>
              {['Grandmaster','Epic','Legend','Mythic'].map(r=> <option key={r} value={r}>{r}</option>)}
            </select>
            <input className={inputCls} placeholder="Harga (IDR)" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required />
            <input className={inputCls} placeholder="Metode Login" value={form.login_method} onChange={e=>setForm({...form,login_method:e.target.value})} />
            <input className={inputCls} placeholder="Jumlah Hero" type="number" value={form.hero_count} onChange={e=>setForm({...form,hero_count:e.target.value})} />
            <input className={inputCls} placeholder="Jumlah Skin" type="number" value={form.skin_count} onChange={e=>setForm({...form,skin_count:e.target.value})} />
            <div className="sm:col-span-2">
              <textarea className={inputCls} placeholder="Deskripsi" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <input className={inputCls} placeholder="Gambar (pisahkan dengan koma)" value={form.images} onChange={e=>setForm({...form,images:e.target.value})} />
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.email_access} onChange={e=>setForm({...form,email_access:e.target.checked})} /> Termasuk akses email</label>

            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Batal</button>
              <button disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </form>
          {msg && <p className="text-sm">{msg}</p>}
        </div>
      </div>
    )
  }

  const handleBuy = async (item) => {
    const buyer_name = prompt('Nama Anda:')
    if (!buyer_name) return
    const whatsapp = prompt('Nomor WhatsApp:')
    if (!whatsapp) return
    try {
      const res = await createOrder(item.id, { buyer_name, whatsapp })
      alert('Pesanan dibuat! ID: ' + res.id)
      fetchItems(filters)
    } catch (e) {
      alert('Gagal: ' + e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur sticky top-0 z-10 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">MLBB Store</h1>
          <div className="flex gap-2">
            <a href="/test" className="px-4 py-2 border rounded-md">Cek Koneksi</a>
            <button onClick={()=>setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Tambah Akun</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <Filters onChange={setFilters} />

        {loading && <p>Memuat...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow border overflow-hidden flex flex-col">
              {item.images && item.images[0] ? (
                <img src={item.images[0]} alt={item.title} className="h-40 w-full object-cover"/>
              ) : (
                <div className="h-40 w-full bg-gray-200 flex items-center justify-center text-gray-500">Tidak ada gambar</div>
              )}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{item.description || '—'}</p>
                <div className="text-sm text-gray-700">Rank: <span className="font-medium">{item.rank}</span></div>
                <div className="text-sm text-gray-700">Hero: {item.hero_count ?? '-'} | Skin: {item.skin_count ?? '-'}</div>
                <div className="text-blue-700 font-bold text-lg mt-auto">Rp {Number(item.price).toLocaleString('id-ID')}</div>
                <button onClick={()=>handleBuy(item)} className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md">Beli via WA</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showForm && <AddAccountForm onClose={()=>setShowForm(false)} />}
    </div>
  )
}

export default App
