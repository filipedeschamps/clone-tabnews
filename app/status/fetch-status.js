export async function fetchStatus() {
  const response = await fetch("http://localhost:3000/api/v1/status", {
    next: { revalidate: 5 },
  });
  const json = await response.json();

  return json;
}
