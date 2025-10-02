/**
 * Notes service DTOs
 * Matches backend API types from /notes endpoints
 */

// Lexical JSON type (any valid JSON structure from Lexical editor)
export type LexicalJSON = Record<string, unknown>;

/**
 * Request to update a note
 * All fields are optional - at least one must be provided
 */
export interface UpdateNoteRequest {
  name?: string;
  content_json?: LexicalJSON;
  content_md?: string;
}

/**
 * Response from note operations
 */
export interface NoteResponse {
  id: string;
  name: string;
  content_json: LexicalJSON | null;
  content_md: string | null;
  updated_at: string | null;
}
