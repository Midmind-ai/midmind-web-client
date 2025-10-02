import type { UpdateNoteRequest, NoteResponse } from './notes-dtos';
import { baseAxiosInstance } from '@config/axios';

/**
 * Service for notes API operations
 */
export class NotesService {
  /**
   * Update a note (name, content_json, or content_md)
   * All fields are optional - backend auto-generates content_md if not provided
   */
  static async updateNote(
    noteId: string,
    request: UpdateNoteRequest
  ): Promise<NoteResponse> {
    const { data } = await baseAxiosInstance.patch<NoteResponse>(
      `/notes/${noteId}`,
      request
    );

    return data;
  }
}
