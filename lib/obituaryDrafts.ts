import { supabase } from './supabase';

export interface ObituaryDraft {
  id: string;
  draft_text: string;
  tone: string;
  person_name: string;
  generation_number: number;
  created_at: string;
}

export async function saveDraft(
  intakeId: string,
  draftText: string,
  tone: string,
  personName: string,
  generationNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase.from('legacy_obituary_drafts').insert({
      intake_id: intakeId,
      user_id: user.id,
      draft_text: draftText,
      tone,
      person_name: personName,
      generation_number: generationNumber,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function loadDrafts(intakeId: string): Promise<ObituaryDraft[]> {
  try {
    const { data, error } = await supabase
      .from('legacy_obituary_drafts')
      .select('*')
      .eq('intake_id', intakeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading drafts:', error);
      return [];
    }
    return (data || []) as ObituaryDraft[];
  } catch {
    return [];
  }
}
