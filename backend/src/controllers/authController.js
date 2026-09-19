import { z } from 'zod';
import { query } from '../config/db.js';
import { sendOtp, checkOtp } from '../services/twilioService.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwt.js';

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, 'Phone number must be in E.164 format, e.g. +919812345678'),
});

const verifySchema = phoneSchema.extend({
  code: z.string().regex(/^\d{4,8}$/, 'OTP code must be 4-8 digits'),
});

// POST /api/auth/otp/send
export async function requestOtp(req, res) {
  const parsed = phoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { phoneNumber } = parsed.data;

  // Basic abuse guard: max 5 OTP requests per phone number per 10 minutes.
  const recent = await query(
    `SELECT count(*) FROM otps
     WHERE phone_number = $1 AND created_at > now() - interval '10 minutes'`,
    [phoneNumber]
  );
  if (Number(recent.rows[0].count) >= 5) {
    return res.status(429).json({ error: 'Too many OTP requests. Please try again later.' });
  }

  try {
    const verification = await sendOtp(phoneNumber);

    await query(
      `INSERT INTO otps (phone_number, code_hash, purpose, provider_message_id, expires_at)
       VALUES ($1, $2, 'login', $3, now() + interval '10 minutes')`,
      [phoneNumber, 'managed_by_twilio_verify', verification.sid]
    );

    return res.json({ message: 'OTP sent', status: verification.status });
  } catch (err) {
    console.error('[requestOtp] Twilio error:', err.message);
    return res.status(502).json({ error: 'Could not send OTP. Please try again shortly.' });
  }
}

// POST /api/auth/otp/verify
export async function verifyOtp(req, res) {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { phoneNumber, code } = parsed.data;

  let approved;
  try {
    approved = await checkOtp(phoneNumber, code);
  } catch (err) {
    console.error('[verifyOtp] Twilio error:', err.message);
    return res.status(502).json({ error: 'Could not verify OTP. Please try again.' });
  }

  if (!approved) {
    await query(
      `UPDATE otps SET attempts = attempts + 1
       WHERE phone_number = $1 AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [phoneNumber]
    );
    return res.status(401).json({ error: 'Invalid or expired OTP code' });
  }

  await query(
    `UPDATE otps SET consumed_at = now()
     WHERE phone_number = $1 AND consumed_at IS NULL`,
    [phoneNumber]
  );

  // Find or create the user (passwordless signup-on-first-login).
  let { rows } = await query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
  let user = rows[0];

  if (!user) {
    const inserted = await query(
      `INSERT INTO users (phone_number, is_phone_verified)
       VALUES ($1, TRUE) RETURNING *`,
      [phoneNumber]
    );
    user = inserted.rows[0];
    await query('INSERT INTO user_profiles (user_id) VALUES ($1)', [user.id]);
  } else if (!user.is_phone_verified) {
    await query('UPDATE users SET is_phone_verified = TRUE WHERE id = $1', [user.id]);
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, now() + interval '30 days')`,
    [user.id, hashToken(refreshToken), req.headers['user-agent'] || null, req.ip]
  );

  return res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      phoneNumber: user.phone_number,
      fullName: user.full_name,
      role: user.role,
      isNewUser: !user.full_name,
    },
  });
}

// POST /api/auth/refresh
export async function refreshToken(req, res) {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(400).json({ error: 'refreshToken is required' });

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const tokenHash = hashToken(token);
  const { rows } = await query(
    `SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
    [tokenHash]
  );
  if (rows.length === 0) {
    return res.status(401).json({ error: 'Refresh token not recognized or already revoked' });
  }

  const { rows: userRows } = await query('SELECT * FROM users WHERE id = $1', [payload.sub]);
  const user = userRows[0];
  if (!user) return res.status(401).json({ error: 'User not found' });

  const newAccessToken = signAccessToken(user);
  return res.json({ accessToken: newAccessToken });
}

// POST /api/auth/logout
export async function logout(req, res) {
  const { refreshToken: token } = req.body;
  if (token) {
    await query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`,
      [hashToken(token)]
    );
  }
  return res.json({ message: 'Logged out' });
}
