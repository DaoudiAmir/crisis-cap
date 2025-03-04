import config from './config';

export const jwt = {
  secret: config.jwtSecret,
  expiresIn: config.jwtExpiresIn
};

export { config };
export default { jwt, config };
