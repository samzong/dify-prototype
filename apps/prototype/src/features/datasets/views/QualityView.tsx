import type { DatasetItem } from '../fixtures/items'
import { QualitySections } from './quality/QualitySections'
import { useQualityController } from './quality/useQualityController'

export function QualityView({ item }: { item: DatasetItem }) {
  const controller = useQualityController(item)
  return <QualitySections controller={controller} />
}
