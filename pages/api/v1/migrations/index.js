import migrationRunner from "node-pg-migrate";
import path from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient,
    dir: path.join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: true,
    });
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner(defaultMigrationOptions);
    const statusCode = migratedMigrations.length > 0 ? 201 : 200;
    await dbClient.end();
    return response.status(statusCode).json(migratedMigrations);
  }

  await dbClient.end();
  return response.status(405).end();
}
