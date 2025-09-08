import { LANGUAGE_TO_FLAG } from "../constant/index.ts";
type LanguageKey = keyof typeof LANGUAGE_TO_FLAG;

export function getLanguageFlag(language:string | undefined) {
  if (!language) return null;

  const langLower = language.toLowerCase()  as LanguageKey;
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="inline-block h-3 mr-1"
      />
    );
  }
  return null;
}
