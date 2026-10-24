export const handle = (action) => (req, res, next) => Promise.resolve(action(req, res, next)).catch(next);
