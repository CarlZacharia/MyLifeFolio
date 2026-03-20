/** Safely extract a string from Record<string, unknown> */
export const str = (val: unknown, fallback = 'N/A'): string => {
  if (val === null || val === undefined || val === '') return fallback;
  return String(val);
};

/** Common props shared by all report components */
export interface BaseReportProps {
  data: Record<string, unknown>;
  ownerName: string;
  /** When true, skip the ReportLayout wrapper (used inside FullSummaryReport) */
  embedded?: boolean;
}
