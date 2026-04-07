# PROMPT.md — 認証+DB実装（放置カレンダー）

## 背景
「放置カレンダー（ほうちカレンダー）」アプリの認証・DB基盤を構築する。
ユーザーが毎日「やった/やらなかった」を記録し、カレンダーで可視化するアプリ。

## 対象リポジトリ
`~/repos/houchi-calendar`

## 実装内容

### 1. Supabaseクライアント設定

#### src/lib/supabase/client.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### src/lib/supabase/server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### 2. 認証コールバック

#### src/app/auth/callback/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // エラー時はホームにリダイレクト
  return NextResponse.redirect(`${origin}`)
}
```

### 3. ミドルウェア

#### src/middleware.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッションをリフレッシュ
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証が必要なパスの保護（履歴など）
  const protectedPaths = ['/history', '/settings']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 4. DBスキーマ作成

Supabaseマイグレーションファイルを作成:
`supabase/migrations/001_init.sql`

```sql
-- ユーザーテーブル（Supabase Authと連携）
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  notification_time TIME DEFAULT '21:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日次状態テーブル
CREATE TABLE public.days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  did_action BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- インデックス
CREATE INDEX idx_days_user_id ON public.days(user_id);
CREATE INDEX idx_days_date ON public.days(date);
CREATE INDEX idx_days_user_date ON public.days(user_id, date);

-- RLS有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLSポリシー: days
CREATE POLICY "Users can view own days"
  ON public.days FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own days"
  ON public.days FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own days"
  ON public.days FOR UPDATE
  USING (auth.uid() = user_id);

-- トリガー: 新規ユーザー作成時にprofiles自動作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. 環境変数

#### .env.local (ローカル開発用)
```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
GLM_API_KEY=d4d5b41fda2845b48f8f55c4e3a1e3e9.TMSBR1aLRdCgSkEo
GLM_BASE_URL=https://api.z.ai/api/coding/paas/v4/
GLM_MODEL=glm-4.7
```

### 6. 型定義

#### src/types/index.ts
```typescript
export interface DayStatus {
  id: string;
  user_id: string;
  date: string;
  did_action: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  notification_time: string;
  created_at: string;
  updated_at: string;
}
```

## Supabaseプロジェクト作成手順

1. `supabase login` でログイン
2. `supabase projects create houchi-calendar --region ap-northeast-1` でプロジェクト作成
3. `supabase link --project-ref <project-ref>` でリンク
4. `supabase db push` でマイグレーション適用

## Vercel環境変数設定

デプロイ前に以下を設定:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add GLM_API_KEY
vercel env add GLM_BASE_URL
vercel env add GLM_MODEL
```

## 実行手順

1. 依存関係インストール: `npm install @supabase/supabase-js @supabase/ssr`
2. Supabaseプロジェクト作成: `supabase projects create`
3. マイグレーション作成・適用: `supabase migration new init` → `supabase db push`
4. 環境変数設定: `.env.local` 作成
5. テスト実行: `npm test`
6. ビルド確認: `npm run build`

## 注意事項

- LLM API: GLM API (GLM-4.7) のみ使用。OpenAI/GPT/OpenRouter禁止
- 環境変数: `GLM_API_KEY=d4d5b41fda2845b48f8f55c4e3a1e3e9.TMSBR1aLRdCgSkEo`
- Base URL: `https://api.z.ai/api/coding/paas/v4/`
- テストを書くこと
- TypeScript strict mode
- 日本語UI（翻訳くさくない自然な日本語）

## 完了条件

- [ ] Supabaseプロジェクト作成済み
- [ ] lib/supabase/client.ts 実装
- [ ] lib/supabase/server.ts 実装
- [ ] app/auth/callback/route.ts 実装
- [ ] DBスキーマ+RLS 適用済み
- [ ] middleware.ts 実装
- [ ] サインアップフロー検証
- [ ] Vercel環境変数設定
- [ ] テスト全件パス
- [ ] npm run build 成功
