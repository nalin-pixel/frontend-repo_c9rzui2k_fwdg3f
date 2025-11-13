import { useState, useEffect } from 'react'

export default function Filters({ onChange }) {
  const [q, setQ] = useState('')
  const [rank, setRank] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ q, rank, min_price: minPrice, max_price: maxPrice })
    }, 400)
    return () => clearTimeout(handler)
  }, [q, rank, minPrice, maxPrice])

  return (
    <div className="w-full bg-white/70 backdrop-blur border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Cari akun..."
        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={rank}
        onChange={e => setRank(e.target.value)}
        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Semua Rank</option>
        {['Grandmaster','Epic','Legend','Mythic'].map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        value={minPrice}
        onChange={e => setMinPrice(e.target.value)}
        placeholder="Harga min (IDR)"
        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="number"
        min={0}
        value={maxPrice}
        onChange={e => setMaxPrice(e.target.value)}
        placeholder="Harga max (IDR)"
        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
