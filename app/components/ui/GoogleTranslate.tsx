/* eslint-disable react-hooks/exhaustive-deps -- allows empty array argument in useEffect */
/* eslint-disable no-new -- allows calling `new` for initializer */
import React, { useEffect } from "react";

/**
 * A Google translate widget component for use across multiple components
 *
 * Normally it is difficult to mount a widget like this into multiple components or HTML targets. By dynamically
 * adding the third-party scripts and initializing on demand, we can render the widget into both desktop and mobile
 * navigation view.
 */
declare const window: {
  googleTranslateElementInit: () => void;
} & Window;

export const GoogleTranslate = () => {
  const languages = ["en", "es", "tl", "zh-TW"];

  useEffect(() => {
    function googleTranslateElementInit() {
      new (window as any).google.translate.TranslateElement(
        {
          includedLanguages: `${languages.join(",")}`,
          pageLanguage: "auto/en",
        },
        "google_translate_element"
      );
    }

    const addScript = document.createElement("script");
    addScript.setAttribute(
      "src",
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    );
    document.body.appendChild(addScript);
    window.googleTranslateElementInit = googleTranslateElementInit;
  }, []);

  return <div id="google_translate_element" />;
};
