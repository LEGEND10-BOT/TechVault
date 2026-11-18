/*
 * Jobs store (UI state only — architecture §2.2). G1 ships the inert
 * indicator: no jobs exist until the G2 job runner, and this store stays
 * empty until then. G2 will populate it exclusively through the
 * `job:*` event subscriptions (event-driven — no polling, per the
 * architecture ground rules).
 */
export interface JobSummary {
	id: string;
	stage: string;
	progress: number | null;
}

let jobs = $state<JobSummary[]>([]);

/** Reactive list of active jobs (empty in G1 — inert indicator). */
export const jobsStore = {
	get current(): JobSummary[] {
		return jobs;
	}
};
