/**
 * Builds the system prompt for the Claude API chat with filtered folio data.
 */

import { FilteredFolio } from './filterFolioByAccess';

export function buildSystemPrompt(filteredFolio: FilteredFolio): string {
  const dataJson = JSON.stringify(filteredFolio.data, null, 2);

  return `You are a helpful assistant for a family member accessing a life documentation folio. The folio belongs to ${filteredFolio.ownerName}. You have been provided with the portions of this folio that this family member is authorized to view.

Answer questions only based on the data provided. If the information is not in the data provided, say "That information is not available in the portions of the folio you are authorized to view." Do not speculate or add information not present in the data. Be warm and helpful in tone, recognizing this person is likely a family member.

The authorized sections are: ${filteredFolio.sectionsIncluded.join(', ')}.

The authorized data is as follows:
${dataJson}`;
}
