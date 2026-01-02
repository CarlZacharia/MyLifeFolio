# SSN Encryption Setup Guide

This document explains how to set up server-side encryption for Social Security Numbers and other sensitive data in your Estate Planning application.

## Overview

The application encrypts sensitive data (SSNs, account numbers, etc.) using **AES-256-GCM encryption** via a Supabase Edge Function. The encryption key is stored securely on the server and never exposed to the client browser.

## Architecture

```
Client Browser                  Supabase Edge Function          Supabase Database
│                               │                               │
│  User enters SSN              │                               │
│  (stored in localStorage)     │                               │
│                               │                               │
│  User submits form            │                               │
├──────────────────────────────>│                               │
│  Sends SSN in plaintext       │  Encrypts with server key     │
│  over HTTPS                   │                               │
│                               ├──────────────────────────────>│
│                               │  Stores encrypted SSN         │
│                               │                               │
│  User loads/syncs data        │                               │
│<──────────────────────────────┤  Decrypts with server key     │
│  Receives decrypted SSN       │<──────────────────────────────│
│                               │  Fetches encrypted SSN        │
```

## Step 1: Generate Encryption Key

Generate a secure 256-bit (32-byte) encryption key:

### Option A: Using OpenSSL (Recommended)
```bash
openssl rand -base64 32
```

### Option B: Using Node.js
```javascript
// run-once-generate-key.js
const crypto = require('crypto');
const key = crypto.randomBytes(32).toString('base64');
console.log('ENCRYPTION_KEY=' + key);
```

Run with: `node run-once-generate-key.js`

### Option C: Using Python
```python
import os
import base64
key = base64.b64encode(os.urandom(32)).decode('utf-8')
print(f'ENCRYPTION_KEY={key}')
```

**IMPORTANT**: Save this key securely! If you lose it, you cannot decrypt existing data.

## Step 2: Add Key to Supabase Secrets

Add the encryption key as a Supabase secret for your Edge Function:

### Using Supabase CLI

1. Install Supabase CLI if you haven't:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Set the encryption key secret:
```bash
supabase secrets set ENCRYPTION_KEY="YOUR_BASE64_KEY_HERE"
```

### Using Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Edge Functions**
4. Click **Secrets**
5. Add a new secret:
   - Name: `ENCRYPTION_KEY`
   - Value: Your base64-encoded key (without quotes)
6. Click **Save**

## Step 3: Deploy Edge Function

Deploy the encryption Edge Function to Supabase:

```bash
supabase functions deploy encrypt-sensitive-data
```

Verify deployment:
```bash
supabase functions list
```

You should see `encrypt-sensitive-data` in the list.

## Step 4: Test the Encryption

Test that encryption is working:

```bash
# Get your project URL and anon key from .env file
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Test encryption
curl -X POST "${SUPABASE_URL}/functions/v1/encrypt-sensitive-data" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"action":"encrypt","data":{"socialSecurityNumber":"123-45-6789"}}'

# Should return something like:
# {"success":true,"data":{"socialSecurityNumber":"<encrypted-base64-string>"}}
```

## Step 5: Verify in Application

1. Start your application
2. Login to your account
3. Fill out the estate planning form
4. Enter a test SSN (e.g., 123-45-6789)
5. Submit the form
6. Check Supabase database:
   - The SSN should be stored as an encrypted base64 string
   - NOT as plaintext

## Security Best Practices

### ✅ DO:
- Keep the encryption key secret and secure
- Use different encryption keys for development and production
- Backup your encryption key in a secure location (password manager, secure vault)
- Rotate encryption keys periodically (requires data re-encryption)
- Use HTTPS for all communications

### ❌ DON'T:
- Store the encryption key in client-side code
- Store the encryption key in your Git repository
- Share the encryption key via email or insecure channels
- Use the same key across multiple environments
- Commit the key to version control

## Sensitive Fields

Currently encrypted fields:
- `socialSecurityNumber` (Client)
- `spouseSocialSecurityNumber` (Spouse)

To add more sensitive fields, update these files:
1. `supabase/functions/encrypt-sensitive-data/index.ts` - Add field name to `SENSITIVE_FIELDS` array
2. `lib/encryption.ts` - Add field name to `SENSITIVE_FIELDS` array

Example fields you might want to encrypt:
- Bank account numbers
- Credit card numbers
- Driver's license numbers
- Passport numbers
- Tax ID numbers

## Troubleshooting

### Error: "ENCRYPTION_KEY environment variable not set"
**Solution**: Ensure you've set the secret in Supabase (Step 2) and deployed the function (Step 3).

### Error: "Failed to encrypt sensitive data"
**Possible causes**:
1. Edge Function not deployed
2. Incorrect encryption key format (must be base64)
3. Network connectivity issues

**Solution**: Check Edge Function logs:
```bash
supabase functions logs encrypt-sensitive-data
```

### Error: "Failed to decrypt data"
**Possible causes**:
1. Data was encrypted with a different key
2. Corrupted encrypted data
3. Wrong encryption key

**Solution**:
- If you changed the encryption key, old data cannot be decrypted
- You'll need to re-encrypt existing data with the new key
- Or restore the original encryption key

## Key Rotation

To rotate your encryption key (advanced):

1. Generate a new encryption key
2. Create a migration script that:
   - Fetches all encrypted data
   - Decrypts with old key
   - Encrypts with new key
   - Updates database
3. Update Supabase secret with new key
4. Run migration script
5. Verify all data is accessible

**Note**: Key rotation requires careful planning and should be done during low-traffic periods.

## Production Checklist

Before going to production:

- [ ] Generated secure encryption key
- [ ] Added encryption key to Supabase secrets
- [ ] Deployed Edge Function
- [ ] Tested encryption/decryption
- [ ] Backed up encryption key securely
- [ ] Different keys for dev and prod
- [ ] Verified HTTPS is enabled
- [ ] Tested form submission with SSN
- [ ] Verified SSN is encrypted in database
- [ ] Tested data restore/sync functionality

## Support

For issues or questions:
- Check Edge Function logs: `supabase functions logs encrypt-sensitive-data`
- Review this documentation
- Contact your development team
