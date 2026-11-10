// Own SVG icons (no emoji, no icon font). Returns markup strings; no DOM access.

const PATHS = {
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  pencil: '<path d="M4 20l1-4.2L15.8 5l3.2 3.2L8.2 19z"/><path d="M13.6 7.2l3.2 3.2"/>',
  gear: '<circle cx="12" cy="12" r="2.8"/><circle cx="12" cy="12" r="6.6"/><path d="M12 2.6v2.8M12 18.6v2.8M2.6 12h2.8M18.6 12h2.8M5.4 5.4l2 2M16.6 16.6l2 2M5.4 18.6l2-2M16.6 7.4l2-2"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10.5h16M8.5 3.5v4M15.5 3.5v4"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  edit: '<path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5"/><path d="M10 14l.6-3L18.8 2.8l2.4 2.4L13 13.4z"/>',
  trash: '<path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9.5l5-5 5 5M5 20h14"/>',
  flame: '<path d="M12 3c.8 3.6 5 5.6 5 10.2a5 5 0 0 1-10 0c0-2 .9-3.3 2-4.3.2 1.6.9 2.5 1.8 2.8C10.4 9 10.9 5.600 12 3z"/>',
  sparkle: '<path d="M11 3.5l1.9 5.1L18 10.500l-5.100 1.900L11 17.500l-1.900-5.100L4 10.500l5.100-1.900z"/><path d="M18.500 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
};

/** Decorative stroke icon; the surrounding control carries the accessible name. */
export function icon(name, size = 16) {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name] || ''}</svg>`;
}

/** The crying face for the finale (own drawing, not an emoji). */
export function cryFace(size = 28) {
  return `<svg class="icon cry" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.2"/><path d="M7.200 10.200q1.300 1.300 2.600 0M14.200 10.200q1.300 1.300 2.600 0"/><path d="M9.300 17q2.700-2.400 5.400 0"/><path d="M8.500 12.300c-.8 1.200-1.200 1.900-1.200 2.500a1.200 1.200 0 0 0 2.400 0c0-.6-.4-1.300-1.200-2.500zM15.500 12.300c-.8 1.200-1.200 1.900-1.200 2.500a1.200 1.200 0 0 0 2.400 0c0-.6-.4-1.300-1.200-2.500z" fill="#5aa9e6" stroke="#2f7fc0" stroke-width="0.800"/></svg>`;
}
