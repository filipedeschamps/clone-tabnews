export async function fetchStatus() {
  const response = await fetch("http://localhost:3000/api/v1/status");
  const json = await response.json();

  return json;
}
