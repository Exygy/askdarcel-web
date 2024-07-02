import React from "react";
import { useCookies } from "react-cookie";
import { Helmet } from "react-helmet-async";

export const GoogleTranslate = ({
  languages,
  queryLangCode,
}: {
  languages: readonly string[];
  queryLangCode: string | null;
}) => {
  const [, setCookie] = useCookies(["googtrans"]);

  // Creating multiple instances of the widget to render into both mobile and desktop menu views seems to be the only
  // way to gaurantee that the widget is rendered into multiple divs in the DOM wihin our current component hierarchy
  // and conditional render logic for the navigation menus.
  const WIDGET_ID = Math.random().toString(20).substring(2, 6);

  if (languages.length > 0) {
    // Google Translate determines translation source and target
    // with a "googtrans" cookie.
    // When the user navigates with a `lang` query param,
    // interpret that as an explicit ask to translate the site
    // into that target language.
    if (queryLangCode && languages.includes(queryLangCode)) {
      setCookie("googtrans", `/en/${queryLangCode}`, { path: "/" });
    }

    return (
      <li>
        <Helmet>
          <script type="text/javascript">
            {`
              function googleTranslateElementInit_${WIDGET_ID}() {
                new google.translate.TranslateElement({
                  includedLanguages: '${languages.join(",")}',
                  pageLanguage: 'en',
                }, 'google_translate_element_${WIDGET_ID}');
              }
            `}
          </script>
          <script
            type="text/javascript"
            src={`//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit_${WIDGET_ID}`}
          />
        </Helmet>
        <div id={`google_translate_element_${WIDGET_ID}`} />
      </li>
    );
  }

  return null;
};
