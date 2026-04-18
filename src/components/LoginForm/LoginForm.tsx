import ConfirmModal from "@/components/ConfirmModal";
import { useLogin } from "@/features/auth";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import styles from "./LoginForm.module.scss";

const PHONE_REGEX = /^0\d{9,10}$/;

export default function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const { mutate: login, isPending } = useLogin();

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    let isValid = true;
    const normalizedPhone = phoneNumber.trim();

    if (!PHONE_REGEX.test(normalizedPhone)) {
      setPhoneError(
        "Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số và bắt đầu bằng số 0.",
      );
      isValid = false;
    } else {
      setPhoneError("");
    }

    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) {
      if (!PHONE_REGEX.test(normalizedPhone)) {
        phoneInputRef.current?.focus();
      } else {
        passwordInputRef.current?.focus();
      }
    }

    return isValid;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPending) {
      return;
    }

    if (!validate()) {
      return;
    }

    login({
      phoneNumber: phoneNumber.trim(),
      password,
      idDevice: navigator.userAgent,
    });
  };

  const canSubmit = phoneNumber.trim().length > 0 && password.length > 0;

  const openSupportModal = () => {
    setIsSupportModalOpen(true);
  };

  const closeSupportModal = () => {
    setIsSupportModalOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Số điện thoại */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="phoneNumber">
            Số điện thoại
          </label>
          <div className={styles.inputWrapper}>
            <Phone className={styles.inputIcon} />
            <input
              ref={phoneInputRef}
              id="phoneNumber"
              type="tel"
              className={`${styles.formInput} ${phoneError ? styles.inputError : ""}`}
              placeholder="Nhập số điện thoại"
              value={phoneNumber}
              onChange={(e) => {
                const normalized = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 11);
                setPhoneNumber(normalized);
                if (phoneError) {
                  setPhoneError("");
                }
              }}
              inputMode="numeric"
              autoComplete="tel"
              aria-invalid={!!phoneError}
              aria-describedby="phoneNumber-help phoneNumber-error"
              required
            />
          </div>
          <p id="phoneNumber-help" className={styles.helpText}>
            Số điện thoại gồm 10-11 chữ số.
          </p>
          {phoneError ? (
            <p id="phoneNumber-error" className={styles.errorText}>
              {phoneError}
            </p>
          ) : null}
        </div>

        {/* Mật khẩu */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="password">
            Mật khẩu
          </label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} />
            <input
              ref={passwordInputRef}
              id="password"
              type={showPassword ? "text" : "password"}
              className={`${styles.formInput} ${styles.passwordInput} ${passwordError ? styles.inputError : ""}`}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) {
                  setPasswordError("");
                }
              }}
              autoComplete="current-password"
              aria-invalid={!!passwordError}
              aria-describedby="password-help password-error"
              required
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <p id="password-help" className={styles.helpText}>
            Mật khẩu tối thiểu 6 ký tự.
          </p>
          {passwordError ? (
            <p id="password-error" className={styles.errorText}>
              {passwordError}
            </p>
          ) : null}
          <div className={styles.forgotPassword}>
            <a
              href="#"
              className={styles.forgotLink}
              onClick={(event) => {
                event.preventDefault();
                openSupportModal();
              }}
            >
              Quên mật khẩu?
            </a>
          </div>
        </div>

        {/* Nút đăng nhập */}
        <button
          type="submit"
          className={styles.loginButton}
          disabled={isPending || !canSubmit}
        >
          {isPending ? (
            <span className={styles.loadingContent}>
              <svg className={styles.spinner} viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="60"
                  strokeDashoffset="20"
                />
              </svg>
              Đang đăng nhập...
            </span>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      <ConfirmModal
        open={isSupportModalOpen}
        title="Cần hỗ trợ đăng nhập?"
        description="Nếu bạn quên mật khẩu hoặc chưa có tài khoản, vui lòng liên hệ Zalo số 036 9222 068 để được hỗ trợ nhanh."
        cancelText="Đóng"
        confirmText="Đã hiểu"
        onCancel={closeSupportModal}
        onConfirm={closeSupportModal}
        showSuccessToastOnConfirm={false}
        showErrorToastOnFail={false}
      />
    </>
  );
}
