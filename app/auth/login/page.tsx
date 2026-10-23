import { AuthForm } from '@/components/auth-form'
import { SiteHeader } from '@/components/site-header'

export const metadata = { title: 'Sign in · DriveFlix' }

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex justify-center px-4 py-16">
        <AuthForm mode="login" />
      </main>
    </>
  )
}
