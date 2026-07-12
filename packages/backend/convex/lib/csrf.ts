export async function validateCsrfToken(
  ctx: { db: any },
  token: string,
  organizationId: string,
): Promise<void> {
  const record = await ctx.db
    .query("csrfTokens")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();

  if (!record) throw new Error("Invalid CSRF token");
  if (record.organizationId !== organizationId) throw new Error("CSRF token does not match organization");
  if (Date.now() > record.expiresAt) throw new Error("CSRF token expired");

  // Single-use token - delete after validation
  await ctx.db.delete(record._id);
}
