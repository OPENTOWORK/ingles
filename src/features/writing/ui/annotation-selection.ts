/**
 * Interactive Writing Map interaction state (Phase 8).
 *
 * Extracted from the components on purpose: "only one annotation is open at a
 * time" and "Escape closes it" are rules worth testing without a browser.
 *
 * Doc 04 §5.1: click or tap only. There is no hover action here and no component
 * on the v3 path registers a pointer-enter handler, so a mark cannot open by
 * accident while the learner is reading.
 */

/** The most common mobile breakpoint already used across `globals.css`. */
export const WRITING_MAP_MOBILE_BREAKPOINT = 640;

export type AnnotationPresentation = 'bubble' | 'sheet';

export interface AnnotationSelectionState {
  /** The `group_id` of the open segment, or null when nothing is open. */
  active_group_id: string | null;
  /** How the open feedback is presented. */
  presentation: AnnotationPresentation;
  /** Where focus returns when the bubble or sheet closes. */
  return_focus_group_id: string | null;
}

export type AnnotationSelectionAction =
  | { type: 'activate'; group_id: string }
  | { type: 'dismiss' }
  | { type: 'viewport'; width: number };

export function resolvePresentation(viewportWidth: number): AnnotationPresentation {
  return viewportWidth <= WRITING_MAP_MOBILE_BREAKPOINT ? 'sheet' : 'bubble';
}

export function initialSelectionState(viewportWidth = 1280): AnnotationSelectionState {
  return {
    active_group_id: null,
    presentation: resolvePresentation(viewportWidth),
    return_focus_group_id: null,
  };
}

export function selectionReducer(
  state: AnnotationSelectionState,
  action: AnnotationSelectionAction,
): AnnotationSelectionState {
  switch (action.type) {
    case 'activate': {
      // Clicking the open mark again closes it; clicking a different one replaces
      // it. Either way exactly one bubble can be open, never a forest of cards.
      if (state.active_group_id === action.group_id) {
        return { ...state, active_group_id: null, return_focus_group_id: action.group_id };
      }
      return { ...state, active_group_id: action.group_id, return_focus_group_id: action.group_id };
    }
    case 'dismiss': {
      if (!state.active_group_id) return state;
      return { ...state, active_group_id: null, return_focus_group_id: state.active_group_id };
    }
    case 'viewport': {
      const presentation = resolvePresentation(action.width);
      if (presentation === state.presentation) return state;
      // Crossing the breakpoint changes the surface, not the selection: the same
      // feedback simply moves from a bubble to a sheet.
      return { ...state, presentation };
    }
    default:
      return state;
  }
}

export function isOpen(state: AnnotationSelectionState, groupId: string): boolean {
  return state.active_group_id === groupId;
}
