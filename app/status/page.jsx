import { UpdatedAt } from "./updated-at";

export async function fetchStatus() {
  const response = await fetch("http://localhost:3000/api/v1/status", {
    next: { revalidate: 5 },
  });
  const json = await response.json();

  return json;
}

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
