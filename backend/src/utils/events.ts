export enum InterventionEvents {
  INTERVENTION_CREATED = 'intervention:created',
  INTERVENTION_UPDATED = 'intervention:updated',
  INTERVENTION_STATUS_CHANGED = 'intervention:status_changed',
  RESOURCES_ASSIGNED = 'intervention:resources_assigned'
}

export enum ResourceEvents {
  RESOURCE_ASSIGNED = 'resource:assigned',
  RESOURCE_STATUS_CHANGED = 'resource:status_changed'
}

export enum AlertEvents {
  ALERT_CREATED = 'alert:created',
  ALERT_UPDATED = 'alert:updated'
}
