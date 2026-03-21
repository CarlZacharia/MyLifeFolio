'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ─── Styles ──────────────────────────────────────────────────────────────────

const sectionTitle = {
  fontFamily: '"Playfair Display", serif',
  fontWeight: 600,
  fontSize: '1.15rem',
  color: '#1e3a5f',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mb: 1,
  mt: 2.5,
};

const bodyText = {
  fontFamily: '"Source Sans 3", sans-serif',
  fontSize: '0.92rem',
  lineHeight: 1.75,
  color: '#333',
};

const bulletItem = {
  fontFamily: '"Source Sans 3", sans-serif',
  fontSize: '0.9rem',
  lineHeight: 1.7,
  mb: 0.5,
  color: '#444',
};

const checkIcon = <CheckCircleIcon sx={{ fontSize: 15, color: '#2e7d32', mr: 0.75, flexShrink: 0, mt: '3px' }} />;

// ─── Component ───────────────────────────────────────────────────────────────

interface SecurityInfoModalProps {
  open: boolean;
  onClose: () => void;
}

const SecurityInfoModalComprehensive: React.FC<SecurityInfoModalProps> = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    scroll="paper"
    PaperProps={{ sx: { borderRadius: 2 } }}
  >
    {/* ── Header ── */}
    <DialogTitle
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#1e3a5f',
        color: 'white',
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ShieldIcon />
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          Security &amp; Data Protection
        </Typography>
      </Box>
      <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
        <CloseIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent dividers sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
      {/* ── Overview ── */}
      <Typography sx={{ ...bodyText, mb: 2 }}>
        MyLifeFolio stores some of the most personal information you own &mdash; your
        family details, financial accounts, medical data, legal documents, and end-of-life
        wishes. We take that responsibility seriously. Below is a transparent account
        of the security measures we have implemented at every layer of the platform.  There are very few items that are required in MyLifeFolio. If entering information makes you uneasy or concerned, chances are you will not have to enter anything in that field or fields. 
      </Typography>

      <Chip
        label="Last reviewed: March 2026"
        size="small"
        sx={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: '0.75rem', mb: 2 }}
      />

      <Divider sx={{ mb: 1 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 1. INFRASTRUCTURE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <CloudIcon sx={{ color: '#1e3a5f' }} /> 1. Infrastructure Protection
      </Typography>
      <Typography sx={bodyText}>
        All traffic between your browser and MyLifeFolio is routed through an
        enterprise-grade global security network that provides:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'DDoS Protection — Automatic mitigation of distributed denial-of-service attacks at the network edge, before they ever reach our application.',
          'Web Application Firewall (WAF) — Managed rulesets actively block common attack patterns including injection attacks, cross-site scripting, and other threats listed in the OWASP Top 10.',
          'Bot Protection — Our login and registration forms are protected by automated bot detection and challenge systems that stop credential-stuffing and brute-force attacks.',
          'Global Edge Network — Content is served from a worldwide network of data centers, ensuring fast load times and reduced exposure of our application servers.',
          'Always-On HTTPS — All connections use modern encrypted protocols. Unencrypted requests are automatically redirected to secure connections.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 2. SECURITY HEADERS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <SecurityIcon sx={{ color: '#1e3a5f' }} /> 2. Browser Security Protections
      </Typography>
      <Typography sx={bodyText}>
        Every page served by MyLifeFolio includes a comprehensive set of security
        policies that instruct your browser to enforce strict protections:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'Forced Secure Connections — Your browser is instructed to only ever connect to MyLifeFolio over HTTPS. Even if you type the address without "https," your browser will automatically use the secure connection.',
          'Script &amp; Content Restrictions — Strict policies control which scripts, styles, and external connections are permitted, preventing attackers from injecting malicious code into the page.',
          'Clickjacking Prevention — Our pages cannot be embedded inside other websites, blocking a class of attacks where malicious sites try to trick you into clicking hidden elements.',
          'Privacy Controls — Information shared with other sites when you navigate away is minimized, and access to device features (camera, microphone, geolocation) is restricted to our domain only.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 3. AUTHENTICATION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <VpnKeyIcon sx={{ color: '#1e3a5f' }} /> 3. Authentication &amp; Session Security
      </Typography>
      <Typography sx={bodyText}>
        We use an enterprise-grade authentication platform combined with
        our own additional safeguards:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'Email Verification Required — You must confirm your email address before accessing the platform. Unverified accounts are immediately signed out.',
          'Multiple Login Options — Choose between a one-time email code or a traditional password. One-time codes eliminate the risk of password reuse across sites.',
          'Token-Based Authentication — Every request to our servers is authenticated with a short-lived, cryptographically signed token. Tokens are automatically refreshed and cannot be forged.',
          'Re-authentication for Sensitive Data — When you access sensitive sections of the platform, you are prompted to re-verify your identity with a fresh email code. This protects against someone gaining access to an unlocked device.',
          'Automatic Session Management — Sessions are securely managed and automatically refreshed. If your session expires, you are redirected to the login page.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 4. DATABASE SECURITY */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <StorageIcon sx={{ color: '#1e3a5f' }} /> 4. Database &amp; Data Isolation
      </Typography>
      <Typography sx={bodyText}>
        Your data is stored in an enterprise-grade database with
        strict isolation and access controls:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'Row-Level Security on Every Table — Every data table in our database enforces security policies at the individual row level. The database itself ensures that you can only read, create, update, or delete your own data. Even if our application code had a bug, the database would still block unauthorized access.',
          'Ownership Verification — Every query is filtered by your authenticated identity at the database level. There is no way for one user to access another user\'s information.',
          'Encryption at Rest — All data stored in the database is encrypted at rest using industry-standard encryption, managed by our cloud infrastructure provider.',
          'Encryption in Transit — All database connections use encrypted protocols. Data is never transmitted in plaintext between any component of the system.',
          'Automated Backups — Database backups are performed automatically and are themselves encrypted. In the event of a disaster, your data can be restored.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 5. ENCRYPTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <LockIcon sx={{ color: '#1e3a5f' }} /> 5. Data Encryption &mdash; Three Layers of Protection
      </Typography>
      <Typography sx={bodyText}>
        MyLifeFolio employs encryption at multiple layers. All data is encrypted
        in transit and at rest. Beyond that, your most sensitive credentials receive
        an additional layer of protection through client-side encryption &mdash;
        meaning the data is encrypted on your device before it ever leaves your browser:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'Layer 1: Encryption in Transit — Every connection between your browser and our servers uses modern encrypted protocols (HTTPS). Your data is never sent over an unencrypted connection.',
          'Layer 2: Encryption at Rest — All data stored in our database and file storage is encrypted at rest using industry-standard encryption managed by our cloud infrastructure provider. Even if physical storage were compromised, the data would be unreadable.',
          'Layer 3: Client-Side Field Encryption (Credential Vault) — Passwords, PINs, security questions, backup codes, and recovery emails are encrypted using military-grade encryption directly in your browser before being sent to the server. This is the same class of encryption used by governments and financial institutions.',
          'Your Passphrase, Your Key — Encryption keys for the Credential Vault are derived from a passphrase that only you know, using an industry-standard key derivation process with extensive computational hardening. We never see or store your passphrase — without it, the encrypted data is unreadable, even to us.',
          'Recovery Key — A one-time recovery key is generated when you set up the vault. If you forget your passphrase, the recovery key is the only way to regain access. We cannot decrypt your vault for you.',
          'Social Security Numbers — SSNs are encrypted server-side using a separate key stored in a secure, isolated environment. The plaintext SSN is never stored in the database.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 6. FILE STORAGE */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <VerifiedUserIcon sx={{ color: '#1e3a5f' }} /> 6. Document &amp; File Storage
      </Typography>
      <Typography sx={bodyText}>
        Uploaded documents (wills, trusts, estate plans, photos, and videos) are stored
        securely with strict access controls:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'Private Storage — All document uploads are stored in private, non-public storage. There are no publicly accessible URLs to your files.',
          'Per-User Isolation — Each user\'s files are isolated from all other users. Security policies on the storage layer ensure you can only access your own files.',
          'File Type Restrictions — Only permitted document and image file types can be uploaded, reducing the risk of malicious file uploads.',
          'Encrypted at Rest — All stored files are encrypted at rest by our cloud storage provider.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 7. FAMILY ACCESS */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <VisibilityOffIcon sx={{ color: '#1e3a5f' }} /> 7. Family Access Portal Security
      </Typography>
      <Typography sx={bodyText}>
        The Family Access Portal lets you share selected information with trusted family
        members while maintaining strict control over what they can see:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'Section-Based Access Controls — You choose exactly which categories each family member can view. They see nothing outside their authorized sections.',
          'Sensitive Data Masking — Even for authorized family members, highly sensitive data like Social Security numbers and policy numbers are automatically masked. Full values are never displayed.',
          'Complete Audit Trail — Every family member access is logged with the date, time, who accessed, and what sections they viewed. You can review this log at any time.',
          'Instant Revocation — You can revoke any family member\'s access at any time with a single click, effective immediately.',
          'Separate Authentication — Family members log in with their own email and must be explicitly authorized by the account owner. They cannot self-register for access.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 8. PAYMENT SECURITY */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <SecurityIcon sx={{ color: '#1e3a5f' }} /> 8. Payment Security
      </Typography>
      <Typography sx={bodyText}>
        All billing is handled by a PCI Level 1 certified payment processor:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'No Credit Card Data on Our Servers — Payment is handled entirely by a certified third-party payment processor. Your card numbers, CVVs, and billing details never touch our servers or database.',
          'Cryptographic Verification — All communications between the payment processor and our system are cryptographically signed and verified, preventing spoofed or tampered payment events.',
          'PCI DSS Level 1 Compliance — Our payment integration meets the highest level of payment security certification in the industry.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 9. SECRET KEY & API PROTECTION */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <VpnKeyIcon sx={{ color: '#1e3a5f' }} /> 9. Secret Key &amp; API Protection
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'Server-Side Secrets Only — All secret keys (payment keys, encryption keys, AI service keys) are stored exclusively in secure, isolated server-side environments. They are never exposed to your browser or included in client-side code.',
          'Origin Whitelisting — Our server-side functions only accept requests from our verified production domain. Requests from unauthorized origins are rejected.',
          'No Sensitive Data in Your Browser — We do not store passwords, personal information, or financial data in your browser\'s local storage. Only a minimal session token is persisted locally.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 10. APPLICATION SECURITY PRACTICES */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <VerifiedUserIcon sx={{ color: '#1e3a5f' }} /> 10. Application Security Practices
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'XSS Prevention — The application framework automatically escapes all rendered content, preventing cross-site scripting attacks by default.',
          'Input Validation — Form inputs are validated on the client side and enforced at the database level to prevent injection attacks and data corruption.',
          'Rate Limiting — Features are rate-limited per user to prevent abuse. Additional built-in rate limiting is applied to authentication and API endpoints.',
          'Server-Side Authorization — Premium features and data access are enforced on the server. Even if someone attempted to bypass the user interface, the server verifies authorization before executing any operation.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start' }}>
            {checkIcon} {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* 11. TRANSPARENCY */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Typography sx={sectionTitle}>
        <GavelIcon sx={{ color: '#1e3a5f' }} /> 11. Transparency &amp; Limitations
      </Typography>
      <Typography sx={{ ...bodyText, mb: 1 }}>
        We believe in being honest about both our strengths and limitations:
      </Typography>
      <Box component="ul" sx={{ pl: 1, listStyle: 'none', mt: 1 }}>
        {[
          'General Personal Information — While credentials (passwords, PINs) and SSNs are encrypted at the individual field level, other personal data (names, addresses, phone numbers) is protected by row-level security, encryption at rest, and encryption in transit — but is not individually field-encrypted like vault items.',
          'Passphrase Recovery — If you lose both your Credential Vault passphrase and your recovery key, we cannot recover your encrypted vault data. This is by design — it ensures that no one, including our team, can read your passwords.',
        ].map((text, i) => (
          <Typography key={i} component="li" sx={{ ...bulletItem, display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ mr: 0.75, mt: '3px', flexShrink: 0, fontSize: 15 }}>&#9679;</Box> {text}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* SUMMARY BOX */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: '#f0f5fa',
          border: '1px solid #c8dae8',
          borderRadius: 2,
          p: 2.5,
          mt: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
            fontSize: '1.05rem',
            color: '#1e3a5f',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ShieldIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
          Security Summary
        </Typography>
        <Typography sx={{ ...bodyText, fontSize: '0.88rem' }}>
          Your data is protected by a <strong>global security network</strong> with
          DDoS protection and a web application firewall,
          {' '}<strong>row-level security on every database table</strong>,
          {' '}<strong>three layers of encryption</strong> (in transit, at rest,
          and client-side field encryption for your most sensitive credentials),
          {' '}<strong>re-authentication requirements</strong> for accessing sensitive sections,
          {' '}<strong>comprehensive browser security policies</strong>,
          {' '}<strong>PCI Level 1 payment processing</strong>,
          and a <strong>complete audit trail</strong> of all family access.
          Secret keys are never exposed to the browser.
        </Typography>
      </Box>

      {/* ─── DISCLAIMER ─── */}
      <Box
        sx={{
          bgcolor: '#fdf6ec',
          border: '1px solid #e8d5b0',
          borderRadius: 2,
          p: 2.5,
          mt: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
            fontSize: '1rem',
            color: '#7a5c1e',
            mb: 1,
          }}
        >
          A Candid Note on Security
        </Typography>
        <Typography sx={{ ...bodyText, fontSize: '0.88rem', color: '#5a4a2e' }}>
          No company, no platform, and no technology provider in the world can
          promise you 100% absolute security. Anyone who makes that claim is not
          being truthful. What we <em>can</em> promise is that we have worked
          diligently to implement industry-leading security practices at every
          layer of this platform &mdash; from the network edge to the database row.
          We continuously monitor for emerging threats, apply security updates
          promptly, and treat your data with the same care we would want for our
          own families&rsquo; most personal information. If you ever have
          questions or concerns about our security practices, we welcome the
          conversation.
        </Typography>
      </Box>

      <Typography
        sx={{
          ...bodyText,
          fontSize: '0.82rem',
          color: '#888',
          mt: 2,
          textAlign: 'center',
        }}
      >
        Questions about our security practices? Contact us at carl@SeniorCareRes.com
      </Typography>
    </DialogContent>

    <DialogActions sx={{ px: 3, py: 1.5 }}>
      <Button
        onClick={onClose}
        variant="contained"
        sx={{ bgcolor: '#1e3a5f', '&:hover': { bgcolor: '#0f2744' } }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default SecurityInfoModalComprehensive;
