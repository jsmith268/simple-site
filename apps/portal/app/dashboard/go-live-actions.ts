"use server";

import {
  getProject,
  listConnectionSteps,
  listDomains,
  setProjectStatus,
  unpublishSite,
} from "@simplesight/db";
import {
  buyDomain,
  connectCustomDomain,
  goLive,
  refundAndCancel,
  searchDomain,
} from "@simplesight/provisioning";

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "simplesight.localhost";

export async function loadGoLive(projectId: string) {
  const [project, domains, steps] = await Promise.all([
    getProject(projectId),
    listDomains(projectId),
    listConnectionSteps(projectId),
  ]);
  const subdomain = project?.username ? `${project.username}.${ROOT}` : null;
  const refundOpen =
    !!project?.refundDeadlineAt && new Date(project.refundDeadlineAt) > new Date();
  return { project: project ?? null, domains, steps, subdomain, refundOpen };
}

/** Go live on the free Simple Site subdomain. */
export async function goLiveSubdomainAction(projectId: string) {
  const project = await getProject(projectId);
  if (!project?.username) return { ok: false, error: "Reserve a username first." };
  const result = await goLive(projectId, `${project.username}.${ROOT}`, "subdomain");
  return { ok: result.live, ...result };
}

/** Attach a customer's existing domain; returns the DNS records to set. */
export async function connectDomainAction(projectId: string, domain: string) {
  const status = await connectCustomDomain(projectId, domain.trim().toLowerCase());
  return { ok: true, ...status };
}

/** After the customer sets DNS, verify + go live on the custom domain. */
export async function goLiveCustomAction(projectId: string, domain: string) {
  const result = await goLive(projectId, domain.trim().toLowerCase(), "custom");
  return { ok: result.live, ...result };
}

/** Search + buy a domain through us (Vercel Domains), then attach it. */
export async function buyDomainAction(projectId: string, domain: string) {
  const d = domain.trim().toLowerCase();
  const avail = await searchDomain(d);
  if (!avail.available) return { ok: false, error: "That domain isn't available." };
  const bought = await buyDomain(d);
  if (!bought.ok) return { ok: false, error: "Purchase failed." };
  const status = await connectCustomDomain(projectId, d);
  return { ok: true, priceUsd: avail.priceUsd, ...status };
}

/** 30-day money-back guarantee: refund, cancel hosting, unpublish, release. */
export async function refundAction(projectId: string) {
  const project = await getProject(projectId);
  if (!project) return { ok: false, error: "Project not found." };
  if (project.refundDeadlineAt && new Date(project.refundDeadlineAt) < new Date()) {
    return { ok: false, error: "The 30-day refund window has closed." };
  }
  await refundAndCancel({});
  await unpublishSite(projectId);
  await setProjectStatus(projectId, "refunded");
  return { ok: true };
}
