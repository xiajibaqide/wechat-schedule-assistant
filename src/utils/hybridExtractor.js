import { extractEventDraft } from './extractor.js';

export function extractEventDraftHybrid(messageText) {
  const ruleBasedResult = extractEventDraft(messageText);

  return {
    ...ruleBasedResult,
    extractionMethod: 'rules',
    needsReview: true,
  };
}
