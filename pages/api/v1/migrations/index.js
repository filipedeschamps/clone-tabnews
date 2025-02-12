import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations();
  const statusCode = migratedMigrations.length > 0 ? 201 : 200;
  return response.status(statusCode).json(migratedMigrations);
}
async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}
