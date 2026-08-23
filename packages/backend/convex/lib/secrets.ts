import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export interface VapiSecrets {
  publicApiKey?: string;
  privateApiKey: string;
}

export async function getVapiSecrets(
  secretId?: string,
): Promise<VapiSecrets> {
  const id = secretId ?? process.env.VAPI_SECRET_ARN;
  if (!id) {
    throw new Error(
      "Vapi secret identifier not configured. Set VAPI_SECRET_ARN env var or pass a secretId.",
    );
  }

  const command = new GetSecretValueCommand({ SecretId: id });
  const response = await client.send(command);

  if (!response.SecretString) {
    throw new Error("Vapi secret is empty");
  }

  const parsed = JSON.parse(response.SecretString) as Record<string, string | undefined>;

  if (!parsed.privateApiKey) {
    throw new Error("Vapi secret is missing privateApiKey");
  }

  return {
    publicApiKey: parsed.publicApiKey,
    privateApiKey: parsed.privateApiKey,
  };
}
