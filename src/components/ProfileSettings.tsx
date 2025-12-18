import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

interface ProfileSettingsProps {
  userId: string
  onClose: () => void
  onSaved: () => void
}

/**
 * プロフィール設定モーダル
 * username と display_name を編集できる
 */
export function ProfileSettings({ userId, onClose, onSaved }: ProfileSettingsProps) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 現在のプロフィールを取得
  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setUsername(data.username || '')
      setDisplayName(data.display_name || '')
    }
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error)
    }
    setLoading(false)
  }

  // プロフィールを保存
  const handleSave = async () => {
    setError(null)

    // バリデーション
    if (!username.trim()) {
      setError('ユーザー名を入力してください')
      return
    }
    // ユーザー名は英数字とアンダースコアのみ
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('ユーザー名は半角英数字と_のみ使用できます')
      return
    }
    if (username.length < 3) {
      setError('ユーザー名は3文字以上必要です')
      return
    }

    setSaving(true)

    // upsertでプロフィールを作成または更新
    const { error: saveError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: username.toLowerCase(),
        display_name: displayName || null,
        updated_at: new Date().toISOString()
      })

    if (saveError) {
      // ユニーク制約違反の場合
      if (saveError.code === '23505') {
        setError('このユーザー名は既に使用されています')
      } else {
        setError('保存に失敗しました')
        console.error('Save error:', saveError)
      }
      setSaving(false)
      return
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[380px]">
          <p className="text-center text-gray-400">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[380px]">
        <h2 className="text-lg font-bold text-gray-800 mb-4">プロフィール設定</h2>

        {/* ユーザー名 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            ユーザー名 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="text-gray-400 mr-1">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            公開URLに使用されます（半角英数字と_のみ）
          </p>
        </div>

        {/* 表示名 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            表示名
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="表示される名前"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 公開URL表示 */}
        {username && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">あなたの公開プロフィールURL</p>
            <p className="text-sm text-blue-600 font-mono break-all">
              {window.location.origin}/u/{username.toLowerCase()}
            </p>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
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
      </div>
    </div>
  )
}
