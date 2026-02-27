import { ZodError } from 'zod';

export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      schema.parse(req[source]);
      next();

    } catch (error) {
      if (error instanceof ZodError) {
        if (error.errors === undefined) {
          error.errors = (msg => {
            try { return JSON.parse(msg) }
            catch { return [{ path: [], message: msg }] }
          })(error.message);
        }

        const errors = error.errors?.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });

        res.status(400).json({ error: 'Invalid data', errors });
      } else {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
      }
    }
  };
}