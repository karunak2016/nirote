import { Truck } from 'lucide-react'
import { PolicyPageLayout } from '../components/PolicyPageLayout'

export function ShippingPolicy() {
  return <PolicyPageLayout slug="shipping" fallbackTitle="Shipping Policy" icon={<Truck className="h-5 w-5" />} />
}
