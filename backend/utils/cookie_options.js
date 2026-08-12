import { ACCESS_COOKIE_MAXAGE, NODE_ENV } from '../config/utils.js';
const defaultMaxAge = 3600000;

const maxAge =
    typeof ACCESS_COOKIE_MAXAGE === 'string' ? parseInt(ACCESS_COOKIE_MAXAGE, 10) : defaultMaxAge;

const validMaxAge = isNaN(maxAge) ? defaultMaxAge : maxAge;
export const cookieOptions = {
    httpOnly: true,
    sameSite: NODE_ENV === 'Production' ? 'lax' : 'none',
    secure: NODE_ENV === 'Production' ? true : false,
    maxAge: validMaxAge,
};
