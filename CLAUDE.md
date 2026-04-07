# CLAUDE.md

## ビルド・テスト
npm run dev          # 開発サーバー
npm run build        # ビルド確認
npx vitest           # テスト実行
npx vitest --coverage # カバレッジ確認

## コードスタイル
- TypeScript strict mode
- ES modules (import/export)
- Tailwind CSS + shadcn/ui（カスタマイズ必須、デフォルト禁止）
- framer-motion でアニメーション
- 日本語UI（翻訳くさくない自然な日本語）

## アーキテクチャ
- Next.js App Router (src/app/)
- LocalStorage（MVP）

## デザインルール
- Apple/Notion/Linearレベルの品質
- グレースケール + ステータス色（emerald-500/red-500）
- rounded-2xl / rounded-full / shadow-sm / backdrop-blur-xl
- ダークモード必須（next-themes）

## 禁止事項
- グラデーション背景
- shadcn/uiデフォルトそのまま
- テストなしのコード
