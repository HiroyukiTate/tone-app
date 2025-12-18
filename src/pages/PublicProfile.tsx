import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// スタンプの定義（表示用）
const STAMPS: Record<string, string> = {
  fire: '🔥', cry: '😭', love: '🥰', think: '🤔', sleep: '😴', vomit: '🤮'
}

/**
 * 公開プロフィールページ
 * /u/:username でアクセス可能
 * ログイン不要で閲覧できる
 */
export function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (username) {
      fetchProfileAndLogs(username)
    }
  }, [username])

  // プロフィールと公開ログを取得
  const fetchProfileAndLogs = async (uname: string) => {
    setLoading(true)
    setError(null)

    // 1. usernameからプロフィールを取得
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', uname)
      .single()

    if (profileError || !profileData) {
      setError('ユーザーが見つかりませんでした')
      setLoading(false)
      return
    }

    setProfile(profileData)

    // 2. そのユーザーの公開ログを取得
    const { data: logsData, error: logsError } = await supabase
      .from('logs')
      .select('*, items(*)')
      .eq('user_id', profileData.id)
      .eq('is_public', true)  // 公開設定のみ
      .order('created_at', { ascending: false })

    if (logsError) {
      console.error('Error fetching logs:', logsError)
    } else {
      setLogs(logsData || [])
    }

    setLoading(false)
  }

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[430px] bg-white min-h-screen shadow-xl flex items-center justify-center">
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    )
  }

  // エラー（ユーザーが見つからない）
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div className="w-full max-w-[430px] bg-white min-h-screen shadow-xl flex flex-col items-center justify-center text-center p-4">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:underline">
            トップページへ戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen shadow-xl relative flex flex-col">
        
        {/* ヘッダー */}
        <header className="p-4 border-b sticky top-0 bg-white z-10">
          <Link to="/" className="text-gray-400 text-sm hover:text-blue-600">
            ← Tone
          </Link>
        </header>

        {/* プロフィールセクション */}
        <div className="p-6 text-center border-b bg-gradient-to-b from-blue-50 to-white">
          {/* アバター */}
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center text-3xl overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          {/* 表示名 */}
          <h1 className="text-xl font-bold text-gray-800">
            {profile.display_name || profile.username}
          </h1>
          {/* ユーザー名 */}
          <p className="text-sm text-gray-400">@{profile.username}</p>
          {/* 記録数 */}
          <p className="text-sm text-gray-500 mt-2">
            {logs.length} 件の記録
          </p>
        </div>

        {/* ログ一覧 */}
        <main className="p-4 flex-1 bg-gray-50">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10 text-gray-400">
              <div className="text-5xl mb-2">📭</div>
              <p>公開されている記録がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                  {/* 左側：スタンプ */}
                  <div className="flex flex-col items-center justify-center min-w-[3rem]">
                    <span className="text-4xl">{STAMPS[log.stamp] || '❓'}</span>
                  </div>

                  {/* 右側：詳細 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-800 truncate pr-2">
                        {log.items?.title || 'タイトル不明'}
                      </h3>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {log.items?.category || 'カテゴリなし'}
                    </p>

                    {log.memo && (
                      <div className="mt-3 bg-gray-50 p-2 rounded-lg text-sm text-gray-600">
                        {log.memo}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* フッター */}
        <footer className="p-4 text-center text-xs text-gray-400 border-t">
          Powered by <span className="font-bold text-gray-600">Tone</span>
        </footer>
      </div>
    </div>
  )
}
