/**
 * Token Resolver - Resolves dynamic tokens in knowledge items
 * Tokens like {{MIN_PENSION}} are replaced with actual values
 */

interface TokenValues {
  MIN_PENSION: string;
  CONTRIBUTION_RATE: string;
  RETIREMENT_AGE_M: string;
  RETIREMENT_AGE_F: string;
  [key: string]: string;
}

// Token values - these should ideally come from environment variables or a config file
const TOKEN_VALUES: TokenValues = {
  MIN_PENSION: '1780,96 PLN',
  CONTRIBUTION_RATE: '19,52%',
  RETIREMENT_AGE_M: '65 lat',
  RETIREMENT_AGE_F: '60 lat',
};

/**
 * Resolve tokens in a text string
 * @param text Text containing tokens like {{MIN_PENSION}}
 * @returns Text with tokens replaced by actual values
 */
export function resolveTokens(text: string): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
    const trimmedToken = token.trim();
    return TOKEN_VALUES[trimmedToken] || match;
  });
}

/**
 * Check if a text contains any tokens
 * @param text Text to check
 * @returns True if text contains tokens
 */
export function hasTokens(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}

/**
 * Get all available tokens
 * @returns Object with all available token keys and values
 */
export function getAvailableTokens(): TokenValues {
  return { ...TOKEN_VALUES };
}
