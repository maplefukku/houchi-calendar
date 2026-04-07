import { redirect } from 'next/navigation'

export default function LoginPage() {
  // MVPでは認証なし（LocalStorage使用）→ ホームにリダイレクト
  redirect('/')
}
