import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Search, Plus, X } from 'lucide-react'

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelectItem: (item: any) => void // アイテムを選んだ時の処理（後で実装）
}

export const SearchModal = ({ isOpen, onClose, onSelectItem }: SearchModalProps) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false) // 検索を実行したかどうか

  // 1. Supabaseからアイテムを検索する関数
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    // itemsテーブルから、タイトルが部分一致するものを探す
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .ilike('title', `%${query}%`) // ilike = 大文字小文字を区別しない部分一致
      .limit(10)

    if (error) {
      console.error(error)
      alert('検索中にエラーが発生しました')
    } else {
      setResults(data || [])
    }
    setLoading(false)
  }

  // 2. まだ誰も登録していないアイテムを新規作成する関数
  const handleCreateNew = async () => {
    const title = window.prompt('作品の正式名称を入力してください', query)
    if (!title) return

    // itemsテーブルに新規追加
    const { data, error } = await supabase
      .from('items')
      .insert([{ title: title, category: 'other' }]) // とりあえずカテゴリは仮
      .select()
      .single()

    if (error) {
      console.error(error)
      alert('作成に失敗しました')
    } else {
      // 作成できたら、それを選んだことにして親画面に渡す
      onSelectItem(data)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-2xl sm:rounded-2xl shadow-2xl h-[80vh] flex flex-col overflow-hidden animate-slide-up">
        
        {/* ヘッダー: 閉じるボタン */}
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="font-bold text-lg">作品を記録する</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* 検索バー */}
        <div className="p-4 bg-gray-50">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              placeholder="作品名を入力..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <Search className="absolute left-3 text-gray-400" size={20} />
            <button 
              type="submit" 
              className="absolute right-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold"
            >
              検索
            </button>
          </form>
        </div>

        {/* 結果リスト */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && <p className="text-center text-gray-400 mt-4">検索中...</p>}

          {/* 検索結果 */}
          {!loading && results.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="w-full text-left p-3 bg-white border rounded-xl hover:bg-blue-50 transition flex items-center gap-3"
            >
              {/* 画像があれば表示、なければダミー */}
              <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0 object-cover" />
              <div>
                <p className="font-bold text-gray-800 line-clamp-1">{item.title}</p>
                <p className="text-xs text-gray-500">{item.category || 'カテゴリ未設定'}</p>
              </div>
            </button>
          ))}

          {/* 検索後、結果の下に「新規作成」ボタンを表示 */}
          {!loading && searched && query.trim() && (
            <button
              onClick={handleCreateNew}
              className="w-full text-left p-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-100 transition flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                <Plus size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-blue-700">「{query}」を新規作成</p>
                <p className="text-xs text-blue-500">見つからない場合はこちらから登録</p>
              </div>
            </button>
          )}

          {/* 検索前のメッセージ */}
          {!loading && !searched && (
            <div className="text-center mt-8 text-gray-400">
              <p>作品名を入力して検索してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}