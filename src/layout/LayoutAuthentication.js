import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const AuthenticationStyles = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  background: var(--color-bg);
  color: var(--color-text);
  .auth__logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 700;
    img {
      width: 32px;
    }
  }
  /* Brand panel: desktop only */
  .auth__brand {
    display: none;
  }
  .auth__main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 32px;
    padding: 48px 24px;
  }
  .auth__main .auth__logo {
    color: ${(props) => props.theme.primary};
  }
  .auth__panel {
    width: 100%;
    max-width: 400px;
  }
  .auth__title {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.25;
  }
  .auth__subtitle {
    margin-top: 8px;
    font-size: 15px;
    line-height: 1.5;
    color: var(--color-muted);
  }
  .auth__body {
    margin-top: 32px;
  }
  .auth__divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
    font-size: 13px;
    color: var(--color-muted);
    &::before,
    &::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--color-border);
    }
  }
  .auth__label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }
  .auth__link {
    display: inline;
    font-size: 14px;
    font-weight: 500;
    color: ${(props) => props.theme.primary};
  }
  .auth__link:hover {
    text-decoration: underline;
  }
  button.auth__link {
    padding: 0;
    border: 0;
    background: none;
    font-family: inherit;
    cursor: pointer;
  }
  .auth__hint {
    font-size: 13px;
    color: var(--color-muted);
  }
  .auth__submit {
    width: 100%;
    min-width: 0;
    height: 48px;
    margin-top: 8px;
    font-size: 16px;
  }
  .auth__switch {
    margin-top: 24px;
    text-align: center;
    font-size: 14px;
    color: var(--color-muted);
  }
  .auth__back {
    font-size: 14px;
    color: var(--color-muted);
  }
  .auth__back:hover {
    color: var(--color-text);
  }
  @media only screen and (min-width: 1024px) {
    grid-template-columns: minmax(380px, 5fr) 7fr;
    .auth__brand {
      overflow: hidden;
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 48px;
      color: white;
      background:
        radial-gradient(
          circle at 15% 10%,
          rgba(255, 255, 255, 0.18),
          transparent 45%
        ),
        linear-gradient(
          150deg,
          ${(props) => props.theme.primary} 0%,
          #1d4f86 55%,
          #0d2645 100%
        );
    }
    .auth__brand-decorator {
      position: absolute;
      width: 180%;
      left: 50%;
      top: 50%;
      transform: translate(-42%, -50%) rotate(-15deg);
      opacity: 0.4;
      z-index: -1;
      filter: blur(10px);
    }
    .auth__main > .auth__logo {
      display: none;
    }
    /* The blue logo needs a light tile to stand out on the blue panel */
    .auth__brand .auth__logo img {
      width: 36px;
      padding: 5px;
      border-radius: 8px;
      /* background: white; */
    }
  }
  .auth__pitch h2 {
    max-width: 440px;
    font-size: 34px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .auth__pitch ul {
    display: grid;
    gap: 16px;
    margin-top: 32px;
  }
  .auth__pitch li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 16px;
    line-height: 1.5;
    opacity: 0.92;
  }
  .auth__check {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 100rem;
    background: rgba(255, 255, 255, 0.18);
    font-size: 12px;
  }
  .auth__copy {
    font-size: 13px;
    opacity: 0.7;
  }
`;

const perks = [
  "Follow writers you like and hear when they publish",
  "Save posts to read later, on any device",
  "Write and publish your own stories",
];

// Sign in, sign up and password reset: a brand panel beside the form on
// desktop, just the form on smaller screens
const LayoutAuthentication = ({ title, subtitle, children }) => {
  return (
    <AuthenticationStyles>
      <aside className="auth__brand">
        <img className="auth__brand-decorator" srcSet="/logo.png" alt="" />
        <Link to="/" className="auth__logo">
          <img srcSet="/logo.png 2x" alt="" />
          Veldora Blog
        </Link>
        <div className="auth__pitch">
          <h2>Stories and ideas from people who build things.</h2>
          <ul>
            {perks.map((perk) => (
              <li key={perk}>
                <span className="auth__check" aria-hidden="true">
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <p className="auth__copy">© {new Date().getFullYear()} Veldora Blog</p>
      </aside>
      <main className="auth__main">
        <Link to="/" className="auth__logo">
          <img srcSet="/logo.png 2x" alt="" />
          Veldora Blog
        </Link>
        <div className="auth__panel">
          <h1 className="auth__title">{title}</h1>
          {subtitle && <p className="auth__subtitle">{subtitle}</p>}
          <div className="auth__body">{children}</div>
        </div>
        <Link to="/" className="auth__back">
          ← Back to the blog
        </Link>
      </main>
    </AuthenticationStyles>
  );
};

export default LayoutAuthentication;
