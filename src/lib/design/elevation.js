// src/lib/design/elevation.js
// Shadow tokens as JS strings. Used only for Framer Motion boxShadow
// animations (cannot interpolate CSS vars).

import { shadow } from './tokens';

export const elevation = {
  flat:  'none',
  e1:    shadow.e1,
  e2:    shadow.e2,
  e3:    shadow.e3,
  float: shadow.float,
};

export const elevateOnHover = {
  rest:  { boxShadow: elevation.e1 },
  hover: { boxShadow: elevation.e3 },
  press: { boxShadow: elevation.e1 },
};
