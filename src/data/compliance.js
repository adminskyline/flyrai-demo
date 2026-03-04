import { COMPLIANCE } from "./constants";

const RULE_VALIDATORS = {
  "Full legal name":                   (p) => !!p.name?.trim(),
  "Individual NMLS ID":                (p) => !!p.nmls?.trim(),
  "Company NMLS ID":                   (p) => !!p.companyNmls?.trim(),
  "Company name":                      (p) => !!p.company?.trim(),
  "Brokerage name & logo":             (p) => !!p.company?.trim(),
  "Phone number":                      (p) => !!p.phone?.trim(),
  "State license number":              (p) => !!p.license?.trim(),
  "State license disclosure":          () => true, // auto-generated in templates per state
  "Equal Housing Opportunity":         () => true, // baked into templates
  "Not a commitment to lend disclaimer": () => true, // baked into templates
};

function validateRule(label, profile) {
  const validator = RULE_VALIDATORS[label];
  if (!validator) return true; // unknown rules auto-pass
  return validator(profile);
}

/**
 * Run compliance validation against a profile.
 * Returns { results: [{label, passed}], allPassed: boolean }
 */
export function validateCompliance(acctType, profile, cobrand, partner) {
  const results = [];

  // Primary profile rules
  const rules = COMPLIANCE[acctType] || [];
  for (const rule of rules) {
    results.push({ label: rule, passed: validateRule(rule, profile) });
  }

  // Partner rules if co-branding
  if (cobrand && partner?.type) {
    const partnerRules = COMPLIANCE[partner.type] || [];
    for (const rule of partnerRules) {
      results.push({ label: `[Partner] ${rule}`, passed: validateRule(rule, partner) });
    }
  }

  return {
    results,
    allPassed: results.every(r => r.passed),
  };
}
