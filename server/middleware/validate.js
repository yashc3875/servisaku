// zod request validation middleware.
// Parsed/coerced data replaces req.body so handlers only ever see validated input.
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`),
      });
    }
    req.body = result.data;
    next();
  };
}
