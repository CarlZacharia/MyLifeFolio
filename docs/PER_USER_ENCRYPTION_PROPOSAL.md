# Per-User Encryption Keys - Implementation Proposal

## Current System vs. Proposed System

### Current (What We Built):
```
Single Master Key (same for all users)
├─ User A's SSN → Encrypted with master key
├─ User B's SSN → Encrypted with master key
└─ User C's SSN → Encrypted with master key

Security: If master key leaks, ALL data exposed
```

### Proposed (Per-User Keys):
```
Master Key (encrypts user keys)
├─ User A's Key → Encrypts User A's SSN
├─ User B's Key → Encrypts User B's SSN
└─ User C's Key → Encrypts User C's SSN

Security: If master key leaks, still need per-user keys
           If User A's key leaks, only User A's data exposed
```

## Why Email-Based Keys Don't Work

Your idea: `encryptionKey = hash(email + "99!")`

### Problems:

1. **Not Secret**: Email addresses are public information
2. **Predictable**: Same salt "99!" for everyone
3. **Reversible**: Attacker can compute hash(known_email + "99!")
4. **No Real Security**: Hash of public data is still public

### Example Attack:

```python
# Attacker's script:
known_emails = ["alice@example.com", "bob@example.com", ...]
salt = "99!"  # Found in your source code

for email in known_emails:
    key = sha256(email + salt)
    try:
        decrypt_data_with_key(stolen_database, key)
        print(f"Decrypted {email}'s data!")
    except:
        pass
```

This would decrypt ALL your users' data in minutes.

## Secure Alternative: Server-Side Per-User Key Management

### Architecture

```sql
-- New table: user_encryption_keys
CREATE TABLE user_encryption_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  encrypted_key TEXT NOT NULL,  -- User's key encrypted with master key
  key_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE user_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Only the Edge Function can access (not even the user)
CREATE POLICY "Only Edge Function can access keys"
ON user_encryption_keys FOR SELECT
USING (auth.role() = 'service_role');
```

### Edge Function Updates

```typescript
// When user first saves data:
async function getOrCreateUserEncryptionKey(userId: string): Promise<CryptoKey> {
  // Check if user has a key
  const { data } = await supabase
    .from('user_encryption_keys')
    .select('encrypted_key')
    .eq('user_id', userId)
    .single();

  if (data) {
    // Decrypt user's key with master key
    const masterKey = await getMasterKey();
    const userKey = await decryptKey(data.encrypted_key, masterKey);
    return userKey;
  } else {
    // Generate new key for user
    const newUserKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Encrypt user's key with master key
    const masterKey = await getMasterKey();
    const encryptedUserKey = await encryptKey(newUserKey, masterKey);

    // Store encrypted user key
    await supabase
      .from('user_encryption_keys')
      .insert({
        user_id: userId,
        encrypted_key: encryptedUserKey
      });

    return newUserKey;
  }
}

// Updated encrypt function
async function encryptSensitiveData(userId: string, data: any) {
  // Get user-specific key
  const userKey = await getOrCreateUserEncryptionKey(userId);

  // Encrypt with user's key
  return await encryptWithKey(data, userKey);
}
```

### Security Benefits

1. **Defense in Depth**:
   - Master key encrypts user keys
   - User keys encrypt user data
   - Two layers of encryption

2. **Isolation**:
   - If User A's key leaks → Only User A's data at risk
   - Not all users compromised

3. **Key Rotation**:
   - Can rotate master key without re-encrypting all data
   - Can rotate individual user keys as needed

4. **Audit Trail**:
   - Track when each user's key was created
   - Version keys for migration

## Email-Based Alternative (If You Must)

If you really want email-based derivation (not recommended):

### Secure Version Using PBKDF2

```typescript
async function deriveUserKey(email: string, userPassword: string): Promise<CryptoKey> {
  // Email as salt (public, but unique per user)
  const salt = new TextEncoder().encode(email);

  // Password must be secret (not stored anywhere)
  const password = new TextEncoder().encode(userPassword);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    password,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive encryption key with 100,000 iterations
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
```

**Critical Requirements:**
- User must enter a **separate encryption password** (NOT their login password)
- Password must be **strong** (12+ characters)
- Password is **never stored** anywhere
- Lost password = **lost data forever** (no recovery possible)

### User Flow:

```
1. User signs up
   └─> "Create encryption password" (separate from login)
   └─> Derive key from email + encryption password
   └─> Never store password

2. User logs in
   └─> "Enter encryption password"
   └─> Derive same key from email + encryption password
   └─> Use key to decrypt data

3. User forgets encryption password
   └─> All data is permanently lost
   └─> Must start over
```

## Recommendation

**Use Server-Side Per-User Keys** (Option 2 above)

Why:
- ✅ Most secure
- ✅ Better user experience (no extra password)
- ✅ Recoverable (if user loses access, admin can help)
- ✅ Professional-grade implementation
- ✅ Easier to implement

**Do NOT use email + static salt** - provides zero security.

If you want me to implement per-user keys, I can update the Edge Function to automatically generate and manage unique keys for each user.

Would you like me to implement this?
