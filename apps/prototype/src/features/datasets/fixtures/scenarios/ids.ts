export const PROTOTYPE_TENANT_ID = 'tenant-prototype'

export const PROTOTYPE_SPACE_IDS = {
  supportHandbook: 'a1000001-0001-4001-8001-000000000001',
  releaseNotes: 'a1000002-0002-4002-8002-000000000002',
  docsCrawl: 'a1000003-0003-4003-8003-000000000003',
  salesDeck: 'a1000004-0004-4004-8004-000000000004',
  partnerApi: 'a1000005-0005-4005-8005-000000000005',
} as const

export const PROTOTYPE_DOCUMENT_IDS = {
  refundPolicy: 'b2000001-0001-4001-8001-000000000001',
  ssoEnterprise: 'b2000002-0002-4002-8002-000000000002',
  pricingLegacy: 'b2000003-0003-4003-8003-000000000003',
  escalationMatrix: 'b2000004-0004-4004-8004-000000000004',
} as const

export const PROTOTYPE_TRACE_IDS = {
  partialRefund: '018f0d60-7a49-7cc2-9c1b-5b36f18f1024',
  ssoRevoke: '018f0d60-7a49-7cc2-9c1b-5b36f18f1019',
  conflictPricing: '018f0d60-7a49-7cc2-9c1b-5b36f18f1030',
} as const

export const PROTOTYPE_JOB_IDS = {
  refundReindex: 'job-refund-reindex-001',
  bulkUpload: 'bulk-upload-001',
  failedCompile: 'job-failed-compile-001',
} as const

export function isoAt(offsetMs = 0) {
  return new Date(Date.now() - offsetMs).toISOString()
}

export function epochAt(offsetMs = 0) {
  return Date.now() - offsetMs
}
