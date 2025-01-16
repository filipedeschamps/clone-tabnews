import { UpdatedAt } from "./updated-at";
import { fetchStatus } from "./fetch-status.js";

async function Home() {
  const status = await fetchStatus();
  return (
    <>
      <h1>Status</h1>
      <p>
        Última atualização: <UpdatedAt fallbackData={status.updated_at} />
      </p>
      <h1>Database</h1>
      <p>Versão: {status.dependencies.database.version}</p>
      <p>Conexões abertas: {status.dependencies.database.opened_connections}</p>
      <p>Conexões máximas: {status.dependencies.database.max_connections}</p>
    </>
  );
}

export default Home;
