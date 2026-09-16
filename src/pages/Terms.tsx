import { FileText } from 'lucide-react'
import { PolicyPageLayout } from '../components/PolicyPageLayout'

export function Terms() {
  return <PolicyPageLayout slug="terms" fallbackTitle="Terms & Conditions" icon={<FileText className="h-5 w-5" />} />
}
