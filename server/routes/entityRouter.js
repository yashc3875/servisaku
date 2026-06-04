/**
 * Generic entity router factory.
 * Produces GET /  GET /:id  POST /  PATCH /:id  DELETE /:id
 * with optional auth and filtering.
 */
import { Router } from 'express';

export function entityRouter(model, options = {}) {
  const { auth, readonlyFields = [], mapIn, mapOut } = options;
  const router = Router();

  if (auth) router.use(auth);

  // GET / — list with optional query filters
  router.get('/', async (req, res, next) => {
    try {
      const where = buildWhere(req.query);
      const orderBy = req.query._orderBy ? { [req.query._orderBy]: 'asc' } : { createdAt: 'desc' };
      const take = req.query._limit ? Number(req.query._limit) : undefined;
      const items = await model.findMany({ where, orderBy, take });
      res.json(mapOut ? items.map(mapOut) : items);
    } catch (err) { next(err); }
  });

  // GET /:id
  router.get('/:id', async (req, res, next) => {
    try {
      const item = await model.findUnique({ where: { id: req.params.id } });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(mapOut ? mapOut(item) : item);
    } catch (err) { next(err); }
  });

  // POST /
  router.post('/', async (req, res, next) => {
    try {
      const data = strip(mapIn ? mapIn(req.body) : req.body, readonlyFields);
      const item = await model.create({ data });
      res.status(201).json(mapOut ? mapOut(item) : item);
    } catch (err) { next(err); }
  });

  // PATCH /:id
  router.patch('/:id', async (req, res, next) => {
    try {
      const data = strip(mapIn ? mapIn(req.body) : req.body, readonlyFields);
      const item = await model.update({ where: { id: req.params.id }, data });
      res.json(mapOut ? mapOut(item) : item);
    } catch (err) { next(err); }
  });

  // DELETE /:id
  router.delete('/:id', async (req, res, next) => {
    try {
      await model.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch (err) { next(err); }
  });

  return router;
}

// Build Prisma where clause from ?key=value query params (skip _ prefixed)
function buildWhere(query) {
  const where = {};
  for (const [k, v] of Object.entries(query)) {
    if (k.startsWith('_')) continue;
    if (v === 'true') where[k] = true;
    else if (v === 'false') where[k] = false;
    else where[k] = v;
  }
  return where;
}

function strip(obj, fields) {
  const copy = { ...obj };
  for (const f of fields) delete copy[f];
  return copy;
}
