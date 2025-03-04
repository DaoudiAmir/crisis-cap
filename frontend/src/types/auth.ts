export enum UserRole {
  FIREFIGHTER = 'sapeur-pompier',
  TEAM_LEADER = 'chef-agres',
  OFFICER = 'officier',
  REGIONAL_COORDINATOR = 'coordinateur-regional',
  LOGISTICS_MANAGER = 'logistic-officer'
}

export enum UserStatus {
  AVAILABLE = 'available',
  ON_DUTY = 'on_duty',
  ON_BREAK = 'on_break',
  OFF_DUTY = 'off_duty',
  ON_LEAVE = 'on_leave'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  badgeNumber: string;
  department: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  badgeNumber: string;
  department: string;
  station: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  user: User;
}
