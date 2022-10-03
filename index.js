"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarize = void 0;
const compromise_1 = __importDefault(require("compromise"));
function summarize(text, approx_word_count = 75) {
    const terms = rankTextTerms(text);
    const ranked = reorderSentences(text, terms);
    const summary = extractSummary(ranked, approx_word_count);
    return summary;
}
exports.summarize = summarize;
function rankTextTerms(text) {
    const terms = {};
    const doc = (0, compromise_1.default)(text);
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
function reorderSentences(text, terms) {
    return (0, compromise_1.default)(text).sentences().json()
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
function extractSummary(text, approx_words) {
    const summary = (0, compromise_1.default)(text).sentences().json().reduce((data, sentence) => {
        if (data.wordCount > approx_words)
            return data;
        return {
            wordCount: data.wordCount + sentence.terms.length,
            text: data.text + " " + sentence.text.replace(/\s+/gm, " "),
        };
    }, { wordCount: 0, text: "" });
    return summary.text.trim();
}
