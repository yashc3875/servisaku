import { prisma } from '../db.js';
import { entityRouter } from './entityRouter.js';
export default entityRouter(prisma.refundRequest, { readonlyFields: ['id', 'createdAt'] });
