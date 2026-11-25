const BUBBLE_MARGIN = 12;
const BUBBLE_GAP = 10;
const BUBBLE_WIDTH = 300;

export type WritingBubbleRect = {
  top: number;
  right: number;
  left: number;
  height: number;
};

export type WritingBubblePlacement = {
  left: number;
  top: number;
  width: number;
  side: 'left' | 'right';
  arrow: number;
};

/**
 * Place the comment beside the mark without joining the writing column.
 * Prefer the right side. If that would leave the viewport, use the left,
 * then clamp so the card stays fully on screen.
 */
export function placeWritingBubble(
  markRect: WritingBubbleRect,
  popupWidth: number,
  popupHeight: number,
  viewport: { width: number; height: number },
): WritingBubblePlacement {
  const width = Math.min(popupWidth || BUBBLE_WIDTH, viewport.width - BUBBLE_MARGIN * 2);
  const height = popupHeight || 180;
  const spaceRight = viewport.width - markRect.right - BUBBLE_GAP - BUBBLE_MARGIN;
  const spaceLeft = markRect.left - BUBBLE_GAP - BUBBLE_MARGIN;
  let side: 'left' | 'right' = 'right';
  let left = markRect.right + BUBBLE_GAP;

  if (spaceRight >= width) {
    side = 'right';
    left = markRect.right + BUBBLE_GAP;
  } else if (spaceLeft >= width) {
    side = 'left';
    left = markRect.left - BUBBLE_GAP - width;
  } else if (spaceRight >= spaceLeft) {
    side = 'right';
    left = viewport.width - BUBBLE_MARGIN - width;
  } else {
    side = 'left';
    left = BUBBLE_MARGIN;
  }

  left = Math.min(
    Math.max(left, BUBBLE_MARGIN),
    Math.max(BUBBLE_MARGIN, viewport.width - BUBBLE_MARGIN - width),
  );

  let top = markRect.top;
  if (top + height > viewport.height - BUBBLE_MARGIN) {
    top = viewport.height - BUBBLE_MARGIN - height;
  }
  top = Math.max(BUBBLE_MARGIN, top);

  const arrow = Math.min(
    Math.max(markRect.top + markRect.height / 2 - top - 6, 14),
    Math.max(14, height - 22),
  );

  return { left, top, width, side, arrow };
}
