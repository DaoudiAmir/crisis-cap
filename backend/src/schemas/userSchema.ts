import * as yup from 'yup';
import { UserRole } from '../models/User';

export const createUserSchema = yup.object({
  body: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
      .required('Password is required'),
    role: yup
      .string()
      .oneOf(
        [
          UserRole.FIREFIGHTER,
          UserRole.TEAM_LEADER,
          UserRole.OFFICER,
          UserRole.REGIONAL_COORDINATOR,
          UserRole.LOGISTICS_MANAGER
        ],
        'Invalid role'
      )
      .required('Role is required'),
    badgeNumber: yup.string().required('Badge number is required'),
    station: yup.string().required('Station is required'),
    department: yup.string().required('Department is required'),
  }),
});

export const loginSchema = yup.object({
  body: yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required'),
  }),
});

export const updateUserSchema = yup.object({
  body: yup.object({
    firstName: yup.string(),
    lastName: yup.string(),
    email: yup.string().email('Invalid email'),
    role: yup.string().oneOf(
      [
        UserRole.FIREFIGHTER,
        UserRole.TEAM_LEADER,
        UserRole.OFFICER,
        UserRole.REGIONAL_COORDINATOR,
        UserRole.LOGISTICS_MANAGER
      ],
      'Invalid role'
    ),
    station: yup.string(),
    department: yup.string(),
    isActive: yup.boolean(),
  }),
});
