import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import "./login.css";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      general: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors((previous) => ({ ...previous, general: "" }));

    try {
      // Public registration always creates a parent. No role is sent.
      const registerResponse = await fetch(
        "http://localhost:8000/accounts/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
          }),
        }
      );

      const registerData = await registerResponse.json().catch(() => ({}));

      if (!registerResponse.ok) {
        const fieldErrors = {};
        Object.keys(registerData).forEach((key) => {
          if (Array.isArray(registerData[key])) {
            fieldErrors[key] = registerData[key][0];
          }
        });
        setErrors((previous) => ({
          ...previous,
          ...fieldErrors,
          general:
            registerData.detail ||
            "Unable to create account. Please try again.",
        }));
        return;
      }

      // Registration does not return tokens; use the existing login flow.
      const loginResponse = await fetch("http://localhost:8000/accounts/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json().catch(() => ({}));

      if (!loginResponse.ok) {
        setErrors((previous) => ({
          ...previous,
          general:
            loginData.detail || "Account created. Please sign in to continue.",
        }));
        return;
      }

      if (loginData.access) {
        localStorage.setItem("accessToken", loginData.access);
      }
      if (loginData.refresh) {
        localStorage.setItem("refreshToken", loginData.refresh);
      }
      if (loginData.user) {
        localStorage.setItem("user", JSON.stringify(loginData.user));
        login(loginData.user);
      }

      navigate("/parent/dashboard", { replace: true });
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        general: "Unable to create account. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand">
          <div className="brand-symbol">N</div>
          <span>NeuroCare</span>
        </div>

        <div className="visual-content">
          <span className="visual-tag">A better way to grow</span>

          <h1>
            Every mind is unique.
            <br />
            Every journey matters.
          </h1>

          <p>
            A connected platform bringing families, educators and
            consultants together to support every child's development.
          </p>

          <div className="visual-illustration" aria-hidden="true">
            <div className="illustration-circle circle-one"></div>
            <div className="illustration-circle circle-two"></div>
            <div className="illustration-card">
              <div className="illustration-icon">✦</div>
              <span>Learn</span>
              <span>Grow</span>
              <span>Thrive</span>
            </div>
          </div>
        </div>

        <div className="visual-footer">
          Supporting every step of the journey.
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-container">
          <div className="mobile-brand">
            <div className="brand-symbol">N</div>
            <span>NeuroCare</span>
          </div>

          <div className="auth-heading">
            <span className="auth-eyebrow">GET STARTED</span>
            <h2>Create your parent account</h2>
            <p>
              Enter your details below to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="first_name">First name</label>

              <input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
                autoComplete="given-name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last name</label>

              <input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleChange}
                autoComplete="family-name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />

              {errors.email && (
                <span className="form-error" id="email-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
              </div>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <span className="form-error" id="password-error">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? "confirm-error" : undefined
                }
              />

              {errors.confirmPassword && (
                <span className="form-error" id="confirm-error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {errors.general && (
              <span className="form-error" id="general-error">
                {errors.general}
              </span>
            )}

            <button type="submit" className="auth-submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

          <p className="auth-legal">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
