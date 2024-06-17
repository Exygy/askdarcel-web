import React from "react";
import styles from "./EmailSignup.module.scss";

/* 
TODO:
- Get working with recaptcha
- Add success message
- Add styles
*/

export const EmailSignup = () => (
  <div className={styles.emailSignupContainer}>
    <div className={styles.emailForm}>
      <form
        action="https://app.e2ma.net/app2/audience/signup/1933232/1923816/?r=signup"
        method="post"
        id="emma_signup_form"
        acceptCharset="utf-8"
        target="emma_signup_iframe"
      >
        <input type="hidden" name="subscriber_consent_email" value="false" />
        <input type="hidden" name="subscriber_consent_tracking" value="false" />
        <input type="hidden" name="checked_subscriptions" value="" />
        <input type="hidden" name="e2ma_field_enable_recaptcha" value="false" />
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Your email address"
          required
        />
        <button type="submit">Subscribe</button>
      </form>
      {/* TODO: test if this is necessary: */}
      <iframe
        style={{ display: "none" }}
        name="emma_signup_iframe"
        title="Emma Signup Iframe"
      />
    </div>
  </div>
);
