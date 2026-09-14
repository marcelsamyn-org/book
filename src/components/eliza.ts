/**
 * How the 1966 ELIZA / DOCTOR script turns one user message into a reply:
 * keyword detection, decomposition around wildcards, pronoun flips, and
 * reassembly into a canned template. The site component and the ebook export
 * both render this breakdown.
 */

export interface ElizaSubstitution {
  readonly from: string;
  readonly to: string;
}

export interface ElizaProps {
  /** The user's typed message. */
  readonly input: string;
  /** Keyword ELIZA matches in the rule table. Must appear in `input` ahead of `fragment`. */
  readonly keyword: string;
  /** Decomposition pattern shown to the reader, e.g. "(0 MY 0)". */
  readonly pattern: string;
  /** Wildcard-captured fragment from `input`. Must appear in `input`. */
  readonly fragment: string;
  /** Pronoun substitutions applied inside the captured fragment. */
  readonly substitutions?: readonly ElizaSubstitution[];
  /** The fragment after pronoun flips. Defaults to `fragment` unchanged. */
  readonly transformedFragment?: string;
  /** Reassembly template with a single `$` placeholder, e.g. "Your $ ?". */
  readonly template: string;
  /** ELIZA's final reply. The transformed fragment must appear inside it. */
  readonly response: string;
}

export interface ElizaBreakdown {
  /** The user's message split around the matched keyword and the captured fragment. */
  readonly input: {
    readonly beforeKeyword: string;
    readonly keyword: string;
    readonly betweenKeywordAndFragment: string;
    readonly fragment: string;
    readonly afterFragment: string;
  };
  readonly substitutions: readonly ElizaSubstitution[];
  readonly transformedFragment: string;
  readonly template: { readonly left: string; readonly right: string };
  /** The reply split around the transformed fragment. */
  readonly response: { readonly before: string; readonly fragment: string; readonly after: string };
}

const fail = (message: string): never => {
  throw new Error(`ElizaBreakdown: ${message}`);
};

export const breakDownEliza = (props: ElizaProps): ElizaBreakdown => {
  const { input, keyword, fragment, substitutions = [], transformedFragment = fragment, template, response } = props;

  const fragmentStart = input.indexOf(fragment);
  if (fragmentStart < 0) fail(`fragment "${fragment}" not found in input "${input}".`);
  const beforeFragment = input.slice(0, fragmentStart);

  const keywordStart = beforeFragment.toLowerCase().lastIndexOf(keyword.toLowerCase());
  if (keywordStart < 0) fail(`keyword "${keyword}" not found ahead of fragment in input.`);

  const responseStart = response.indexOf(transformedFragment);
  if (responseStart < 0) fail(`transformedFragment "${transformedFragment}" not found in response.`);

  const [left, right, ...extra] = template.split("$");
  if (left === undefined || right === undefined || extra.length > 0) {
    return fail(`template must contain exactly one "$" placeholder.`);
  }

  return {
    input: {
      beforeKeyword: beforeFragment.slice(0, keywordStart),
      keyword: beforeFragment.slice(keywordStart, keywordStart + keyword.length),
      betweenKeywordAndFragment: beforeFragment.slice(keywordStart + keyword.length),
      fragment,
      afterFragment: input.slice(fragmentStart + fragment.length),
    },
    substitutions,
    transformedFragment,
    template: { left, right },
    response: {
      before: response.slice(0, responseStart),
      fragment: transformedFragment,
      after: response.slice(responseStart + transformedFragment.length),
    },
  };
};
