export const FLOATING_TOOL_SIZE = 56;
export const FLOATING_TOOL_EDGE_GAP = 12;

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function toScreenPosition(
  normalized: { x: number; y: number },
  width: number,
  height: number,
) {
  const travelX = Math.max(0, width - FLOATING_TOOL_SIZE - FLOATING_TOOL_EDGE_GAP * 2);
  const travelY = Math.max(0, height - FLOATING_TOOL_SIZE - FLOATING_TOOL_EDGE_GAP * 2);

  return {
    x: FLOATING_TOOL_EDGE_GAP + clamp(normalized.x, 0, 1) * travelX,
    y: FLOATING_TOOL_EDGE_GAP + clamp(normalized.y, 0, 1) * travelY,
  };
}

export function toNormalizedPosition(x: number, y: number, width: number, height: number) {
  const travelX = Math.max(1, width - FLOATING_TOOL_SIZE - FLOATING_TOOL_EDGE_GAP * 2);
  const travelY = Math.max(1, height - FLOATING_TOOL_SIZE - FLOATING_TOOL_EDGE_GAP * 2);

  return {
    x: clamp((x - FLOATING_TOOL_EDGE_GAP) / travelX, 0, 1),
    y: clamp((y - FLOATING_TOOL_EDGE_GAP) / travelY, 0, 1),
  };
}
