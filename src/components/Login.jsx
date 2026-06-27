import { useEffect, useRef, useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";
import loginBanner from "../assets/loginMainImage.png";
import logo from "../assets/Bigil_Logo.png";
import { MdLocalPhone } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const RESEND_COOLDOWN_SECONDS = 30;

// Turns Firebase's internal error codes into something a person filing a
// complaint can actually act on.
function mapAuthError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/too-many-requests":
      return "Too many attempts from this device. Please wait a few minutes before trying again.";
    case "auth/invalid-phone-number":
      return "That doesn't look like a valid mobile number.";
    case "auth/quota-exceeded":
      return "We've hit our SMS sending limit right now. Please try again in a little while.";
    case "auth/code-expired":
      return 'This OTP has expired. Tap "Resend OTP" to get a new one.';
    case "auth/invalid-verification-code":
      return "That OTP doesn't look right. Please check and try again.";
    case "auth/missing-verification-code":
      return "Please enter the OTP sent to your phone.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    case "auth/captcha-check-failed":
      return "We couldn't verify you're not a robot. Please refresh the page and try again.";
    default: {
      const message = err?.message || "";
      if (message.includes("Hostname match not found")) {
        return "This domain is not authorized for Firebase phone verification. Please add the current site domain in Firebase Authentication settings and try again.";
      }
      return message || "Something went wrong. Please try again.";
    }
  }
}

export default function OtpLogin() {
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const recaptchaRef = useRef(null);
  const confirmationRef = useRef(null);

  // Countdown for the "Resend OTP" button.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" },
      );

      window.recaptchaVerifier.render();
    }

    recaptchaRef.current = window.recaptchaVerifier;

    return () => {
      // only cleanup on FULL page exit (not edit number)
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // 📲 SEND OTP (also used for "Resend OTP")
  const sendOtp = async () => {
    setError("");
    setMessage("");
    if (!recaptchaRef.current) {
      setError("reCAPTCHA not ready. Refresh page.");
      return;
    }
    const digits = (phone || "").replace(/\D/g, "").replace(/^91/, "");
    if (!phone || digits.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    try {
      setLoading(true);
      // await ensureFreshRecaptcha();
      const appVerifier = recaptchaRef.current || window.recaptchaVerifier;
      console.log("PHONE:", phone);
      console.log("APP VERIFIER:", appVerifier);
      console.log("AUTH:", auth);
      console.log("RECAPTCHA TYPE:", appVerifier?.constructor?.name);

      if (!appVerifier) {
        setError("reCAPTCHA not initialized. Refresh page.");
        return;
      }

      const result = await signInWithPhoneNumber(auth, phone, appVerifier);

      confirmationRef.current = result;

      setOtp("");
      setStep("otp");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setMessage("OTP sent. Please check your phone for the SMS.");
    } catch (err) {
      console.error("OtpLogin: sendOtp failed:", err);
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // 🔐 VERIFY OTP
  const verifyOtp = async () => {
    setError("");
    setMessage("");
    if (!otp) {
      setError("Enter the OTP sent to your phone.");
      return;
    }
    if (!confirmationRef.current) {
      setError("Your OTP session has expired. Please resend the OTP.");
      return;
    }
    try {
      setLoadingVerify(true);
      await confirmationRef.current.confirm(otp);
      setMessage("Login successful! Redirecting...");
      navigate("/home");
    } catch (err) {
      console.error("OtpLogin: verifyOtp failed:", err);
      setError(mapAuthError(err));
    } finally {
      setLoadingVerify(false);
    }
  };

  const onKeyDownPhone = (e) => {
    if (e.key === "Enter") sendOtp();
  };

  const onKeyDownOtp = (e) => {
    if (e.key === "Enter") verifyOtp();
  };

  return (
    <>
      <Header />
      <div className=" flex items-center justify-center md:p-4">
        <div className="relative w-full max-w-7xl mx-auto px-4">
          <div id="recaptcha-container" className="hidden" />
          <img
            src={loginBanner}
            alt="Logo"
            className="md:w-[87%] w-full h-auto rounded-2xl object-cover"
          />
          <div className="w-full mt-6 md:absolute md:top-1/2 md:right-[0%]  md:-translate-y-1/2 md:w-[320px] lg:w-[380px] xl:w-[420px]">
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
              {/* <h2 className="text-2xl font-bold mb-6">Login</h2> */}
              <div className="flex justify-center mb-6">
              <img src={logo} alt="Login" className="max-w-[105px] h-auto hidden md:block rounded-2xl object-cover" />

              </div>



              <label className="block mb-2 text-gray-700">Mobile Number</label>
              <div className="relative mb-2">
                <MdLocalPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C89292] text-xl" />

                <div className="absolute left-11 top-1/2 -translate-y-1/2 h-5 w-px bg-[#C89292]" />

                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={phone}
                  disabled={step === "otp"}
                  onChange={(e) => {
                    let val = e.target.value || "";
                    val = val.replace(/\s+/g, "");
                    if (!val.startsWith("+91")) {
                      const digits = val
                        .replace(/^\+?91/, "")
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setPhone("+91" + digits);
                    } else {
                      const rest = val.slice(3).replace(/\D/g, "").slice(0, 10);
                      setPhone("+91" + rest);
                    }
                  }}
                  onFocus={() => {
                    if (!phone || !phone.startsWith("+91")) setPhone("+91");
                  }}
                  onKeyDown={(e) => {
                    if (
                      (e.key === "Backspace" || e.key === "Delete") &&
                      e.currentTarget.selectionStart <= 3
                    ) {
                      e.preventDefault();
                    }
                    onKeyDownPhone(e);
                  }}
                  className="w-full border rounded-lg pl-14 pr-4 py-3 bg-[#F8ECEC] text-[#C89292] disabled:opacity-70"
                />
              </div>

              {/* OTP status / error feedback — this was being computed before
                  but never actually shown to the user. */}
              {error && (
                <p className="text-red-600 text-sm mb-3" role="alert">
                  {error}
                </p>
              )}
              {!error && message && (
                <p className="text-green-700 text-sm mb-3" role="status">
                  {message}
                </p>
              )}

              {step === "phone" && (
                <button
                  className="w-full bg-[#7B0200] text-white py-3 rounded-lg hover:bg-[#9b0704] disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={sendOtp}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              )}

              {step === "otp" && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    onKeyDown={onKeyDownOtp}
                    className="w-full border rounded-lg pr-4 py-3 bg-[#F8ECEC] text-[#C89292] mb-3"
                  />
                  <button
                    className="w-full bg-[#7B0200] text-white py-3 rounded-lg hover:bg-[#9b0704] mb-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={verifyOtp}
                    disabled={loadingVerify}
                  >
                    {loadingVerify ? "Verifying..." : "Verify OTP"}
                  </button>

                  <button
                    className="w-full border border-[#7B0200] text-[#7B0200] py-2 rounded-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={sendOtp}
                    disabled={resendCooldown > 0 || loading}
                  >
                    {loading
                      ? "Sending..."
                      : resendCooldown > 0
                        ? `Resend OTP in ${resendCooldown}s`
                        : "Resend OTP"}
                  </button>

                  <button
                    className="w-full bg-gray-200 text-[#7B0200] py-2 rounded-lg"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError("");
                      setMessage("");
                      setResendCooldown(0);
                      confirmationRef.current = null;
                    }}
                  >
                    Edit Number
                  </button>
                </div>
              )}

              <p className="text-[12px] text-[#A56B6B] mt-4 text-center font-medium leading-4">
                We will send a one-time code to verify your number. Standard SMS
                rates may apply.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
