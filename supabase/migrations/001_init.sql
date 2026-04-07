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
