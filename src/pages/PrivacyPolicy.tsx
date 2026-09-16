import { Shield } from 'lucide-react'
import { PolicyPageLayout } from '../components/PolicyPageLayout'

export function PrivacyPolicy() {
  return <PolicyPageLayout slug="privacy" fallbackTitle="Privacy Policy" icon={<Shield className="h-5 w-5" />} />
}
