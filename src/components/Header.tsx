import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Sparkles, LogOut, Shield, Award, BookOpen, LogIn, Mail, ArrowRight, X, Phone, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, Folder } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { XPWidget } from './XPWidget';
import { getFirebaseAuth, getFirebaseDb } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { ref, get, update, set } from 'firebase/database';
import emailjs from '@emailjs/browser';

const hashPassword = async (password: string, salt: string): Promise<string> => {
  const enc = new TextEncoder().encode(`${salt}::${password}`);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const Header: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    currentUser, 
    setCurrentUser,
    login, 
    logout, 
    seedAdminAccount,
    usersList,
    systemConfig,
    addNotificationLog,
    addToast,
    dbStatus
  } = useApp();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Registration and verification form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginMobile, setLoginMobile] = useState('');
  const loginMobileCountry = '+91';
  const [loginStep, setLoginStep] = useState<
    'input' | 'admin_password' | 'sme_password' | 'sme_change_password' | 
    'email_otp' | 'mobile_otp' | 'password_input' | 'set_password' | 
    'forgot_password_email' | 'forgot_password_verify' | 'success'
  >('input');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [smePasswordInput, setSmePasswordInput] = useState('');
  const [showSmePassword, setShowSmePassword] = useState(false);
  const [smeReviewerInfo, setSmeReviewerInfo] = useState<any | null>(null);
  const [smeNewPassword, setSmeNewPassword] = useState('');
  const [smeConfirmPassword, setSmeConfirmPassword] = useState('');
  const [showSmeNewPassword, setShowSmeNewPassword] = useState(false);
  
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [mobileOtp, setMobileOtp] = useState(['', '', '', '', '', '']);
  const [isNewUser, setIsNewUser] = useState(false);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('');

  // User Password States
  const [userPasswordInput, setUserPasswordInput] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  
  // Set New Password States (for registration or legacy migration)
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Forgot Password States
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState(['', '', '', '', '', '']);
  const [generatedResetOtp, setGeneratedResetOtp] = useState('');
  
  // Timers and loading indicators
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const initials = currentUser
    ? currentUser.name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '';
  const navigate = useNavigate();
  const location = useLocation();

  // Reset dialog state when modal opens or closes
  useEffect(() => {
    if (!showLoginModal) {
      setLoginEmail('');
      setLoginName('');
      setLoginMobile('');
      setLoginStep('input');
      setAuthMode('login');
      setEmailOtp(['', '', '', '', '', '']);
      setMobileOtp(['', '', '', '', '', '']);
      setErrorMessage('');
      setLoading(false);
      setShowAdminPassword(false);
      setUserPasswordInput('');
      setShowUserPassword(false);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setShowNewPassword(false);
      setForgotPasswordOtp(['', '', '', '', '', '']);
      setGeneratedResetOtp('');
    }
  }, [showLoginModal]);

  // Listen to external triggers to open the login modal
  useEffect(() => {
    const handleTrigger = () => setShowLoginModal(true);
    window.addEventListener('orchestrai_trigger_login', handleTrigger);
    return () => window.removeEventListener('orchestrai_trigger_login', handleTrigger);
  }, []);

  // Handle count down timer for verification OTPs
  useEffect(() => {
    let interval: any;
    if (showLoginModal && (loginStep === 'email_otp' || loginStep === 'mobile_otp') && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showLoginModal, loginStep, timer]);

  const triggerSeedAdmin = () => {
    seedAdminAccount();
    // Default to the newly approved admin email
    login('vthinkorchestrai@gmail.com', 'vThink OrchestrAI Admin', '+919876543210', true, true);
    setShowLoginModal(false);
    navigate('/admin');
  };

  // Check if input email exists in DB and handle step routing
  const checkEmailAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    setLoading(true);
    setErrorMessage('');

    const formattedEmail = loginEmail.trim().toLowerCase();
    
    // Admin password check
    if (formattedEmail === 'vthinkorchestrai@gmail.com') {
      // Always prompt for password for the administrator account to avoid lockout and EmailJS delivery issues.
      // If no custom password is set, the user can use the default password 'admin'.
      setLoginStep('admin_password');
      setLoading(false);
      return;
    }

    // 1. Strict Email Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formattedEmail)) {
      setErrorMessage('Invalid email format. Please check your email address and make sure it has a valid domain extension (e.g. learner@gmail.com).');
      setLoading(false);
      return;
    }

    // Reviewer password check
    const db = getFirebaseDb();
    let reviewerEntry: [string, any] | null = null;
    if (db) {
      try {
        const revSnap = await get(ref(db, 'reviewers'));
        if (revSnap.exists()) {
          const allRevs = revSnap.val() as Record<string, any>;
          const entry = Object.entries(allRevs).find(
            ([, r]: [string, any]) => (r.email || '').toLowerCase() === formattedEmail
          );
          if (entry) {
            reviewerEntry = entry;
          }
        }
      } catch (revErr) {
        console.warn('[Header] Failed to check reviewers database:', revErr);
      }
    }

    if (reviewerEntry) {
      const [revUid, revData] = reviewerEntry;
      if (revData.disabled) {
        setErrorMessage('Your reviewer account is disabled. Contact the admin to re-enable it.');
        setLoading(false);
        return;
      }
      setSmeReviewerInfo({ uid: revUid, email: revData.email, name: revData.name, data: revData });
      setLoginStep('sme_password');
      setLoading(false);
      return;
    }

    try {
      const existingUser = usersList.find((u) => u.email === formattedEmail);

      if (existingUser && existingUser.disabled) {
        setErrorMessage('Your account has been disabled/blacklisted. Please contact the administrator.');
        setLoading(false);
        return;
      }

      if (authMode === 'login') {
        if (!existingUser) {
          setErrorMessage('This email address is not registered. Please click the "Register" tab above to create a new account.');
          setLoading(false);
          return;
        }
        setIsNewUser(false);
        setLoginName(existingUser.name);
        setLoginMobile(existingUser.mobile || '');

        if (existingUser.passwordHash) {
          setLoginStep('password_input');
          setLoading(false);
          return;
        }

        if (systemConfig.requireEmailVerification !== false) {
          let otpCode = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedEmailOtp(otpCode);
          try {
            await sendEmailOtp(formattedEmail, otpCode, existingUser.name);
          } catch (sendErr: any) {
            console.warn("EmailJS send failed, falling back to simulated OTP toast:", sendErr);
            addToast(`🔑 [Verification Fallback] Sent Email OTP: ${otpCode}`, 'success');
            addNotificationLog({
              type: 'Email OTP Verification Failure Fallback',
              recipient: formattedEmail,
              subject: '[Fallback] OTP verification code',
              channel: `EmailJS API (Failed: ${sendErr?.text || (sendErr && JSON.stringify(sendErr)) || String(sendErr)})`,
              status: 'Failed'
            });
          }
          setTimer(30);
          setCanResend(false);
          setLoginStep('email_otp');
        } else {
          // Bypass email verification on login
          login(
            formattedEmail,
            existingUser.name,
            existingUser.mobile || '',
            true, // emailVerified = true
            existingUser.mobileVerified || false
          );
          addToast("Welcome back! Logged in successfully.", "success");
          setShowLoginModal(false);
          setLoginStep('input');
          navigate('/modules');
        }
      } else {
        if (existingUser) {
          setErrorMessage('This email address is already registered. Please click the "Log In" tab above to sign in.');
          setLoading(false);
          return;
        }
        setIsNewUser(true);
        if (!loginName.trim()) {
          setErrorMessage('Full Name is required.');
          setLoading(false);
          return;
        }
        if (!loginMobile) {
          setErrorMessage('Mobile number is required.');
          setLoading(false);
          return;
        }
        
        // 2. Strict Indian Mobile Regex Validation (10 digits starting with 6, 7, 8, or 9)
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(loginMobile)) {
          setErrorMessage('Invalid mobile number. Please check your phone number (it must be exactly 10 digits and start with 6, 7, 8, or 9).');
          setLoading(false);
          return;
        }

        const fullPhone = loginMobileCountry + loginMobile.trim();

        if (systemConfig.requireEmailVerification !== false) {
          let otpCode = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedEmailOtp(otpCode);
          try {
            await sendEmailOtp(formattedEmail, otpCode, loginName);
          } catch (sendErr: any) {
            console.warn("EmailJS send failed, falling back to simulated OTP toast:", sendErr);
            addToast(`🔑 [Verification Fallback] Sent Email OTP: ${otpCode}`, 'success');
            addNotificationLog({
              type: 'Email OTP Verification Failure Fallback',
              recipient: formattedEmail,
              subject: '[Fallback] OTP verification code',
              channel: `EmailJS API (Failed: ${sendErr?.text || (sendErr && JSON.stringify(sendErr)) || String(sendErr)})`,
              status: 'Failed'
            });
          }
          setTimer(30);
          setCanResend(false);
          setLoginStep('email_otp');
        } else if (systemConfig.requirePhoneVerification === true) {
          // Bypass email OTP, go straight to phone OTP
          try {
            await sendPhoneOtp(fullPhone);
            setTimer(30);
            setCanResend(false);
            setLoginStep('mobile_otp');
          } catch (err: any) {
            setErrorMessage(err.message || 'Failed to trigger mobile SMS OTP.');
          }
        } else {
          // Bypass both email and phone OTPs
          login(formattedEmail, loginName, fullPhone, false, false);
          addToast("Account registered successfully!", "success");
          setLoginStep('success');
          setTimeout(() => {
            setShowLoginModal(false);
            setLoginStep('input');
            setLoginEmail('');
            setLoginName('');
            setLoginMobile('');
            navigate('/modules');
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error("Authentication step routing failed:", err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send email OTP (EmailJS api or simulation fallback)
  const sendEmailOtp = async (email: string, otpCode: string, name: string) => {
    const config = systemConfig;
    const hasKeys = config.emailjsServiceId && config.emailjsTemplateId && config.emailjsPublicKey;
    const emailSubject = "[OrchestrAI] Email Verification Code";
    const emailBody = `Hi ${name},\n\nYour OrchestrAI verification code is: ${otpCode}\n\nThis code is valid for 5 minutes. If you did not request this, please ignore this email.\n\nBest regards,\nOrchestrAI Lead Academy`;

    if (hasKeys) {
      await emailjs.send(
        config.emailjsServiceId,
        config.emailjsTemplateId,
        {
          to_email: email,
          subject: emailSubject,
          message: emailBody
        },
        config.emailjsPublicKey
      );

      addNotificationLog({
        type: 'Email OTP Verification',
        recipient: email,
        subject: emailSubject,
        channel: 'EmailJS API',
        status: 'Sent'
      });
      addToast(`Verification code sent to ${email}`, 'success');
    } else {
      console.log(`[SIMULATION MODE] Email OTP sent to ${email}: ${otpCode}`);
      addToast(`🔑 [Simulation Mode] Sent Email OTP: ${otpCode}`, 'success');
      addNotificationLog({
        type: 'Email OTP Verification (Simulated)',
        recipient: email,
        subject: emailSubject,
        channel: 'EmailJS API (Simulated)',
        status: 'Sent'
      });
    }
  };

  // Send mobile SMS OTP (Firebase authentication only)
  const sendPhoneOtp = async (fullPhoneNumber: string) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase Authentication is not initialized. Please verify your project credentials in the Database Settings.");
    }
    try {
      // Clear any previously initialized recaptcha verifier reference
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          console.warn("Failed to clear old recaptcha verifier:", e);
        }
        (window as any).recaptchaVerifier = null;
      }

      const oldCont = document.getElementById('recaptcha-container');
      let containerElement: HTMLElement | null = oldCont;
      if (oldCont) {
        const parent = oldCont.parentNode;
        if (parent) {
          const newCont = document.createElement('div');
          newCont.id = 'recaptcha-container';
          parent.replaceChild(newCont, oldCont);
          containerElement = newCont;
        }
      }

      if (!containerElement) {
        throw new Error("reCAPTCHA container element not found in DOM");
      }

      // Pass the actual DOM element reference instead of a string ID to bypass Firebase SDK's internal caching bug
      const verifier = new RecaptchaVerifier(auth, containerElement, {
        size: 'invisible'
      });
      (window as any).recaptchaVerifier = verifier;

      // Timeout promise of 15 seconds to give Firebase Phone Auth ample time to load recaptcha and dispatch SMS
      const smsPromise = signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Firebase SMS dispatch timed out (possible reCAPTCHA blocker or slow network).")), 15000)
      );

      const confirmation = await Promise.race([smsPromise, timeoutPromise]);
      setConfirmationResult(confirmation);
      addToast("Mobile verification code sent!", "success");
    } catch (err: any) {
      console.warn("Firebase Phone Auth failed or timed out:", err);
      
      // Log failure in Notification logs list
      addNotificationLog({
        type: 'Mobile SMS Verification Failure',
        recipient: fullPhoneNumber,
        subject: 'Verification Code SMS Failure',
        channel: `Firebase Phone Auth (Failed: ${err?.message || String(err)})`,
        status: 'Failed'
      });

      throw err;
    }
  };

  const verifyAdminPassword = async () => {
    setLoading(true);
    setErrorMessage('');
    
    await new Promise((resolve) => setTimeout(resolve, 800));

    const targetPassword = (systemConfig.adminPassword && systemConfig.adminPassword.trim() !== '') 
      ? systemConfig.adminPassword 
      : 'admin';

    if (adminPasswordInput === targetPassword) {
      setLoginStep('success');
      setTimeout(() => {
        seedAdminAccount();
        login('vthinkorchestrai@gmail.com', 'vThink OrchestrAI Admin', '+919876543210', true, true);
        setShowLoginModal(false);
        setAdminPasswordInput('');
        navigate('/admin');
      }, 1500);
    } else {
      setErrorMessage('Incorrect admin password. Please try again.');
    }
    setLoading(false);
  };

  const verifySmePassword = async () => {
    if (!smeReviewerInfo) return;
    setLoading(true);
    setErrorMessage('');
    
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const r = smeReviewerInfo.data;
      if (!r.passwordHash || !r.passwordSalt) {
        setErrorMessage('No password is set on this account. Ask the admin to send credentials.');
        setLoading(false);
        return;
      }

      const computed = await hashPassword(smePasswordInput, r.passwordSalt);
      if (computed !== r.passwordHash) {
        setErrorMessage('Incorrect password.');
        setLoading(false);
        return;
      }

      if (r.mustChangePassword !== false) {
        setErrorMessage('');
        setLoginStep('sme_change_password');
        setLoading(false);
        return;
      }

      // Set session user just like in SmeLogin.tsx
      const sessionUser: any = {
        uid: smeReviewerInfo.uid,
        email: r.email,
        name: r.name,
        role: r.role === 'admin' ? 'ADMIN' : 'SME',
        accountStatus: 'APPROVED',
        emailVerified: true,
        mobileVerified: false,
        quizPassed: true,
        progress: { slidesViewed: {}, modulesCompleted: [], quizScores: {}, labsPassed: [], streakDays: 0, lastActiveDate: '', level: 1, xp: 0 },
        isReviewer: true,
        reviewerRole: r.role
      };

      setLoginStep('success');
      setTimeout(() => {
        setCurrentUser(sessionUser);
        try {
          sessionStorage.setItem('orchestrai_session_user', JSON.stringify(sessionUser));
          localStorage.setItem('orchestrai_db_currentUser', JSON.stringify(sessionUser));
        } catch { /* ignore */ }
        setShowLoginModal(false);
        setSmePasswordInput('');
        setSmeReviewerInfo(null);
        addToast(`Welcome back, ${r.name}.`, 'success');
        navigate('/admin');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(`Login failed: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSmeChangePassword = async () => {
    if (!smeReviewerInfo) return;
    if (smeNewPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (smeNewPassword !== smeConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const db = getFirebaseDb();
      if (!db) throw new Error('Database connection unavailable.');
      
      const generateSalt = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const salt = generateSalt();
      const hash = await hashPassword(smeNewPassword, salt);

      const updatePayload: any = {
        passwordHash: hash,
        passwordSalt: salt,
        mustChangePassword: false,
        lastPasswordResetAt: Date.now()
      };

      await update(ref(db, `reviewers/${smeReviewerInfo.uid}`), updatePayload);

      // Log in
      const r = smeReviewerInfo.data;
      const sessionUser: any = {
        uid: smeReviewerInfo.uid,
        email: r.email,
        name: r.name,
        role: r.role === 'admin' ? 'ADMIN' : 'SME',
        accountStatus: 'APPROVED',
        emailVerified: true,
        mobileVerified: false,
        quizPassed: true,
        progress: { slidesViewed: {}, modulesCompleted: [], quizScores: {}, labsPassed: [], streakDays: 0, lastActiveDate: '', level: 1, xp: 0 },
        isReviewer: true,
        reviewerRole: r.role
      };

      setLoginStep('success');
      setTimeout(() => {
        setCurrentUser(sessionUser);
        try {
          sessionStorage.setItem('orchestrai_session_user', JSON.stringify(sessionUser));
          localStorage.setItem('orchestrai_db_currentUser', JSON.stringify(sessionUser));
        } catch { /* ignore */ }
        setShowLoginModal(false);
        setSmePasswordInput('');
        setSmeNewPassword('');
        setSmeConfirmPassword('');
        setSmeReviewerInfo(null);
        addToast(`Password updated. Welcome back, ${r.name}.`, 'success');
        navigate('/admin');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(`Failed to update password: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Verify Email code
  const verifyEmailOtp = async () => {
    setLoading(true);
    setErrorMessage('');
    const enteredCode = emailOtp.join('');

    if (enteredCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      setLoading(false);
      return;
    }

    if (enteredCode === generatedEmailOtp) {
      if (isNewUser) {
        const fullPhone = loginMobileCountry + loginMobile.trim();
        if (systemConfig.requirePhoneVerification === true) {
          try {
            await sendPhoneOtp(fullPhone);
            setTimer(30);
            setCanResend(false);
            setLoginStep('mobile_otp');
          } catch (err: any) {
            setErrorMessage(err.message || 'Failed to trigger mobile SMS OTP.');
          } finally {
            setLoading(false);
          }
        } else {
          // Bypass mobile SMS verification, send to set_password step
          setLoginStep('set_password');
          setLoading(false);
        }
      } else {
        // Legacy user logging in for the first time without a password
        setLoginStep('set_password');
        setLoading(false);
      }
    } else {
      setErrorMessage('Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  // Verify SMS phone code
  const verifyMobileOtp = async () => {
    setLoading(true);
    setErrorMessage('');
    const enteredCode = mobileOtp.join('');

    if (enteredCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (auth && confirmationResult) {
      try {
        await confirmationResult.confirm(enteredCode);
        completeRegistration();
      } catch {
        setErrorMessage('Invalid SMS OTP. Please try again.');
        setLoading(false);
      }
    } else {
      setErrorMessage('Verification session not found. Please request a new SMS code.');
      setLoading(false);
    }
  };

  const completeRegistration = () => {
    setLoginStep('set_password');
  };

  // New Password Setup Handler
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const db = getFirebaseDb();
      const salt = Math.random().toString(36).substring(2, 11);
      const hash = await hashPassword(newPasswordInput, salt);
      const fullPhone = loginMobileCountry + loginMobile.trim();
      const formattedEmail = loginEmail.trim().toLowerCase();

      let profile = usersList.find((u) => u.email === formattedEmail);
      if (!profile) {
        profile = {
          uid: Math.random().toString(36).substring(2, 11),
          email: formattedEmail,
          name: loginName || formattedEmail.split('@')[0],
          role: 'USER',
          accountStatus: 'FREE_TIER',
          quizPassed: false,
          progress: { slidesViewed: {}, modulesCompleted: [], quizScores: {}, labsPassed: [], streakDays: 0, lastActiveDate: '', level: 1, xp: 0, badges: [] },
          mobile: fullPhone,
          emailVerified: true,
          mobileVerified: false,
          passwordHash: hash,
          passwordSalt: salt
        };
      } else {
        profile = {
          ...profile,
          passwordHash: hash,
          passwordSalt: salt,
          emailVerified: true
        };
      }

      if (db) {
        await set(ref(db, `users/${profile!.uid}`), profile);
      }

      login(formattedEmail, profile!.name, profile!.mobile || '', true, profile!.mobileVerified || false);
      addToast(isNewUser ? "Account registered successfully!" : "Password created successfully!", "success");
      setLoginStep('success');

      setTimeout(() => {
        setShowLoginModal(false);
        setLoginStep('input');
        setLoginEmail('');
        setLoginName('');
        setLoginMobile('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        navigate('/modules');
        setLoading(false);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(`Failed to save password: ${err.message || err}`);
      setLoading(false);
    }
  };

  // User Password Login Handler
  const handleUserPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    const formattedEmail = loginEmail.trim().toLowerCase();
    const existingUser = usersList.find((u) => u.email === formattedEmail);

    if (!existingUser || !existingUser.passwordHash || !existingUser.passwordSalt) {
      setErrorMessage('Account configuration mismatch. Please request a password reset.');
      setLoading(false);
      return;
    }

    try {
      const computed = await hashPassword(userPasswordInput, existingUser.passwordSalt);
      if (computed !== existingUser.passwordHash) {
        setErrorMessage('Incorrect password.');
        setLoading(false);
        return;
      }

      login(formattedEmail, existingUser.name, existingUser.mobile, true, existingUser.mobileVerified);
      addToast(`Welcome back, ${existingUser.name}!`, "success");
      setLoginStep('success');

      setTimeout(() => {
        setShowLoginModal(false);
        setLoginStep('input');
        setLoginEmail('');
        setLoginName('');
        setLoginMobile('');
        setUserPasswordInput('');
        navigate('/modules');
        setLoading(false);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(`Login failed: ${err.message || err}`);
      setLoading(false);
    }
  };

  // Forgot Password Code Generator & Dispatcher
  const handleForgotPasswordTrigger = async () => {
    setLoading(true);
    setErrorMessage('');
    
    const formattedEmail = loginEmail.trim().toLowerCase();
    const existingUser = usersList.find((u) => u.email === formattedEmail);
    
    const db = getFirebaseDb();
    let reviewerData: any = null;
    if (db) {
      try {
        const revSnap = await get(ref(db, 'reviewers'));
        if (revSnap.exists()) {
          const allRevs = revSnap.val() as Record<string, any>;
          const entry = Object.entries(allRevs).find(
            ([, r]: [string, any]) => (r.email || '').toLowerCase() === formattedEmail
          );
          if (entry) {
            reviewerData = entry[1];
          }
        }
      } catch {}
    }

    if (!existingUser && !reviewerData) {
      setErrorMessage('This email address is not registered.');
      setLoading(false);
      return;
    }

    try {
      let otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedResetOtp(otpCode);
      const name = existingUser?.name || reviewerData?.name || 'User';
      
      await sendEmailOtp(formattedEmail, otpCode, name);
      addToast("Password reset verification code sent to your email.", "success");
      setTimer(30);
      setCanResend(false);
      setLoginStep('forgot_password_verify');
    } catch (sendErr: any) {
      console.warn("Password reset email failed, falling back to simulated OTP toast:", sendErr);
      addToast(`🔑 [Verification Fallback] Sent Email OTP: ${generatedResetOtp}`, 'success');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Submit & Save
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = forgotPasswordOtp.join('');
    if (enteredCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      return;
    }
    if (enteredCode !== generatedResetOtp) {
      setErrorMessage('Invalid verification code. Please try again.');
      return;
    }
    if (newPasswordInput.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    const formattedEmail = loginEmail.trim().toLowerCase();
    const db = getFirebaseDb();
    if (!db) {
      setErrorMessage('Database connection unavailable.');
      setLoading(false);
      return;
    }

    try {
      const salt = Math.random().toString(36).substring(2, 11);
      const hash = await hashPassword(newPasswordInput, salt);

      const revSnap = await get(ref(db, 'reviewers'));
      let reviewerUid = '';
      if (revSnap.exists()) {
        const allRevs = revSnap.val() as Record<string, any>;
        const entry = Object.entries(allRevs).find(
          ([, r]: [string, any]) => (r.email || '').toLowerCase() === formattedEmail
        );
        if (entry) reviewerUid = entry[0];
      }

      if (reviewerUid) {
        await update(ref(db, `reviewers/${reviewerUid}`), {
          passwordHash: hash,
          passwordSalt: salt,
          mustChangePassword: false
        });
      } else {
        const existingUser = usersList.find((u) => u.email === formattedEmail);
        if (existingUser) {
          await update(ref(db, `users/${existingUser.uid}`), {
            passwordHash: hash,
            passwordSalt: salt
          });
        }
      }

      addToast("Password reset successfully! Please log in with your new password.", "success");
      setLoginStep('input');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setForgotPasswordOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setErrorMessage(`Failed to reset password: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      let otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedEmailOtp(otpCode);
      try {
        await sendEmailOtp(loginEmail.trim().toLowerCase(), otpCode, loginName || loginEmail.split('@')[0]);
        addToast("Verification email resent.", "success");
      } catch (sendErr: any) {
        console.warn("EmailJS resend failed, falling back to simulated OTP toast:", sendErr);
        addToast(`🔑 [Verification Fallback] Sent Email OTP: ${otpCode}`, 'success');
        addNotificationLog({
          type: 'Email OTP Verification Failure Fallback',
          recipient: loginEmail.trim().toLowerCase(),
          subject: '[Fallback] Resent OTP verification code',
          channel: `EmailJS API (Failed: ${sendErr?.text || (sendErr && JSON.stringify(sendErr)) || String(sendErr)})`,
          status: 'Failed'
        });
      }
      setTimer(30);
      setCanResend(false);
    } catch {
      setErrorMessage('Failed to resend email code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendMobile = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      const fullPhone = loginMobileCountry + loginMobile.trim();
      await sendPhoneOtp(fullPhone);
      setTimer(30);
      setCanResend(false);
      addToast("Verification SMS resent.", "success");
    } catch {
      setErrorMessage('Failed to resend SMS code.');
    } finally {
      setLoading(false);
    }
  };

  // Render digit boxes with auto focus jump controls
  const renderOtpInputs = (value: string[], onChange: (val: string[]) => void) => {
    const handleOtpChange = (element: HTMLInputElement, index: number) => {
      const val = element.value.replace(/[^0-9]/g, '');
      const newOtp = [...value];
      newOtp[index] = val.substring(val.length - 1);
      onChange(newOtp);

      if (val && element.nextElementSibling) {
        (element.nextElementSibling as HTMLInputElement).focus();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace') {
        if (!value[index] && e.currentTarget.previousElementSibling) {
          const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement;
          prevInput.focus();
          const newOtp = [...value];
          newOtp[index - 1] = '';
          onChange(newOtp);
        } else {
          const newOtp = [...value];
          newOtp[index] = '';
          onChange(newOtp);
        }
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
      if (text.length === 6) {
        const newOtp = text.split('');
        onChange(newOtp);
        const parent = e.currentTarget.parentElement;
        if (parent) {
          const lastInput = parent.children[5] as HTMLInputElement;
          lastInput?.focus();
        }
      }
    };

    return (
      <div className="flex justify-between gap-1.5 sm:gap-2 my-4">
        {value.map((digit, idx) => (
          <input
            key={idx}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target as HTMLInputElement, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={idx === 0 ? handlePaste : undefined}
            className="w-10 h-12 text-center text-xl font-bold bg-[var(--surface-sunken)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
          />
        ))}
      </div>
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--header-bg)] backdrop-blur-[20px] saturate-150 transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            {/* Icon badge */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {/* Brand name */}
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                OrchestrAI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-0.5">
                Lead Academy
              </span>
            </div>
          </Link>

          {/* Navigation Section */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/modules"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/modules')
                  ? 'bg-indigo-500/10 text-indigo-500'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Modules</span>
            </Link>

            <Link
              to="/resources"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/resources')
                  ? 'bg-indigo-500/10 text-indigo-500'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
              }`}
            >
              <Folder className="h-4 w-4" />
              <span>Resource Vault</span>
            </Link>

            {currentUser && (
              <Link
                to="/certification"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/certification')
                    ? 'bg-indigo-500/10 text-indigo-500'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
                }`}
              >
                <Award className="h-4 w-4" />
                <span>Certification</span>
              </Link>
            )}

            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SME' || currentUser?.isReviewer) && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-purple-500/10 text-purple-500'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Right Actions Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Gamification progress widget */}
            {currentUser && !currentUser.isReviewer && currentUser.role !== 'SME' && currentUser.role !== 'ADMIN' && <XPWidget />}

            {/* Database Sync Status pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
              dbStatus === 'connected'
                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                : dbStatus === 'testing'
                ? 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400'
                : 'border-slate-500/25 bg-slate-500/5 text-[var(--text-secondary)]'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                dbStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : dbStatus === 'testing' ? 'bg-yellow-400' : 'bg-slate-400'
              }`} />
              <span>{dbStatus === 'connected' ? 'Synced' : dbStatus === 'testing' ? 'Syncing...' : 'Local'}</span>
            </div>

            {/* Theme Toggle — compact icon-only segmented control */}
            <div className="flex items-center gap-0.5 border border-[var(--border-color)] p-0.5 rounded-full bg-slate-500/5">
              {([
                { mode: 'light' as const, Icon: Sun, label: 'Light Mode', active: 'bg-white text-indigo-600 shadow-sm' },
                { mode: 'dark' as const, Icon: Moon, label: 'Dark Mode', active: 'bg-indigo-600 text-white shadow-sm' },
                { mode: 'glass' as const, Icon: Sparkles, label: 'Glass Mode', active: 'glass-active-pill' },
              ]).map(({ mode, Icon, label, active }) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  title={label}
                  aria-label={label}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                    theme === mode ? active : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            {/* User menu (avatar dropdown) or Login */}
            {currentUser ? (
              <div className="relative" style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu((o) => !o)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-extrabold shadow-md shadow-indigo-500/25 ring-1 ring-white/15 hover:brightness-110 transition-all"
                  title={currentUser.name}
                  aria-label="Account menu"
                >
                  {initials}
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div 
                      className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-32px)] z-50 glass-card rounded-2xl p-4 animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-200"
                      style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px' }}
                    >
                      {/* Identity */}
                      <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[var(--border-color)]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-extrabold shadow ring-1 ring-white/15">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[var(--text-primary)] leading-snug break-words">{currentUser.name}</p>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">{currentUser.email}</p>
                        </div>
                      </div>

                      {/* Role badge */}
                      <div className="flex items-center justify-between px-1 mb-3">
                        <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Role</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          currentUser.role === 'ADMIN'
                            ? 'bg-purple-500/10 border-purple-500/25 text-purple-400'
                            : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                        }`}>
                          {currentUser.role}
                        </span>
                      </div>

                      <button
                        onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                        className="w-full flex items-center justify-center gap-2 py-2 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold transition-all"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </button>
            )}

          </div>
        </div>

        {/* Responsive Navigation Menu for Mobile Devices */}
        <div className="flex md:hidden items-center justify-around border-t border-[var(--border-color)] py-2 bg-slate-500/5">
          <Link to="/modules" className={`text-xs font-semibold ${isActive('/modules') ? 'text-indigo-500' : 'text-[var(--text-secondary)]'}`}>
            Modules
          </Link>
          <Link to="/resources" className={`text-xs font-semibold ${isActive('/resources') ? 'text-indigo-500' : 'text-[var(--text-secondary)]'}`}>
            Vault
          </Link>
          {currentUser && (
            <Link to="/certification" className={`text-xs font-semibold ${isActive('/certification') ? 'text-indigo-500' : 'text-[var(--text-secondary)]'}`}>
              Certification
            </Link>
          )}
          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SME' || currentUser?.isReviewer) && (
            <Link to="/admin" className={`text-xs font-semibold ${isActive('/admin') ? 'text-purple-500' : 'text-[var(--text-secondary)]'}`}>
              Admin Settings
            </Link>
          )}
          {currentUser && (
            <button
              onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* Sign In Dialog (Rendered OUTSIDE <header> to prevent backdrop-blur containing block truncation) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-overlay)] backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-sm rounded-2xl p-7 sm:p-8 animate-in fade-in zoom-in-95 duration-200 relative">

            {/* Invisible Recaptcha Anchor for Firebase Phone Auth */}
            <div id="recaptcha-container" className="hidden"></div>

            {/* Close */}
            <button
              onClick={() => setShowLoginModal(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Brand mark + welcome */}
            {loginStep !== 'success' && (
              <div className="flex flex-col items-center text-center mb-5">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3.5">
                  <Sparkles className="h-5.5 w-5.5 text-white" />
                </div>
                <h3 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  {loginStep === 'input' && (authMode === 'login' ? 'Welcome back' : 'Create Account')}
                  {loginStep === 'email_otp' && 'Email Verification'}
                  {loginStep === 'mobile_otp' && 'Mobile Verification'}
                  {loginStep === 'password_input' && 'Welcome back'}
                  {loginStep === 'set_password' && 'Secure Your Account'}
                  {loginStep === 'forgot_password_verify' && 'Reset Password'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-[260px]">
                  {loginStep === 'input' && (authMode === 'login' ? 'Log in with your email to access your workspace.' : 'Sign up to track certifications and milestones.')}
                  {loginStep === 'email_otp' && (
                    !(systemConfig.emailjsServiceId && systemConfig.emailjsTemplateId && systemConfig.emailjsPublicKey)
                      ? `[Simulation Mode] Since EmailJS is not configured, please enter code: ${generatedEmailOtp}`
                      : 'Confirm the code sent to your email to verify your identity.'
                  )}
                  {loginStep === 'mobile_otp' && 'Enter the SMS code sent to your mobile phone.'}
                  {loginStep === 'password_input' && 'Enter your password to sign in to your workspace.'}
                  {loginStep === 'set_password' && 'Create a password for fast login next time.'}
                  {loginStep === 'forgot_password_verify' && (
                    !(systemConfig.emailjsServiceId && systemConfig.emailjsTemplateId && systemConfig.emailjsPublicKey)
                      ? `[Simulation Mode] Reset OTP code: ${generatedResetOtp}`
                      : 'Confirm the code sent to your email to complete password reset.'
                  )}
                </p>
              </div>
            )}

            {/* Step 1: Input Credentials Form */}
            {loginStep === 'input' && (
              <>
                {/* Segmented Auth Mode Switcher */}
                <div className="flex p-0.5 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-color)] mb-5">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={checkEmailAndProceed} className="space-y-3.5">
                  {authMode === 'register' && (
                    <div className="space-y-3.5 animate-in slide-in-from-top-3 duration-200">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                          <input
                            type="text"
                            required
                            placeholder="Enter your name"
                            value={loginName}
                            onChange={(e) => setLoginName(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="you@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <div className="space-y-3.5 pt-0.5 animate-in slide-in-from-top-3 duration-200">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                          Mobile Number
                        </label>
                        <div className="flex gap-2">
                          <div className="flex items-center px-3.5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-xs text-[var(--text-primary)] font-semibold select-none">
                            +91 (IN)
                          </div>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                            <input
                              type="tel"
                              required
                              placeholder="98765 43210"
                              value={loginMobile}
                              maxLength={10}
                              onChange={(e) => setLoginMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                          Required for certifications and future job matches.
                        </p>
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {authMode === 'register' ? 'Verify & Register' : 'Continue'} <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Admin access (Only visible in local Development Mode) */}
                {import.meta.env.DEV && (
                  <>
                    {/* Divider */}
                    <div className="relative flex py-4 items-center">
                      <div className="flex-grow border-t border-[var(--border-color)]"></div>
                      <span className="flex-shrink mx-3 text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">or</span>
                      <div className="flex-grow border-t border-[var(--border-color)]"></div>
                    </div>

                    <button
                      type="button"
                      onClick={triggerSeedAdmin}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--border-color)] hover:border-purple-500/40 hover:bg-purple-500/5 text-[var(--text-primary)] rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Shield className="h-4 w-4 text-purple-500" /> Continue as Admin
                    </button>
                  </>
                )}

                {authMode === 'login' && (
                  <div className="text-center mt-3 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!loginEmail.trim()) {
                          setErrorMessage('Please enter your email address first to reset your password.');
                          return;
                        }
                        handleForgotPasswordTrigger();
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                    >
                      Forgot / Reset Password?
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-center text-[var(--text-muted)] mt-5 leading-relaxed">
                  We verify your details to keep your certification progress secure.
                </p>
              </>
            )}

            {/* Step: SME Change Password */}
            {loginStep === 'sme_change_password' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Change Temporary Password</h3>
                  <p className="text-xs text-yellow-500 mt-1.5 leading-normal">
                    ⚠️ You are logging in with a temporary password. You must set a new password before you can access the admin dashboard.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSmeNewPassword ? "text" : "password"}
                        placeholder="New Password (min 6 chars)"
                        value={smeNewPassword}
                        onChange={(e) => setSmeNewPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmeNewPassword(!showSmeNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                      >
                        {showSmeNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={smeConfirmPassword}
                      onChange={(e) => setSmeConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSmeChangePassword();
                        }
                      }}
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSmeChangePassword}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow hover:brightness-110 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save & Login'}
                </button>

                <div className="text-center text-xs mt-4 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('input');
                      setErrorMessage('');
                      setSmePasswordInput('');
                      setSmeNewPassword('');
                      setSmeConfirmPassword('');
                      setSmeReviewerInfo(null);
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Step: SME Reviewer Password */}
            {loginStep === 'sme_password' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    Reviewer Account Detected. Please enter your password for:
                  </p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 break-all">{loginEmail}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSmePassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={smePasswordInput}
                      onChange={(e) => setSmePasswordInput(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          verifySmePassword();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmePassword(!showSmePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                    >
                      {showSmePassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={verifySmePassword}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow hover:brightness-110 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verify Password & Login'}
                </button>

                <div className="text-center text-xs mt-4 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('input');
                      setErrorMessage('');
                      setSmePasswordInput('');
                      setSmeReviewerInfo(null);
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Back to email
                  </button>
                </div>
              </div>
            )}

            {/* Step: Admin Password Bypass */}
            {loginStep === 'admin_password' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    Please enter the administrator password for:
                  </p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 break-all">{loginEmail}</p>
                  {(!systemConfig.adminPassword || systemConfig.adminPassword.trim() === '') && (
                    <div className="mt-2.5 p-2.5 rounded-lg border border-yellow-500/25 bg-yellow-500/10 text-left">
                      <p className="text-[10px] text-yellow-500 font-bold leading-normal">
                        ⚠️ No password has been configured yet in your database settings. Please enter the default password <span className="font-mono bg-yellow-500/20 px-1 py-0.5 rounded text-[11px] font-extrabold select-all">admin</span> to log in and set one.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          verifyAdminPassword();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                    >
                      {showAdminPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={verifyAdminPassword}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow hover:brightness-110 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verify Password & Login'}
                </button>

                <div className="text-center text-xs mt-4 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('input');
                      setErrorMessage('');
                      setAdminPasswordInput('');
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Back to email
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Email OTP */}
            {loginStep === 'email_otp' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Enter the 6-digit verification code sent to:
                  </p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 break-all">{loginEmail}</p>
                </div>

                {renderOtpInputs(emailOtp, setEmailOtp)}

                {errorMessage && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={verifyEmailOtp}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow hover:brightness-110 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verify Email Code'}
                </button>

                <div className="flex items-center justify-between text-xs mt-4 pt-1">
                  <button
                    type="button"
                    onClick={() => setLoginStep('input')}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Back to email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={!canResend || loading}
                    className="text-indigo-400 hover:text-indigo-300 disabled:text-[var(--text-muted)] disabled:no-underline font-semibold transition-colors"
                  >
                    {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Mobile OTP */}
            {loginStep === 'mobile_otp' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Enter the 6-digit SMS code sent to:
                  </p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{loginMobileCountry} {loginMobile}</p>
                </div>

                {renderOtpInputs(mobileOtp, setMobileOtp)}

                {errorMessage && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={verifyMobileOtp}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow hover:brightness-110 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verify SMS Code'}
                </button>

                <div className="flex items-center justify-between text-xs mt-4 pt-1">
                  <button
                    type="button"
                    onClick={() => setLoginStep('input')}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResendMobile}
                    disabled={!canResend || loading}
                    className="text-purple-400 hover:text-purple-300 disabled:text-[var(--text-muted)] disabled:no-underline font-semibold transition-colors"
                  >
                    {canResend ? 'Resend SMS' : `Resend in ${timer}s`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success Screen */}
            {loginStep === 'success' && (
              <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-[var(--text-primary)]">Identity Verified!</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    Welcome to OrchestrAI Lead Academy.<br />Setting up your certified workspace...
                  </p>
                </div>
              </div>
            )}

            {/* Step: User Password Login */}
            {loginStep === 'password_input' && (
              <form onSubmit={handleUserPasswordLogin} className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    Log in with password for:
                  </p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 break-all">{loginEmail}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showUserPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={userPasswordInput}
                      onChange={(e) => setUserPasswordInput(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                    >
                      {showUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow hover:brightness-110 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Log In'}
                </button>

                <div className="flex items-center justify-between text-xs mt-4 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('input');
                      setErrorMessage('');
                      setUserPasswordInput('');
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Back to email
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPasswordTrigger}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            )}

            {/* Step: Set Password */}
            {loginStep === 'set_password' && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[260px] mx-auto">
                    Please create a password to log in instantly next time without waiting for email OTPs.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Create Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Choose password (min 6 characters)"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow hover:brightness-110 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save & Log In'}
                </button>
              </form>
            )}

            {/* Step: Forgot Password Verification */}
            {loginStep === 'forgot_password_verify' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Enter the reset verification code sent to:
                  </p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 break-all">{loginEmail}</p>
                </div>

                {renderOtpInputs(forgotPasswordOtp, setForgotPasswordOtp)}

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Choose new password (min 6 characters)"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow hover:brightness-110 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Reset & Save Password'}
                </button>

                <div className="text-center text-xs mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('input');
                      setErrorMessage('');
                      setForgotPasswordOtp(['', '', '', '', '', '']);
                      setNewPasswordInput('');
                      setConfirmPasswordInput('');
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Cancel Reset
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
};
