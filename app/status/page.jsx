import { UpdatedAt } from "./updated-at";
import { fetchStatus } from "./fetch-status.js";

async function Home() {
  const status = await fetchStatus();
  return (
    <>
      <h1>Status</h1>
      <p>{JSON.stringify(status.dependencies, null, 2)}</p>
      <UpdatedAt fallbackData={status.updated_at} />
    </>
  );
}

export default Home;
