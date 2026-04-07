import { redirect } from 'next/navigation'

export default function SignupPage() {
  // MVPでは認証なし（LocalStorage使用）→ ホームにリダイレクト
  redirect('/')
}
