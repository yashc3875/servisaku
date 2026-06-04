import { prisma } from '../db.js';
import { entityRouter } from './entityRouter.js';
export default entityRouter(prisma.chatMessage, { readonlyFields: ['id', 'createdAt'] });
