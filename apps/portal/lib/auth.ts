import "server-only";
import {
  getCustomerByClerkId,
  getOrCreateCustomerByClerkId,
  getProject,
  type ProjectRecord,
} from "@simplesight/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

/** The authenticated Clerk user id, or redirect to sign-in. */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

/** Operators are flagged via Clerk publicMetadata.role === "operator". */
export async function isOperator(): Promise<boolean> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "operator";
}

/** Gate operator-only actions. 404s for signed-in non-operators (don't reveal /admin). */
export async function requireOperator(): Promise<void> {
  await requireUserId();
  if (!(await isOperator())) notFound();
}

/** The signed-in user's customer row, created/linked on first use. */
export async function currentCustomer(): Promise<{ id: string; email: string }> {
  const userId = await requireUserId();
  const existing = await getCustomerByClerkId(userId);
  if (existing) return existing;
  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";
  return getOrCreateCustomerByClerkId(userId, email);
}

/**
 * Assert the signed-in user owns `projectId` (operators bypass). Returns the
 * project; 404s otherwise. Call at the top of every customer loader/action that
 * accepts a projectId from the client — this is the IDOR guard.
 */
export async function requireOwnedProject(projectId: string): Promise<ProjectRecord> {
  const userId = await requireUserId();
  const project = await getProject(projectId);
  if (!project) notFound();
  if (await isOperator()) return project;
  const customer = await getCustomerByClerkId(userId);
  if (!customer || project.customerId !== customer.id) notFound();
  return project;
}
