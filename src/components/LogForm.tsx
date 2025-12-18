import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { X, Send } from 'lucide-react'

type LogFormProps = {
  item: any // 選択された作品データ
  onClose: () => void
  onSaved: () => void // 保存完了時の処理
}

// 評価用スタンプの定義（IDと絵文字）
const STAMPS = [
  { id: 'fire', icon: '🔥', label: '最高' },
  { id: 'cry', icon: '😭', label: '泣いた' },
  { id: 'love', icon: '🥰', label: '尊い' },
  { id: 'think', icon: '🤔', label: '考えさせられる' },
  { id: 'sleep', icon: '😴', label: '寝落ち' },
  { id: 'vomit', icon: '🤮', label: '微妙' },
]

export const LogForm = ({ item, onClose, onSaved }: LogFormProps) => {
  const [stamp, setStamp] = useState('fire') // デフォルト
  const [memo, setMemo] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!item) return
    setLoading(true)

    // 現在のユーザーIDを取得
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // logsテーブルに保存
    const { error } = await supabase.from('logs').insert({
      user_id: session.user.id,
      item_id: item.id,
      stamp: stamp,
      memo: memo,
      is_public: isPublic
    })

    setLoading(false)

    if (error) {
      console.error(error)
      alert('保存に失敗しました')
    } else {
      onSaved() // 親コンポーネントに完了を伝える
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-[430px] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* ヘッダー */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800 truncate pr-4">
            「{item.title}」を記録
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* 1. スタンプ選択 */}
          <div>
            <p className="text-sm font-bold text-gray-500 mb-3">スタンプを選択</p>
            <div className="flex justify-between">
              {STAMPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStamp(s.id)}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    stamp === s.id ? 'transform scale-125' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <span className="text-3xl">{s.icon}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2 font-bold">
              {STAMPS.find(s => s.id === stamp)?.label}
            </p>
          </div>

          {/* 2. メモ入力 */}
          <div>
            <p className="text-sm font-bold text-gray-500 mb-2">一言メモ</p>
            <textarea
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
              placeholder="感想を入力（任意）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {/* 3. 公開設定 & 保存ボタン */}
          <div className="flex items-center justify-between pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 accent-blue-600"
              />
              <span className="text-sm text-gray-600">公開する</span>
            </label>

            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
            >
              <Send size={18} />
              {loading ? '保存中...' : '記録する'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}