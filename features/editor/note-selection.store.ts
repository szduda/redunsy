import { create } from 'zustand'

import type { NoteSelection } from '@/features/editor/notation/bar-note-edits'

type NoteSelectionState = {
  previewSelection: NoteSelection | null
  setPreviewSelection: (selection: NoteSelection | null) => void
}

export const useNoteSelectionStore = create<NoteSelectionState>((set) => ({
  previewSelection: null,
  setPreviewSelection: (previewSelection) => set({ previewSelection }),
}))
