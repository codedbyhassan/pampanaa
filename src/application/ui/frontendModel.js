import { CAMPAIGN_CHAPTERS, NARRATIVE_EVENTS } from '../../domain/campaign/campaignCatalog';
import { MISSION_CATALOG } from '../../domain/campaign/missionCatalog';
import { FACTION_CATALOG, REGION_CATALOG, THREAT_CATALOG } from '../../domain/world/worldCatalog';
import { progressionFromLegacyProgress } from '../../domain/player/playerProgression';

export const FRONTEND_MODEL = Object.freeze({ campaign: CAMPAIGN_CHAPTERS, narrative: NARRATIVE_EVENTS, missions: MISSION_CATALOG, factions: FACTION_CATALOG, regions: REGION_CATALOG, threats: THREAT_CATALOG });
export const getMission = (id) => MISSION_CATALOG.find((mission) => mission.id === id) ?? null;
export const getChapter = (id) => CAMPAIGN_CHAPTERS.find((chapter) => chapter.id === id) ?? null;
export const getNarrativeEvent = (id) => NARRATIVE_EVENTS.find((event) => event.id === id) ?? null;
export const getCareerProgression = (progress) => progressionFromLegacyProgress(progress);
