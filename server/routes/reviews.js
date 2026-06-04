import { prisma } from '../db.js';
import { entityRouter } from './entityRouter.js';
export default entityRouter(prisma.review, { readonlyFields: ['id', 'createdAt'] });
