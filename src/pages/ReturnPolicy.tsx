import { RotateCcw } from 'lucide-react'
import { PolicyPageLayout } from '../components/PolicyPageLayout'

export function ReturnPolicy() {
  return <PolicyPageLayout slug="returns" fallbackTitle="Return & Exchange Policy" icon={<RotateCcw className="h-5 w-5" />} />
}
