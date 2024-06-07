import retry from "async-retry";

function makeWebserverUrl(path) {
  return `http://localhost:3000${path}`;
}

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
    });

    async function fetchStatusPage() {
      const url = makeWebserverUrl("/api/v1/status");
      await fetch(url);
    }
  }
}

export default {
  makeWebserverUrl,
  waitForAllServices,
};
