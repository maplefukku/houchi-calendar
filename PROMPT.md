# 放置カレンダー（houchi-calendar） - 実装プロンプト

## プロダクト概要
毎日Yes/Noで「放置」を見える化するカレンダーアプリ。

**ターゲット**: 21歳大学生
**機能**: Yes/No入力 + カレンダー表示
**特徴**: 入力10秒、視覚的フィードバック即座

---

## 技術スタック
- **Framework**: Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **UI Components**: shadcn/ui (カスタマイズ必須)
- **Animation**: framer-motion
- **Auth + DB**: Supabase
- **LLM**: GLM API (glm-4.7, OpenAI互換) — **OpenAI/GPT禁止**

---

## 画面構成（4画面）

### 1. ウェルカム (/welcome)
**目的**: プロダクトを理解させ、始めさせる

**コンポーネント**:
- ヒーロー見出し: 「放置した日、見えてる？」
- サブテキスト: 「毎日ひとつだけ答える。やったか、やらなかったか。」
- CTAボタン: 「始める」→ ローカルストレージに初回フラグ保存 → / に遷移

### 2. カレンダー（ホーム） (/)
**目的**: 月間の放置状況を可視化

**コンポーネント**:
- ヘッダー: 年月表示 + 設定アイコン
- 月間カレンダーグリッド
  - Yesの日 = 緑のドット
  - Noの日 = 赤のドット
  - 未記録 = グレーのドット
- 統計カード: 「今月の行動率 XX%」
- 記録ボタン: 「今日の記録」→ 記録シート表示

### 3. 記録シート（ボトムシート）
**目的**: 今日のYes/Noを記録

**コンポーネント**:
- 質問: 「今日、自分の未来のために何かやった？」
- Yesボタン（緑）: クリック → 緑ドットでカレンダーに反映
- Noボタン（赤）: クリック → 赤ドットでカレンダーに反映
- 完了フィードバック: 「記録しました」→ 自動で閉じる

### 4. 設定シート（ボトムシート）
**目的**: 通知時間のカスタマイズ

**コンポーネント**:
- 通知時間設定: デフォルト21:00
- 通知ON/OFFスイッチ

---

## API Routes実装

### GET /api/status
月間状態取得（?year=2026&month=4）

**Response**:
```json
{
  "days": [
    { "date": "2026-04-01", "did_action": true },
    { "date": "2026-04-02", "did_action": false }
  ]
}
```

### POST /api/status
日次状態登録

**Request**:
```json
{
  "date": "2026-04-07",
  "did_action": true
}
```

**Response**:
```json
{
  "success": true,
  "date": "2026-04-07",
  "did_action": true
}
```

### GET /api/trend
傾向分析（GLM API使用）

**Response**:
```json
{
  "summary": "今月は20日中15日（75%）行動しています。",
  "suggestions": [
    "週末は事前に「土曜にやること」を決めておくと良いかも"
  ]
}
```

---

## DB Schema (Supabase)

### profiles テーブル
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  notification_time TIME DEFAULT '21:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### days テーブル
```sql
CREATE TABLE public.days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  did_action BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

**RLS有効化**: ユーザーは自分のデータのみアクセス可能

---

## 環境変数

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key

GLM_API_KEY=d4d5b41fda2845b48f8f55c4e3a1e3e9.TMSBR1aLRdCgSkEo
GLM_BASE_URL=https://api.z.ai/api/coding/paas/v4/
GLM_MODEL=glm-4.7
```

---

## 実装手順（TDD厳守）

### Phase 1: プロジェクト初期化
1. shadcn/ui初期化: `npx shadcn@latest init`
2. 必要なコンポーネント追加: `npx shadcn@latest add button card`
3. framer-motion, lucide-react, next-themes, @supabase/supabase-js, @supabase/ssr インストール
4. vitest設定

### Phase 2: API実装
1. src/app/api/status/route.ts 作成
2. テスト作成: tests/api/status-route.test.ts
3. src/app/api/trend/route.ts 作成（GLM API使用）
4. テスト作成: tests/api/trend-route.test.ts

### Phase 3: Supabase設定
1. src/lib/supabase/client.ts 作成
2. src/lib/supabase/server.ts 作成
3. src/proxy.ts 作成（認証ミドルウェア）
4. supabase/migrations/001_init.sql 作成

### Phase 4: UI実装
1. src/app/page.tsx 実装（カレンダー表示）
2. src/app/welcome/page.tsx 実装（ウェルカム画面）
3. src/components/calendar-grid.tsx 実装
4. src/components/status-sheet.tsx 実装
5. テスト作成: tests/components/*.test.tsx

### Phase 5: 統合・確認
1. `npm run build` 成功確認
2. `npx vitest run --coverage` カバレッジ60%以上確認
3. TypeScriptエラーなし確認
4. Lintエラーなし確認

---

## DESIGN_SYSTEM.md準拠チェックリスト

### 禁止事項
- [ ] グラデーション背景使用禁止
- [ ] shadow-lg以上の影使用禁止
- [ ] border-border/50以外の濃いボーダー禁止
- [ ] 色を3色以上使用禁止（グレースケール + 緑/赤のみ）
- [ ] rounded-2xl / rounded-full以外の角丸禁止
- [ ] p-4未満のパディング禁止
- [ ] アイコンだけのボタン禁止
- [ ] 英語のまま残す禁止
- [ ] shadcn/uiデフォルトそのまま禁止

### 必須実装
- [ ] framer-motionアニメーション
- [ ] ボタンhover/active状態
- [ ] スケルトンUI
- [ ] ダークモード対応（next-themes）
- [ ] テスト作成（TDD）

---

## 完了条件
1. `npm run build` が成功
2. `npx vitest run` が全て成功
3. `npm run lint` がエラーなし
4. TypeScriptエラーなし
5. テストカバレッジ60%以上
6. 全4画面が実装され、画面遷移が動作する
7. Yes/No記録がカレンダーに反映される
8. DESIGN_SYSTEM.mdの禁止事項に違反していない

---

## 注意事項
- **OpenAI API / GPT は絶対に使わない。GLM APIのみ**
- **自分でコードを書かない。Claude Codeに委任**
- **テスト駆動開発（TDD）で実装**
- **1画面1意思決定を守る**
- **日本語UIは翻訳くさくない自然な表現**
- **MVPではLocalStorageを使用（Supabaseは設定のみ）**

---

## 背景と意図
このプロダクトは「若者から世界をよくする」という信念のもと開発している。
ターゲットは21歳大学生。「やろうと思ってるけどやってない」状態で困っている。
放置した期間が可視化され、「赤い日を見たくない」という動機で行動が変わることを検証する。
Apple/Notion/Linearレベルのデザイン品質で、人間が「使いたい」と思うプロダクトを作る。
