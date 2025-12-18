import { useState } from 'react'
import { supabase } from '../supabaseClient'

// スタンプの定義
const STAMPS: Record<string, string> = {
  fire: '🔥', cry: '😭', love: '🥰', think: '🤔', sleep: '😴', vomit: '🤮'
}

const STAMP_OPTIONS = [
  { key: 'fire', emoji: '🔥', label: '最高' },
  { key: 'cry', emoji: '😭', label: '泣いた' },
  { key: 'love', emoji: '🥰', label: '尊い' },
  { key: 'think', emoji: '🤔', label: '考えさせられる' },
  { key: 'sleep', emoji: '😴', label: '寝落ち' },
  { key: 'vomit', emoji: '🤮', label: '微妙' },
]

interface LogDetailProps {
  log: any
  onClose: () => void
  onUpdated: () => void
  onDeleted: () => void
}

/**
 * ログ詳細・編集モーダル
 * 記録の編集、削除、公開/非公開設定ができる
 */
export function LogDetail({ log, onClose, onUpdated, onDeleted }: LogDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [stamp, setStamp] = useState(log.stamp)
  const [memo, setMemo] = useState(log.memo || '')
  const [isPublic, setIsPublic] = useState(log.is_public)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 更新処理
  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('logs')
      .update({
        stamp,
        memo: memo || null,
        is_public: isPublic
      })
      .eq('id', log.id)

    if (error) {
      console.error('Update error:', error)
      alert('更新に失敗しました')
    } else {
      onUpdated()
      onClose()
    }
    setSaving(false)
  }

  // 削除処理
  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase
      .from('logs')
      .delete()
      .eq('id', log.id)

    if (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    } else {
      onDeleted()
      onClose()
    }
    setDeleting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[380px] max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="font-bold text-gray-800">
            {isEditing ? '記録を編集' : '記録の詳細'}
          </h2>
          <button onClick={onClose} className="text-gray-400 text-xl">×</button>
        </div>

        <div className="p-4">
          {/* 作品情報 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-800">{log.items?.title || 'タイトル不明'}</h3>
            <p className="text-xs text-gray-500">{log.items?.category || 'カテゴリなし'}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(log.created_at).toLocaleDateString('ja-JP')} に記録
            </p>
          </div>

          {/* スタンプ */}
          {isEditing ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">スタンプ</label>
              <div className="grid grid-cols-3 gap-2">
                {STAMP_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setStamp(option.key)}
                    className={`p-2 rounded-lg border text-center transition ${
                      stamp === option.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <p className="text-xs text-gray-500 mt-1">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 text-center">
              <span className="text-6xl">{STAMPS[log.stamp] || '❓'}</span>
            </div>
          )}

          {/* メモ */}
          {isEditing ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">メモ</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="感想を書く（任意）"
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            log.memo && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{log.memo}</p>
              </div>
            )
          )}

          {/* 公開設定 */}
          {isEditing ? (
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm text-gray-700">公開する</span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-8">
                オフにすると自分だけが見れます
              </p>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {isPublic ? '🌐 公開中' : '🔒 非公開'}
              </span>
            </div>
          )}

          {/* ボタン */}
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                編集する
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50"
              >
                削除する
              </button>
            </div>
          )}
        </div>

        {/* 削除確認モーダル */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-4 w-full max-w-[300px]">
              <p className="text-center mb-4 text-gray-700">この記録を削除しますか？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 border rounded-lg text-gray-600"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
                >
                  {deleting ? '削除中...' : '削除'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
