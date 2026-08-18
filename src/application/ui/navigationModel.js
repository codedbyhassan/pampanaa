export const FRONTEND_ROUTES = Object.freeze({
  HOME: 'home',
  CAMPAIGN: 'campaign',
  MISSIONS: 'missions',
  CODEX: 'codex',
  ACHIEVEMENTS: 'achievements',
  CAREER: 'career',
  LEADERBOARD: 'leaderboard',
  SETTINGS: 'settings',
  CREDITS: 'credits',
  GAME: 'game',
});

export const FRONTEND_NAVIGATION = Object.freeze([
  { id: FRONTEND_ROUTES.CAMPAIGN, label: 'Campaign', description: 'Continue the story of Pampanaa.' },
  { id: FRONTEND_ROUTES.MISSIONS, label: 'Missions', description: 'Choose available operations.' },
  { id: FRONTEND_ROUTES.CODEX, label: 'Codex', description: 'Review discoveries, factions and threats.' },
  { id: FRONTEND_ROUTES.CAREER, label: 'Career', description: 'Track the Warden progression.' },
  { id: FRONTEND_ROUTES.ACHIEVEMENTS, label: 'Achievements', description: 'Review completed milestones.' },
  { id: FRONTEND_ROUTES.LEADERBOARD, label: 'Leaderboard', description: 'Compare recorded scores.' },
]);

export function createNavigationState(input = {}) {
  const route = Object.values(FRONTEND_ROUTES).includes(input.route) ? input.route : FRONTEND_ROUTES.HOME;
  return Object.freeze({ route, previousRoute: input.previousRoute ?? null });
}
