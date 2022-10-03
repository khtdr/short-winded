import nlp from "compromise";

export function summarize(text: string, approx_word_count = 75): string {
  const terms = rankTextTerms(text);
  const ranked = reorderSentences(text, terms);
  const summary = extractSummary(ranked, approx_word_count);
  return summary;
}

function rankTextTerms(text: string): Record<string, number> {
  const terms: ReturnType<typeof rankTextTerms> = {};
  const doc = nlp(text);
  doc.termList().forEach((term) => {
    terms[term.normal] = terms[term.normal] || 0;
  });
  doc.nouns().forEach((noun) => {
    noun.termList().forEach((term) => {
      terms[term.normal] = terms[term.normal] || 0;
      terms[term.normal] += 1;
    });
  });
  doc.verbs().forEach((verb) => {
    verb.termList().forEach((term) => {
      terms[term.normal] = terms[term.normal] || 0;
      terms[term.normal] += 1;
    });
  });
  return terms;
}

function reorderSentences(
  text: string,
  terms: ReturnType<typeof rankTextTerms>
): string {
  return (nlp(text).sentences().json() as SentenceJson)
    .map((sentence) => {
      const score = sentence.terms.reduce((currentScore, { normal }) => {
        return currentScore + terms[normal];
      }, 0);
      return { text: sentence.text, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ text }) => text.trim())
    .join(" ");
}

function extractSummary(text: string, approx_words: number): string {
  const summary = (nlp(text).sentences().json() as SentenceJson).reduce(
    (data, sentence) => {
      if (data.wordCount > approx_words) return data;
      return {
        wordCount: data.wordCount + sentence.terms.length,
        text: data.text + " " + sentence.text.replace(/\s+/gm, " "),
      };
    },
    { wordCount: 0, text: "" }
  );
  return summary.text.trim();
}

type Sentence = { text: string; terms: Array<{ normal: string }> };
type SentenceJson = Sentence[];
