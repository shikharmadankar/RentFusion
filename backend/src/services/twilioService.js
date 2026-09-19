import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.warn(
    '[twilioService] TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are not set. ' +
    'OTP sending will fail until real credentials are added to backend/.env'
  );
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Sends an OTP via Twilio Verify to a phone number in E.164 format (e.g. +919812345678).
 * Twilio Verify manages code generation, expiry (10 min default) and throttling for us —
 * we don't need to store or hash the raw code ourselves.
 */
export async function sendOtp(phoneNumber) {
  const verification = await client.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to: phoneNumber, channel: 'sms' });

  return {
    status: verification.status,        // 'pending'
    sid: verification.sid,
  };
}

/**
 * Verifies a code the user entered against Twilio Verify.
 * Returns true only when Twilio confirms status === 'approved'.
 */
export async function checkOtp(phoneNumber, code) {
  const check = await client.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: phoneNumber, code });

  return check.status === 'approved';
}
