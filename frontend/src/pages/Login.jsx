import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Phone } from 'lucide-react';
import { api } from '../lib/api.js';

const RESEND_SECONDS = 30;

export default function Login() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const fullPhone = () => (phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`);

  async function sendOtp() {
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/otp/send', { phoneNumber: fullPhone() });
      toast.success('OTP sent via SMS');
      setStage('otp');
      setSecondsLeft(RESEND_SECONDS);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  }

  function handleDigit(i, value) {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[i] = value;
    setCode(next);
    if (value && i < 5) inputsRef.current[i + 1]?.focus();
    if (next.every((d) => d !== '') && next.join('').length === 6) {
      verifyOtp(next.join(''));
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  async function verifyOtp(fullCode) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/otp/verify', {
        phoneNumber: fullPhone(),
        code: fullCode,
      });
      localStorage.setItem('rf_access_token', data.accessToken);
      localStorage.setItem('rf_refresh_token', data.refreshToken);
      toast.success('Welcome to RentFusion');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
      setCode(new Array(6).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 py-16 text-paper">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-tag border border-paper/10 bg-ink-700 bg-white/5 p-8 shadow-card"
      >
        <h1 className="font-display text-4xl font-700">
          {stage === 'phone' ? 'Log in' : 'Enter code'}
        </h1>
        <p className="mt-2 font-body text-sm text-paper/60">
          {stage === 'phone'
            ? 'We\u2019ll text you a one-time code. No password needed.'
            : `Sent to ${fullPhone()}`}
        </p>

        {stage === 'phone' ? (
          <div className="mt-8">
            <label className="mb-2 flex items-center gap-2 rounded-tag border border-paper/20 bg-white/5 px-4 py-3">
              <Phone size={16} className="text-paper/50" />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="98123 45678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent font-body text-sm outline-none placeholder:text-paper/30"
              />
            </label>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="mt-4 w-full rounded-tag bg-amber py-3 font-body font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <div className="flex justify-between gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-12 w-10 rounded-tag border border-paper/20 bg-white/5 text-center font-mono text-lg outline-none focus:border-amber"
                />
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between font-mono text-xs text-paper/50">
              <button onClick={() => setStage('phone')} className="hover:text-paper">
                Change number
              </button>
              {secondsLeft > 0 ? (
                <span>Resend in {secondsLeft}s</span>
              ) : (
                <button onClick={sendOtp} className="text-amber hover:underline">
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
