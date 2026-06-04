import { prisma } from '../db.js';
import { entityRouter } from './entityRouter.js';
export default entityRouter(prisma.user, { readonlyFields: ['id', 'createdAt', 'passwordHash'] });
