import React from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';
import ReportLayout, { ReportSectionTitle } from './ReportLayout';

// ─── Design tokens (mirrors ReportLayout.tsx) ────────────────────────────────
const colors = {
  ink: '#2c2416',
  inkLight: '#6b5c47',
  accent: '#8b6914',
  accentWarm: '#c49a3c',
  cream: '#f9f5ef',
  creamDark: '#f0e9dc',
  parchment: '#e8ddd0',
  alertRed: '#c0392b',
  alertRedLight: '#fdf0ee',
  warningAmber: '#b7770d',
  warningAmberLight: '#fdf8ee',
  okGreen: '#2e7d32',
  okGreenLight: '#f1f8f1',
};

// ─── Types matching your Supabase schema ─────────────────────────────────────

interface FolioIntake {
  client_name: string;
  client_cell_phone?: string;
  client_email?: string;
  client_mailing_address?: string;
  client_state_of_domicile?: string;
  marital_status?: string;
  spouse_name?: string;
  spouse_cell_phone?: string;
  client_has_prepaid_funeral?: boolean;
  client_preferred_funeral_home?: string;
  client_burial_or_cremation?: string;
  client_has_living_trust?: boolean;
  client_living_trust_name?: string;
  client_has_irrevocable_trust?: boolean;
  client_irrevocable_trust_name?: string;
  client_served_military?: boolean;
  client_military_branch?: string;
  number_of_children?: number;
}

interface CurrentEstatePlan {
  person_type?: string;
  has_will?: boolean;
  has_trust?: boolean;
  has_financial_poa?: boolean;
  has_health_care_poa?: boolean;
  has_living_will?: boolean;
  has_irrevocable_trust?: boolean;
  will_personal_rep?: string;
  will_personal_rep_alternate1?: string;
  trust_name?: string;
  trust_trustee?: string;
  trust_trustee_alternate1?: string;
  financial_poa_agent1?: string;
  health_care_poa_agent1?: string;
  document_state?: string;
  // Storage location (where the original is kept)
  will_storage_location?: string;
  will_storage_location_other?: string;
  will_storage_notes?: string;
  trust_storage_location?: string;
  trust_storage_location_other?: string;
  trust_storage_notes?: string;
  // Drafting attorney
  will_attorney_name?: string;
  will_attorney_firm?: string;
  will_attorney_email?: string;
  will_attorney_phone?: string;
  will_attorney_address?: string;
  trust_attorney_name?: string;
  trust_attorney_firm?: string;
  trust_attorney_email?: string;
  trust_attorney_phone?: string;
  trust_attorney_address?: string;
}

interface Advisor {
  id: string;
  advisor_type?: string;
  name?: string;
  firm_name?: string;
  phone?: string;
  email?: string;
  sort_order?: number;
}

interface BankAccount {
  id: string;
  institution?: string;
  account_type?: string;
  owner?: string;
  sort_order?: number;
}

interface RealEstate {
  id: string;
  street?: string;
  city?: string;
  state?: string;
  category?: string;
  ownership_form?: string;
  sort_order?: number;
}

interface LifeInsurance {
  id: string;
  company?: string;
  policy_type?: string;
  insured?: string;
  primary_beneficiaries?: string[];
  death_benefit?: number;
  face_amount?: number;
  sort_order?: number;
}

interface RetirementAccount {
  id: string;
  institution?: string;
  account_type?: string;
  owner?: string;
  primary_beneficiaries?: string[];
  sort_order?: number;
}

interface DigitalAsset {
  id: string;
  asset_type?: string;
  platform?: string;
  description?: string;
  owner?: string;
  sort_order?: number;
}

interface Subscription {
  id: string;
  service_name?: string;
  category?: string;
  login_email?: string;
  auto_renew?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

interface WhatToDoIfIDieProps {
  intake: FolioIntake;
  currentEstatePlans?: CurrentEstatePlan[];
  advisors?: Advisor[];
  bankAccounts?: BankAccount[];
  realEstate?: RealEstate[];
  lifeInsurance?: LifeInsurance[];
  retirementAccounts?: RetirementAccount[];
  digitalAssets?: DigitalAsset[];
  subscriptions?: Subscription[];
  dateCreated?: string;
  dateUpdated?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n?: number | null) => {
  if (!n) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 0.4 }}>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px',
        fontWeight: 600, color: colors.inkLight,
        minWidth: 160, flexShrink: 0,
      }}>
        {label}:
      </Typography>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '12px', color: colors.ink,
      }}>
        {value}
      </Typography>
    </Box>
  );
};

/** Printable checkbox item */
const CheckItem: React.FC<{
  text: string;
  detail?: string;
  urgent?: boolean;
  note?: string;
}> = ({ text, detail, urgent, note }) => (
  <Box sx={{
    display: 'flex', gap: 1.5, mb: 0.75,
    alignItems: 'flex-start',
    '@media print': { breakInside: 'avoid' },
  }}>
    {/* Checkbox square */}
    <Box sx={{
      width: 16, height: 16, mt: '2px',
      border: `2px solid ${urgent ? colors.alertRed : colors.parchment}`,
      borderRadius: '3px', flexShrink: 0,
      bgcolor: '#fff',
    }} />
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          fontWeight: 600,
          color: urgent ? colors.alertRed : colors.ink,
        }}>
          {text}
        </Typography>
        {urgent && (
          <Chip
            label="Urgent"
            size="small"
            sx={{
              bgcolor: colors.alertRed, color: '#fff',
              fontFamily: '"Jost", sans-serif',
              fontSize: '9px', fontWeight: 700, height: 16,
            }}
          />
        )}
      </Box>
      {detail && (
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '11px',
          color: colors.inkLight, mt: 0.2, lineHeight: 1.5,
        }}>
          {detail}
        </Typography>
      )}
      {note && (
        <Box sx={{
          mt: 0.5, px: 1.25, py: 0.5,
          bgcolor: colors.cream,
          border: `1px solid ${colors.parchment}`,
          borderRadius: 1,
        }}>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '11px',
            color: colors.inkLight, fontStyle: 'italic',
          }}>
            {note}
          </Typography>
        </Box>
      )}
    </Box>
  </Box>
);

/** Numbered step section */
const StepSection: React.FC<{
  stepNumber: number;
  title: string;
  timeframe?: string;
  children: React.ReactNode;
}> = ({ stepNumber, title, timeframe, children }) => (
  <Box sx={{
    mb: 2.5,
    '@media print': { breakInside: 'avoid' },
  }}>
    {/* Step header */}
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25,
    }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: '50%',
        bgcolor: colors.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '13px',
          fontWeight: 700, color: '#fff',
        }}>
          {stepNumber}
        </Typography>
      </Box>
      <Box>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '14px',
          fontWeight: 700, color: colors.ink,
        }}>
          {title}
        </Typography>
        {timeframe && (
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '11px',
            color: colors.accentWarm, fontWeight: 600,
          }}>
            {timeframe}
          </Typography>
        )}
      </Box>
    </Box>

    {/* Step content */}
    <Box sx={{
      pl: '47px', // indent to align with title
    }}>
      {children}
    </Box>
  </Box>
);

/** Contact reference box */
const ContactBox: React.FC<{
  role: string;
  name?: string;
  firm?: string;
  phone?: string;
  email?: string;
}> = ({ role, name, firm, phone, email }) => {
  if (!name && !firm && !phone) return null;
  return (
    <Box sx={{
      display: 'inline-flex', flexDirection: 'column',
      border: `1px solid ${colors.parchment}`,
      borderRadius: 1, px: 1.5, py: 1, mb: 0.75, mr: 1,
      bgcolor: colors.cream, minWidth: 180,
      '@media print': { breakInside: 'avoid' },
    }}>
      <Typography sx={{
        fontFamily: '"Jost", sans-serif', fontSize: '10px',
        fontWeight: 700, color: colors.accentWarm,
        textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25,
      }}>
        {role}
      </Typography>
      {name && (
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          fontWeight: 700, color: colors.ink,
        }}>
          {name}
        </Typography>
      )}
      {firm && (
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '11px',
          color: colors.inkLight,
        }}>
          {firm}
        </Typography>
      )}
      {phone && (
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '11px',
          color: colors.ink,
        }}>
          📞 {phone}
        </Typography>
      )}
      {email && (
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '11px',
          color: colors.inkLight,
        }}>
          {email}
        </Typography>
      )}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const WhatToDoIfIDie: React.FC<WhatToDoIfIDieProps> = ({
  intake,
  currentEstatePlans = [],
  advisors = [],
  bankAccounts = [],
  realEstate = [],
  lifeInsurance = [],
  retirementAccounts = [],
  digitalAssets = [],
  subscriptions = [],
  dateCreated,
  dateUpdated,
}) => {
  const hasSpouse = !!intake.spouse_name;

  const clientPlan = currentEstatePlans.find(
    (p) => p.person_type === 'client' || p.person_type === 'Client' || !p.person_type
  );

  // Key advisors
  const attorney = advisors.find(
    (a) => a.advisor_type?.toLowerCase().includes('attorney') ||
           a.advisor_type?.toLowerCase().includes('legal')
  );
  const financialAdvisor = advisors.find(
    (a) => a.advisor_type?.toLowerCase().includes('financial')
  );
  const accountant = advisors.find(
    (a) => a.advisor_type?.toLowerCase().includes('accountant') ||
           a.advisor_type?.toLowerCase().includes('cpa') ||
           a.advisor_type?.toLowerCase().includes('tax')
  );
  const insuranceAgent = advisors.find(
    (a) => a.advisor_type?.toLowerCase().includes('insurance')
  );

  // Real estate addresses
  const realEstateAddresses = realEstate
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((r) => [r.street, r.city, r.state].filter(Boolean).join(', '))
    .filter(Boolean);

  // Life insurance with death benefits
  const lifeInsuranceWithBenefits = lifeInsurance
    .filter((p) => p.death_benefit || p.face_amount)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  // Active subscriptions to cancel
  const activeSubscriptions = subscriptions
    .filter((s) => s.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  // Auto-renew subscriptions (highest priority to cancel)
  const autoRenewSubs = activeSubscriptions.filter((s) => s.auto_renew);

  return (
    <ReportLayout
      title="What To Do If I Die"
      ownerName={intake.client_name}
      dateCreated={dateCreated}
      dateUpdated={dateUpdated}
    >

      {/* ── Opening message ── */}
      <Box sx={{
        bgcolor: colors.ink, borderRadius: 1.5,
        px: 2.5, py: 2, mb: 3,
        '@media print': { breakInside: 'avoid' },
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '13px',
          fontWeight: 600, color: colors.accentWarm,
          mb: 0.5, letterSpacing: '0.02em',
        }}>
          A Message from {intake.client_name}
        </Typography>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '12px',
          color: colors.parchment, lineHeight: 1.7,
        }}>
          This checklist was prepared to help my family and loved ones navigate the
          practical steps that follow my passing. Please work through these steps
          in order — many have time-sensitive deadlines. Keep this document with
          my other important papers.
        </Typography>
      </Box>

      {/* ── Key contacts quick reference ── */}
      <ReportSectionTitle>Key Contacts</ReportSectionTitle>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
        {hasSpouse && intake.spouse_name && (
          <ContactBox
            role="Spouse"
            name={intake.spouse_name}
            phone={intake.spouse_cell_phone}
          />
        )}
        {clientPlan?.will_personal_rep && (
          <ContactBox
            role="Personal Representative / Executor"
            name={clientPlan.will_personal_rep}
          />
        )}
        {clientPlan?.trust_trustee && (
          <ContactBox
            role="Successor Trustee"
            name={clientPlan.trust_trustee}
          />
        )}
        {clientPlan?.financial_poa_agent1 && (
          <ContactBox
            role="Financial POA Agent"
            name={clientPlan.financial_poa_agent1}
          />
        )}
        {attorney && (
          <ContactBox
            role="Estate Planning Attorney"
            name={attorney.name}
            firm={attorney.firm_name}
            phone={attorney.phone}
            email={attorney.email}
          />
        )}
        {financialAdvisor && (
          <ContactBox
            role="Financial Advisor"
            name={financialAdvisor.name}
            firm={financialAdvisor.firm_name}
            phone={financialAdvisor.phone}
          />
        )}
        {accountant && (
          <ContactBox
            role="Accountant / CPA"
            name={accountant.name}
            firm={accountant.firm_name}
            phone={accountant.phone}
          />
        )}
        {insuranceAgent && (
          <ContactBox
            role="Insurance Agent"
            name={insuranceAgent.name}
            firm={insuranceAgent.firm_name}
            phone={insuranceAgent.phone}
          />
        )}
      </Box>

      {/* ════════════════════════════════════════════════════════════
          STEP-BY-STEP CHECKLIST
      ════════════════════════════════════════════════════════════ */}

      <ReportSectionTitle>Step-by-Step Checklist</ReportSectionTitle>

      {/* ── STEP 1 — Immediate (24–48 hours) ── */}
      <StepSection stepNumber={1} title="Immediate Steps" timeframe="Within 24–48 hours">
        <CheckItem
          urgent
          text="Notify immediate family and close friends"
          detail={hasSpouse && intake.spouse_name ? `Spouse: ${intake.spouse_name}${intake.spouse_cell_phone ? ' — ' + intake.spouse_cell_phone : ''}` : undefined}
        />
        <CheckItem
          urgent
          text="Contact the funeral home to arrange for remains"
          detail={intake.client_preferred_funeral_home
            ? `Preferred funeral home: ${intake.client_preferred_funeral_home}`
            : 'See Funeral Instructions report for preferences.'}
          note={intake.client_burial_or_cremation
            ? `Stated preference: ${intake.client_burial_or_cremation}`
            : undefined}
        />
        {intake.client_has_prepaid_funeral && (
          <CheckItem
            text="Locate prepaid funeral contract"
            detail="A prepaid funeral arrangement has already been made. Locate the contract in important papers."
          />
        )}
        {intake.client_served_military && (
          <CheckItem
            text="Contact the VA regarding burial benefits"
            detail={`${intake.client_name} is a veteran${intake.client_military_branch ? ' (' + intake.client_military_branch + ')' : ''}. Call the VA at 1-800-827-1000 to claim burial flag, Presidential Memorial Certificate, and cemetery benefits.`}
          />
        )}
        <CheckItem
          urgent
          text="Obtain multiple certified copies of the death certificate"
          detail="Request at least 10–15 certified copies from the funeral home or vital records office. You will need them for banks, insurance, probate, and government agencies."
        />
        <CheckItem
          text="Locate the original Will and/or Trust documents"
          detail={(() => {
            const fmtStorage = (loc?: string, other?: string, notes?: string) => {
              if (!loc) return '';
              if (loc === 'Other') return other || 'Other';
              return notes ? `${loc} — ${notes}` : loc;
            };
            const willStorage = clientPlan?.has_will
              ? fmtStorage(clientPlan.will_storage_location, clientPlan.will_storage_location_other, clientPlan.will_storage_notes)
              : '';
            const trustStorage = clientPlan?.has_trust
              ? fmtStorage(clientPlan.trust_storage_location, clientPlan.trust_storage_location_other, clientPlan.trust_storage_notes)
              : '';
            const parts = [
              clientPlan?.has_will
                ? `Will${willStorage ? ' — kept at: ' + willStorage : ''}${clientPlan.will_personal_rep ? ' (Personal Rep: ' + clientPlan.will_personal_rep + ')' : ''}`
                : null,
              clientPlan?.has_trust
                ? `Trust${clientPlan.trust_name ? ' (' + clientPlan.trust_name + ')' : ''}${trustStorage ? ' — kept at: ' + trustStorage : ''}`
                : null,
            ].filter(Boolean);
            return parts.length > 0 ? parts.join(' | ') : 'Check the Documents Vault in this Folio.';
          })()}
          note={(() => {
            const lines: string[] = [];
            if (clientPlan?.has_will && clientPlan.will_attorney_name) {
              const firm = clientPlan.will_attorney_firm ? ' — ' + clientPlan.will_attorney_firm : '';
              const phone = clientPlan.will_attorney_phone ? ' • ' + clientPlan.will_attorney_phone : '';
              const email = clientPlan.will_attorney_email ? ' • ' + clientPlan.will_attorney_email : '';
              lines.push(`Will drafted by: ${clientPlan.will_attorney_name}${firm}${phone}${email}`);
            }
            if (clientPlan?.has_trust && clientPlan.trust_attorney_name && clientPlan.trust_attorney_name !== clientPlan.will_attorney_name) {
              const firm = clientPlan.trust_attorney_firm ? ' — ' + clientPlan.trust_attorney_firm : '';
              const phone = clientPlan.trust_attorney_phone ? ' • ' + clientPlan.trust_attorney_phone : '';
              lines.push(`Trust drafted by: ${clientPlan.trust_attorney_name}${firm}${phone}`);
            }
            return lines.length > 0 ? lines.join(' ') : undefined;
          })()}
        />
        <CheckItem
          text="Secure the home and vehicle(s)"
          detail={realEstateAddresses.length > 0
            ? `Properties: ${realEstateAddresses.join('; ')}`
            : undefined}
        />
        <CheckItem
          text="Care for any pets or dependents"
          detail={`${intake.number_of_children ? `Children: ${intake.number_of_children}. ` : ''}Review Family & Dependents section of this Folio.`}
        />
      </StepSection>

      {/* ── STEP 2 — First Week ── */}
      <StepSection stepNumber={2} title="First Week" timeframe="Within 7 days">
        <CheckItem
          text="Contact the estate planning attorney"
          detail={attorney
            ? `${attorney.name}${attorney.firm_name ? ' — ' + attorney.firm_name : ''}${attorney.phone ? ' — ' + attorney.phone : ''}`
            : 'See Advisor Directory for contact information.'}
          note="If there is a Will, it may need to be filed with the probate court. If there is a Trust, the successor trustee should be notified."
        />
        {clientPlan?.has_will && (
          <CheckItem
            text="File the Will with the probate court if required"
            detail={clientPlan.document_state
              ? `Jurisdiction: ${clientPlan.document_state}`
              : `Check with the estate attorney regarding probate requirements in ${intake.client_state_of_domicile || 'the state of domicile'}.`}
          />
        )}
        {clientPlan?.has_trust && (
          <CheckItem
            text="Notify the successor trustee to assume their duties"
            detail={clientPlan.trust_trustee
              ? `Successor Trustee: ${clientPlan.trust_trustee}${clientPlan.trust_trustee_alternate1 ? ' | Alternate: ' + clientPlan.trust_trustee_alternate1 : ''}`
              : undefined}
          />
        )}
        <CheckItem
          text="Notify Social Security Administration"
          detail="Call 1-800-772-1213. If receiving Social Security benefits, payments must stop. Any payment received for the month of death must be returned."
          note={hasSpouse ? `${intake.spouse_name} may be entitled to survivor benefits. Ask the SSA representative.` : undefined}
        />
        <CheckItem
          text="Contact life insurance companies to file death claims"
          detail={lifeInsuranceWithBenefits.length > 0
            ? lifeInsuranceWithBenefits
                .map((p) => `${p.company || 'Policy'} — ${fmt(p.death_benefit ?? p.face_amount)}${p.primary_beneficiaries?.length ? ' → ' + p.primary_beneficiaries.join(', ') : ''}`)
                .join(' | ')
            : 'See Insurance Summary report for policy details.'}
        />
        <CheckItem
          text="Notify employer and HR department (if applicable)"
          detail="Ask about any final paycheck, unused vacation payout, pension benefits, group life insurance, and 401(k)/retirement plan survivor benefits."
        />
        <CheckItem
          text="Notify the financial advisor"
          detail={financialAdvisor
            ? `${financialAdvisor.name}${financialAdvisor.firm_name ? ' — ' + financialAdvisor.firm_name : ''}${financialAdvisor.phone ? ' — ' + financialAdvisor.phone : ''}`
            : 'See Advisor Directory for contact information.'}
        />
        <CheckItem
          text="Make a list of all assets and liabilities"
          detail="Use the Asset Inventory report in this Folio as a starting point."
        />
      </StepSection>

      {/* ── STEP 3 — First Month ── */}
      <StepSection stepNumber={3} title="First Month" timeframe="Within 30 days">
        <CheckItem
          text="Contact the accountant / CPA regarding tax obligations"
          detail={accountant
            ? `${accountant.name}${accountant.firm_name ? ' — ' + accountant.firm_name : ''}${accountant.phone ? ' — ' + accountant.phone : ''}`
            : 'See Advisor Directory.'}
          note="A final income tax return must be filed. There may also be an estate tax return required depending on the size of the estate."
        />
        <CheckItem
          text="Notify banks and financial institutions"
          detail={bankAccounts.length > 0
            ? bankAccounts
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((b) => `${b.institution || 'Bank'}${b.account_type ? ' (' + b.account_type + ')' : ''}`)
                .join(', ')
            : 'See Asset Inventory for account details.'}
          note="Do not close joint accounts immediately — consult the estate attorney first."
        />
        <CheckItem
          text="Transfer or retitle retirement accounts"
          detail={retirementAccounts.length > 0
            ? retirementAccounts
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((r) => `${r.institution || 'Institution'} ${r.account_type || ''}${r.primary_beneficiaries?.length ? ' → ' + r.primary_beneficiaries.join(', ') : ''}`)
                .join(' | ')
            : 'See Asset Inventory for retirement account details.'}
          note="Beneficiary designations on IRAs and 401(k)s pass outside of probate. The named beneficiary should contact the institution directly."
        />
        {realEstate.length > 0 && (
          <CheckItem
            text="Address real estate and property matters"
            detail={realEstateAddresses.join('; ')}
            note="Consult the estate attorney about transferring title, continuing mortgage payments, and any required probate proceedings."
          />
        )}
        <CheckItem
          text="Redirect or cancel mail and bills"
          detail="Contact the U.S. Postal Service to redirect mail. Cancel or transfer recurring bills."
        />
        <CheckItem
          text="Notify Medicare, Medicaid, and/or VA"
          detail="Call Medicare at 1-800-MEDICARE (1-800-633-4227). If receiving Medicaid, notify the state agency. VA benefits recipients: 1-800-827-1000."
        />
        <CheckItem
          text="Cancel or transfer driver's license and vehicle registration"
          detail="Notify the state DMV. Transfer vehicle titles to beneficiaries or the estate."
        />
        <CheckItem
          text="Cancel voter registration"
          detail="Contact the local county elections office."
        />
        <CheckItem
          text="Notify the post office and update address records"
        />
      </StepSection>

      {/* ── STEP 4 — Ongoing ── */}
      <StepSection stepNumber={4} title="Ongoing Estate Administration" timeframe="Months 1–12+">
        <CheckItem
          text="Work with the attorney to open and administer the estate"
          detail="If probate is required, this process may take 6–18 months depending on complexity."
        />
        <CheckItem
          text="File final federal and state income tax returns"
          note="Due April 15 of the year following death (or October 15 with extension)."
        />
        <CheckItem
          text="File estate tax return if required"
          note="Federal estate tax return (Form 706) is due 9 months after death if the gross estate exceeds the federal exemption. Some states have lower thresholds."
        />
        <CheckItem
          text="Distribute assets to beneficiaries per the Will or Trust"
          detail={clientPlan?.will_personal_rep
            ? `Personal Representative: ${clientPlan.will_personal_rep}`
            : clientPlan?.trust_trustee
            ? `Successor Trustee: ${clientPlan.trust_trustee}`
            : undefined}
        />
        <CheckItem
          text="Close the estate once all debts, taxes, and distributions are complete"
        />
      </StepSection>

      {/* ── STEP 5 — Digital & Subscriptions ── */}
      {(digitalAssets.length > 0 || activeSubscriptions.length > 0) && (
        <StepSection stepNumber={5} title="Digital Accounts & Subscriptions" timeframe="Within 30–60 days">
          {digitalAssets.length > 0 && (
            <CheckItem
              text="Locate and manage digital assets"
              detail={digitalAssets
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((d) => [d.asset_type, d.platform, d.description].filter(Boolean).join(' / '))
                .join(' | ')}
              note="See Digital Assets in the Asset Inventory for access details."
            />
          )}
          {autoRenewSubs.length > 0 && (
            <CheckItem
              urgent
              text="Cancel auto-renewing subscriptions immediately"
              detail={autoRenewSubs
                .map((s) => s.service_name)
                .filter(Boolean)
                .join(', ')}
              note="These services will continue billing unless cancelled. Check the login email on file."
            />
          )}
          {activeSubscriptions.filter((s) => !s.auto_renew).length > 0 && (
            <CheckItem
              text="Cancel or transfer remaining active subscriptions"
              detail={activeSubscriptions
                .filter((s) => !s.auto_renew)
                .map((s) => s.service_name)
                .filter(Boolean)
                .join(', ')}
            />
          )}
          <CheckItem
            text="Memorialize or close social media accounts"
            note="Facebook, Instagram, and LinkedIn each have memorialization or legacy contact options. Google allows a legacy account manager."
          />
          <CheckItem
            text="Cancel or transfer email accounts"
            detail={intake.client_email ? `Primary email: ${intake.client_email}` : undefined}
          />
        </StepSection>
      )}

      {/* ── Important documents reference ── */}
      <ReportSectionTitle>Where to Find Important Documents</ReportSectionTitle>
      <Box sx={{
        border: `1px solid ${colors.parchment}`,
        borderRadius: 1.5, overflow: 'hidden', mb: 2,
      }}>
        <Box sx={{
          bgcolor: colors.creamDark, px: 2, py: 0.75,
          borderBottom: `1px solid ${colors.parchment}`,
        }}>
          <Typography sx={{
            fontFamily: '"Jost", sans-serif', fontSize: '11px',
            fontWeight: 700, color: colors.accent,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            Document Checklist
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#fff' }}>
          <Grid container spacing={0}>
            {[
              { doc: 'Original Will', present: clientPlan?.has_will },
              { doc: 'Revocable Living Trust', present: clientPlan?.has_trust },
              { doc: 'Irrevocable Trust', present: clientPlan?.has_irrevocable_trust },
              { doc: 'Financial Power of Attorney', present: clientPlan?.has_financial_poa },
              { doc: 'Health Care Power of Attorney', present: clientPlan?.has_health_care_poa },
              { doc: 'Living Will / Advance Directive', present: clientPlan?.has_living_will },
              { doc: 'Life Insurance Policies', present: lifeInsurance.length > 0 },
              { doc: 'Bank & Investment Statements', present: bankAccounts.length > 0 },
              { doc: 'Real Estate Deeds', present: realEstate.length > 0 },
              { doc: 'Vehicle Titles', present: true },
              { doc: 'Birth Certificate', present: true },
              { doc: 'Social Security Card', present: true },
              { doc: 'Passport', present: true },
              { doc: 'Marriage Certificate', present: !!intake.marital_status },
              { doc: 'Military Discharge Papers (DD-214)', present: intake.client_served_military },
              { doc: 'Recent Tax Returns (3 years)', present: true },
            ].filter((d) => d.present !== false).map((item, i) => (
              <Grid item xs={12} sm={6} key={item.doc}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  py: 0.4, px: 0.5,
                  bgcolor: i % 2 === 0 ? '#fff' : colors.cream,
                  borderRadius: 0.5,
                }}>
                  <Box sx={{
                    width: 14, height: 14,
                    border: `2px solid ${colors.parchment}`,
                    borderRadius: '2px', flexShrink: 0, bgcolor: '#fff',
                  }} />
                  <Typography sx={{
                    fontFamily: '"Jost", sans-serif', fontSize: '12px',
                    color: colors.ink,
                  }}>
                    {item.doc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* ── Closing note ── */}
      <Box sx={{
        mt: 3, pt: 1.5,
        borderTop: `1px dashed ${colors.parchment}`,
        textAlign: 'center',
      }}>
        <Typography sx={{
          fontFamily: '"Jost", sans-serif', fontSize: '10px',
          color: colors.inkLight, fontStyle: 'italic',
        }}>
          This checklist is a general guide and does not constitute legal or financial advice.
          Consult the estate attorney, financial advisor, and accountant named above for guidance
          specific to this estate. Deadlines may vary by jurisdiction.
          This document is confidential and intended for authorized recipients only.
        </Typography>
      </Box>
    </ReportLayout>
  );
};

export default WhatToDoIfIDie;

/* ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLE:
 *
 * import WhatToDoIfIDie from './reports/WhatToDoIfIDie';
 *
 * const { data: intake }            = await supabase.from('folio_intakes').select('*').eq('id', intakeId).single();
 * const { data: currentEstatePlans }= await supabase.from('folio_current_estate_plan').select('*').eq('intake_id', intakeId);
 * const { data: advisors }          = await supabase.from('folio_advisors').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: bankAccounts }      = await supabase.from('folio_bank_accounts').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: realEstate }        = await supabase.from('folio_real_estate').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: lifeInsurance }     = await supabase.from('folio_life_insurance').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: retirementAccounts }= await supabase.from('folio_retirement_accounts').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: digitalAssets }     = await supabase.from('folio_digital_assets').select('*').eq('intake_id', intakeId).order('sort_order');
 * const { data: subscriptions }     = await supabase.from('folio_subscriptions').select('*').eq('intake_id', intakeId).order('sort_order');
 *
 * <WhatToDoIfIDie
 *   intake={intake}
 *   currentEstatePlans={currentEstatePlans}
 *   advisors={advisors}
 *   bankAccounts={bankAccounts}
 *   realEstate={realEstate}
 *   lifeInsurance={lifeInsurance}
 *   retirementAccounts={retirementAccounts}
 *   digitalAssets={digitalAssets}
 *   subscriptions={subscriptions}
 *   dateCreated={intake.created_at}
 *   dateUpdated={intake.updated_at}
 * />
 * ───────────────────────────────────────────────────────────────────────────── */