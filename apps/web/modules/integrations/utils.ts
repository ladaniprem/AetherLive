import {
  HTML_SCRIPT,
  type IntegrationId,
  JAVASCRIPT_SCRIPT,
  NEXTJS_SCRIPT,
  REACT_SCRIPT,
} from "./constants";

const SNIPPETS: Record<IntegrationId, string> = {
  html: HTML_SCRIPT,
  react: REACT_SCRIPT,
  nextjs: NEXTJS_SCRIPT,
  javascript: JAVASCRIPT_SCRIPT,
};

export const createScript = (
  integrationId: IntegrationId,
  organizationId: string,
) => {
  const snippet = SNIPPETS[integrationId];
  return snippet ? snippet.replace(/{{ORGANIZATION_ID}}/g, organizationId) : "";
};
