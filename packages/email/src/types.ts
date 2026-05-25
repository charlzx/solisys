export interface QuotaWarningEmailData {
  to: string;           // recipient email
  usagePercent: number; // e.g. 82
  quota: number;        // monthly quota for their plan, e.g. 10000
  planName: string;     // e.g. "Starter"
}

export interface WidgetLeadEmailData {
  to: string;           // site owner's email
  siteId: string;
  siteName: string;
  systemSummary: {
    mode: 'simple' | 'pro';
    systemSizeKva: number;
    panelCount: number;
    batteryCount: number;
    estimatedCost?: number;
    currency?: string;
    city?: string;
  };
}

export interface TeamInvitationEmailData {
  to: string;           // invitee's email
  inviterName: string;  // e.g. "Chidi Okeke"
  teamName: string;     // e.g. "Bright Solar Ltd"
  acceptUrl: string;    // one-time accept link, generated server-side
}

export interface SharedLinkExpiryEmailData {
  to: string;          // project owner's email
  projectName: string; // extracted from the snapshot JSONB
  expiresAt: string;   // human-readable date, e.g. "June 1, 2027"
  renewUrl: string;    // e.g. "solisys.dev/app/project/{id}"
}
