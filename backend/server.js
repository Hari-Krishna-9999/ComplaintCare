const app = require('./app');
const connectDB = require('./src/config/db');
const { port } = require('./src/config/env');

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch((err) => {
  console.error('Server startup failed:', err.message);
  process.exit(1);
});
