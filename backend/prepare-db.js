const fs = require('fs');
const path = require('path');

// Render sets RENDER=true in its build environment.
// We dynamically switch the Prisma provider to postgresql for production
// without breaking the local sqlite development setup.
if (process.env.RENDER) {
  const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema);
  console.log('Successfully updated Prisma schema for PostgreSQL on Render.');
} else {
  console.log('Not on Render. Keeping Prisma schema as is.');
}
