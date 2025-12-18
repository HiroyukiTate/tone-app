import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Auth } from './components/Auth'
import { SearchModal } from './components/SearchModal'
import { LogForm } from './components/LogForm'
import type { Session } from '@supabase/supabase-js'
import './App.css'

// スタンプの定義（表示用）
const STAMPS: Record<string, string> = {
  fire: '🔥', cry: '😭', love: '🥰', think: '🤔', sleep: '😴', vomit: '🤮'
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [logs, setLogs] = useState<any[]>([]) // 取得したログを入れる場所
  const [loadingLogs, setLoadingLogs] = useState(false)
  
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  // セッション管理
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchLogs(session.user.id) // ログイン済みならログ取得
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchLogs(session.user.id) // ログイン変化時も再取得
    })
    return () => subscription.unsubscribe()
  }, [])

  // ログを取得する関数
  const fetchLogs = async (userId: string) => {
    setLoadingLogs(true)
    const { data, error } = await supabase
      .from('logs')
      .select('*, items(*)') // itemsテーブルの情報も一緒に結合して取得！
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // 新しい順

    if (error) {
      console.error('Error fetching logs:', error)
    } else {
      setLogs(data || [])
    }
    setLoadingLogs(false)
  }

  // ★ここが抜けていました！アイテムが選ばれた時の処理
  const handleSelectItem = (item: any) => {
    setIsSearchOpen(false) // 検索窓を閉じて
    setSelectedItem(item)  // 記録フォームを開く
  }

  // 記録完了時の処理
  const handleLogSaved = () => {
    setSelectedItem(null)
    // リストを再取得して画面を更新
    if (session) fetchLogs(session.user.id)
  }

  if (!session) return <Auth />

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[430px] bg-white min-h-screen shadow-xl relative flex flex-col">
        
        {/* ヘッダー */}
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Tone</h1>
          <button onClick={() => supabase.auth.signOut()} className="text-xs text-gray-500 hover:text-red-500">ログアウト</button>
        </header>

        {/* メインコンテンツ（リスト表示） */}
        <main className="p-4 flex-1 pb-20 bg-gray-50">
          
          {loadingLogs ? (
            <p className="text-center text-gray-400 mt-10">読み込み中...</p>
          ) : logs.length === 0 ? (
            // データが0件のときのエンプティステート
            <div className="flex flex-col items-center justify-center mt-20 text-gray-400 space-y-4">
              <div className="text-6xl">📭</div>
              <p>まだ記録がありません。<br/>下のボタンから追加してみましょう！</p>
            </div>
          ) : (
            // データがあるときのリスト表示
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                  {/* 左側：スタンプをドーンと表示 */}
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

        {/* フッターナビゲーション */}
        <nav className="fixed bottom-0 w-full max-w-[430px] bg-white border-t py-3 flex justify-around items-center text-xs text-gray-400 z-40">
          <span className="text-blue-600 font-bold">ホーム</span>
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transform active:scale-95 transition"
          >
            <span className="text-2xl font-bold">＋</span>
          </button>
          <span>設定</span>
        </nav>

        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)}
          onSelectItem={handleSelectItem}
        />

        {selectedItem && (
          <LogForm 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)}
            onSaved={handleLogSaved}
          />
        )}

      </div>
    </div>
  )
}

export default App