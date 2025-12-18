import { useState } from 'react'
import { supabase } from '../supabaseClient'

export const Auth = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Supabaseのマジックリンク送信機能
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // 本番ではここに公開URLを入れますが、開発中はローカルホストを指定
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      alert(error.message)
    } else {
      setMessage('ログイン用URLをメールで送信しました！確認してください。')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Tone にログイン</h1>
        
        {message ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm text-center">
            {message}
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? '送信中...' : 'ログインリンクを送る'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}