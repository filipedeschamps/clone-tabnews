import { version as uuidVersion } from "uuid";
import activation from "models/activation.js";
import user from "models/user.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/activations/[token_id]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent token", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/activations/256bc49a-132a-42e4-8334-998fd17ee71e",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
        status_code: 404,
      });
    });

    test("With expired token", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - activation.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser();
      const expiredActivationToken = await activation.create(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(
        `http://localhost:3000/api/v1/activations/${expiredActivationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
        status_code: 404,
      });
    });

    test("With already used token", async () => {
      const createdUser = await orchestrator.createUser();
      const activationToken = await activation.create(createdUser.id);

      const response1 = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response1.status).toBe(200);

      const response2 = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response2.status).toBe(404);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "NotFoundError",
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
        status_code: 404,
      });
    });

    test("With valid token", async () => {
      const createdUser = await orchestrator.createUser();
      const activationToken = await activation.create(createdUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: activationToken.id,
        used_at: responseBody.used_at,
        user_id: activationToken.user_id,
        expires_at: activationToken.expires_at.toISOString(),
        created_at: activationToken.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(uuidVersion(responseBody.user_id)).toBe(4);

      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(activation.EXPIRATION_IN_MILLISECONDS);

      const activatedUser = await user.findOneById(responseBody.user_id);
      expect(activatedUser.features).toEqual([
        "create:session",
        "read:session",
      ]);
    });

    test("With valid token but already activated user", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser);
      const activationToken = await activation.create(createdUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não pode mais utilizar tokens de ativação.",
        action: "Entre em contato com o suporte.",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With valid token, but already logged in user", async () => {
      const user1 = await orchestrator.createUser();
      await orchestrator.activateUser(user1);
      const user1SessionObject = await orchestrator.createSession(user1.id);

      const user2 = await orchestrator.createUser();
      const user2ActivationToken = await activation.create(user2.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/activations/${user2ActivationToken.id}`,
        {
          method: "PATCH",
          headers: {
            Cookie: `session_id=${user1SessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action:
          'Verifique se o seu usuário possui a feature "read:activation_token"',
        status_code: 403,
      });
    });
  });
});
