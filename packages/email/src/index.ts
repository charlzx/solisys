import { getResendClient } from './client.js';
import type {
  QuotaWarningEmailData,
  WidgetLeadEmailData,
  TeamInvitationEmailData,
  SharedLinkExpiryEmailData,
} from './types.js';

const SENDER = 'Solisys <notifications@solisys.dev>';

// Helper to safely format numbers as currency in emails
function formatKWh(val: number): string {
  return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatCost(val: number): string {
  return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/**
 * sendQuotaWarning
 * Triggered when an API key owner reaches 80% monthly quota limits.
 */
export async function sendQuotaWarning(data: QuotaWarningEmailData): Promise<void> {
  const client = getResendClient();
  const html = `
    <div style="font-family: system-ui, sans-serif; color: #0a1f0d; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c2d4c4; border-radius: 8px;">
      <h2 style="color: #5e9e28; margin-top: 0;">API Quota Alert</h2>
      <p style="font-size: 15px; line-height: 1.6;">
        You have used <strong>${data.usagePercent}%</strong> of your <strong>${data.planName}</strong> plan API quota 
        (limit: <strong>${data.quota.toLocaleString()}</strong> calls/month).
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        Upgrade your plan at Solisys to avoid calculation and widget service interruptions for the remainder of the billing period.
      </p>
      <div style="margin: 25px 0;">
        <a href="https://solisys.dev/pricing" style="background: #5e9e28; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Upgrade Account Plan
        </a>
      </div>
      <p style="font-size: 12px; color: #7d9b82; border-top: 1px solid #e1eae3; padding-top: 15px; margin-top: 30px;">
        Solisys API Infrastructure Team
      </p>
    </div>
  `;

  try {
    const response = await client.emails.send({
      from: SENDER,
      to: data.to,
      subject: `You've used ${data.usagePercent}% of your Solisys API quota`,
      html,
    });
    if (response.error) {
      console.error('[Resend Error] sendQuotaWarning failed:', response.error);
    }
  } catch (err) {
    console.error('[Resend Catch] sendQuotaWarning thrown:', err);
  }
}

/**
 * sendWidgetLead
 * Triggered when a visitor submits a lead captured via the business widget.
 * NOTE: Privacy-First. Holds system sizing specifications only - no contact details in Solisys.
 */
export async function sendWidgetLead(data: WidgetLeadEmailData): Promise<void> {
  const client = getResendClient();
  const summary = data.systemSummary;
  
  const costText = summary.estimatedCost && summary.currency
    ? `${summary.currency} ${formatCost(summary.estimatedCost)}`
    : 'No cost estimate requested';

  const html = `
    <div style="font-family: system-ui, sans-serif; color: #0a1f0d; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c2d4c4; border-radius: 8px;">
      <h2 style="color: #5e9e28; margin-top: 0;">New Solar Lead from ${data.siteName}</h2>
      <p style="font-size: 15px; line-height: 1.6;">
        A website visitor completed the solar sizing tool on your embedded widget widget (Site ID: <code>${data.siteId}</code>).
      </p>
      
      <h3 style="color: #4a5c4e; border-bottom: 1px solid #c2d4c4; padding-bottom: 5px; margin-top: 25px;">Sizing Specifications</h3>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5c4e;">Sizing Mode:</td>
          <td style="padding: 6px 0; text-transform: capitalize;">${summary.mode}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5c4e;">Inverter Output:</td>
          <td style="padding: 6px 0;">${summary.systemSizeKva} kVA</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5c4e;">Solar Array Panels:</td>
          <td style="padding: 6px 0;">${summary.panelCount} panels</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5c4e;">Battery Bank Count:</td>
          <td style="padding: 6px 0;">${summary.batteryCount} units</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5c4e;">Market Cost Estimate:</td>
          <td style="padding: 6px 0;">${costText}</td>
        </tr>
        ${summary.city ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5c4e;">Installation City:</td>
          <td style="padding: 6px 0;">${summary.city}</td>
        </tr>` : ''}
      </table>
      
      <p style="font-size: 13px; color: #7d9b82; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e1eae3; margin-top: 25px; line-height: 1.5;">
        🔒 <strong>Privacy Notice:</strong> Due to privacy constraints, lead contact details (names, phone numbers, emails) are dispatched directly from the visitor's browser to your configured lead webhook endpoint. They are never processed or saved on Solisys cloud servers.
      </p>
      
      <p style="font-size: 12px; color: #7d9b82; border-top: 1px solid #e1eae3; padding-top: 15px; margin-top: 30px;">
        Solisys Widget lead capture services
      </p>
    </div>
  `;

  try {
    const response = await client.emails.send({
      from: SENDER,
      to: data.to,
      subject: `New solar lead from ${data.siteName}`,
      html,
    });
    if (response.error) {
      console.error('[Resend Error] sendWidgetLead failed:', response.error);
    }
  } catch (err) {
    console.error('[Resend Catch] sendWidgetLead thrown:', err);
  }
}

/**
 * sendTeamInvitation
 * Triggered when a team owner invites a seat member to their organization.
 */
export async function sendTeamInvitation(data: TeamInvitationEmailData): Promise<void> {
  const client = getResendClient();
  const html = `
    <div style="font-family: system-ui, sans-serif; color: #0a1f0d; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c2d4c4; border-radius: 8px;">
      <h2 style="color: #5e9e28; margin-top: 0;">Workspace Seat Invitation</h2>
      <p style="font-size: 15px; line-height: 1.6;">
        <strong>${data.inviterName}</strong> has invited you to join the <strong>${data.teamName}</strong> team on Solisys.
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        Once joined, you will be able to share system proposals, collaborate on inverter sizing load metrics, and manage client files within a unified workspace.
      </p>
      <div style="margin: 25px 0;">
        <a href="${data.acceptUrl}" style="background: #5e9e28; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Accept Seat Invitation
        </a>
      </div>
      <p style="font-size: 13px; color: #7d9b82; line-height: 1.4;">
        ⚠️ Note: This seat invitation link will expire in exactly 7 days. If you did not request this invitation, please disregard this alert.
      </p>
      <p style="font-size: 12px; color: #7d9b82; border-top: 1px solid #e1eae3; padding-top: 15px; margin-top: 30px;">
        Solisys Account Operations
      </p>
    </div>
  `;

  try {
    const response = await client.emails.send({
      from: SENDER,
      to: data.to,
      subject: `${data.inviterName} invited you to join ${data.teamName} on Solisys`,
      html,
    });
    if (response.error) {
      console.error('[Resend Error] sendTeamInvitation failed:', response.error);
    }
  } catch (err) {
    console.error('[Resend Catch] sendTeamInvitation thrown:', err);
  }
}

/**
 * sendSharedLinkExpiry
 * Triggered daily to alert owners of shared link snap proposals expiring.
 */
export async function sendSharedLinkExpiry(data: SharedLinkExpiryEmailData): Promise<void> {
  const client = getResendClient();
  const html = `
    <div style="font-family: system-ui, sans-serif; color: #0a1f0d; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c2d4c4; border-radius: 8px;">
      <h2 style="color: #5e9e28; margin-top: 0;">Shared Proposal Link Expiry Warning</h2>
      <p style="font-size: 15px; line-height: 1.6;">
        Your shared public proposal link for project <strong>"${data.projectName}"</strong> is scheduled to expire on <strong>${data.expiresAt}</strong>.
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        After this threshold, visitors opening the URL will see a default proposal expired notice. 
        Renew your proposal or generate fresh sharing URLs in your dashboard layout.
      </p>
      <div style="margin: 25px 0;">
        <a href="${data.renewUrl}" style="background: #5e9e28; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Open and Renew Project Link
        </a>
      </div>
      <p style="font-size: 12px; color: #7d9b82; border-top: 1px solid #e1eae3; padding-top: 15px; margin-top: 30px;">
        Solisys Edge Services
      </p>
    </div>
  `;

  try {
    const response = await client.emails.send({
      from: SENDER,
      to: data.to,
      subject: `Your shared project link for "${data.projectName}" expires soon`,
      html,
    });
    if (response.error) {
      console.error('[Resend Error] sendSharedLinkExpiry failed:', response.error);
    }
  } catch (err) {
    console.error('[Resend Catch] sendSharedLinkExpiry thrown:', err);
  }
}
