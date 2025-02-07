export enum InterventionEvents {
  INTERVENTION_CREATED = 'intervention:created',
  INTERVENTION_UPDATED = 'intervention:updated',
  INTERVENTION_STATUS_CHANGED = 'intervention:status_changed',
  INTERVENTION_RESOURCES_UPDATED = 'intervention:resources_updated',
  INTERVENTION_NOTE_ADDED = 'intervention:note_added',
  INTERVENTION_LOCATION_UPDATED = 'intervention:location_updated'
}

export enum ResourceEvents {
  // User events
  USER_AVAILABILITY_UPDATED = 'user:availability_updated',
  USER_LOCATION_UPDATED = 'user:location_updated',
  USER_TEAM_UPDATED = 'user:team_updated',
  USER_STATUS_CHANGED = 'user:status_changed',
  USER_ASSIGNED_TO_INTERVENTION = 'user:assigned_to_intervention',
  USER_REMOVED_FROM_INTERVENTION = 'user:removed_from_intervention',

  // Vehicle events
  VEHICLE_LOCATION_UPDATED = 'vehicle:location_updated',
  VEHICLE_STATUS_CHANGED = 'vehicle:status_changed',
  VEHICLE_ASSIGNED_TO_INTERVENTION = 'vehicle:assigned_to_intervention',
  VEHICLE_REMOVED_FROM_INTERVENTION = 'vehicle:removed_from_intervention',
  VEHICLE_MAINTENANCE_UPDATED = 'vehicle:maintenance_updated',
  VEHICLE_CREW_UPDATED = 'vehicle:crew_updated'
}

export enum AlertEvents {
  ALERT_CREATED = 'alert:created',
  ALERT_UPDATED = 'alert:updated',
  EMERGENCY_ALERT = 'alert:emergency',
  WEATHER_ALERT = 'alert:weather',
  SYSTEM_ALERT = 'alert:system'
}

export enum TeamEvents {
  TEAM_CREATED = 'team:created',
  TEAM_UPDATED = 'team:updated',
  TEAM_DELETED = 'team:deleted',
  TEAM_MEMBER_ADDED = 'team:member_added',
  TEAM_MEMBER_REMOVED = 'team:member_removed',
  TEAM_LEADER_CHANGED = 'team:leader_changed'
}

export enum StationEvents {
  STATION_CREATED = 'station:created',
  STATION_UPDATED = 'station:updated',
  STATION_STATUS_CHANGED = 'station:status_changed',
  STATION_RESOURCES_UPDATED = 'station:resources_updated'
}
