import type { FindingType, FindingSeverity } from '../types'

export const FINDING_SEVERITY: Record<FindingType, FindingSeverity> = {
  'redundant':            'warning',
  'very-similar':         'info',
  'outlier':              'warning',
  'no-neutral':           'warning',
  'no-accent':            'info',
  'no-hierarchy':         'warning',
  'double-accent':        'warning',
  'ramp-gap':             'info',
  'temperature-imbalance': 'info',
  'contrast-failure':     'critical',
}

export const FINDING_RULE_LABEL: Record<FindingType, 'rule' | 'heuristic' | 'inference' | 'validation'> = {
  'redundant':            'rule',
  'very-similar':         'rule',
  'outlier':              'heuristic',
  'no-neutral':           'rule',
  'no-accent':            'heuristic',
  'no-hierarchy':         'rule',
  'double-accent':        'heuristic',
  'ramp-gap':             'rule',
  'temperature-imbalance': 'heuristic',
  'contrast-failure':     'rule',
}
