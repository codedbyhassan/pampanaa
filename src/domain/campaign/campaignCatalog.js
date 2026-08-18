import { CHAPTER_STATES, NARRATIVE_EVENT_TYPES, createCampaignChapter, createNarrativeEvent } from './campaignRuntime';

export const CAMPAIGN_CHAPTERS = Object.freeze([
  createCampaignChapter({ id: 'chapter_1', number: 1, title: 'The Silence', subtitle: 'The perimeter goes quiet.', state: CHAPTER_STATES.AVAILABLE, missionIds: ['mission_1'], narrativeEventIds: ['story_1_intro', 'story_1_discovery'] }),
  createCampaignChapter({ id: 'chapter_2', number: 2, title: 'The Frontier', subtitle: 'The old world is not as empty as Pampanaa believed.', missionIds: ['mission_2'], narrativeEventIds: ['story_2_intro'] }),
  createCampaignChapter({ id: 'chapter_3', number: 3, title: 'The Signal', subtitle: 'Something beyond the dead zones is calling back.', missionIds: ['mission_3'], narrativeEventIds: ['story_3_signal'] }),
  createCampaignChapter({ id: 'chapter_4', number: 4, title: 'The Truth', subtitle: 'The silence was engineered.', missionIds: ['mission_4'], narrativeEventIds: ['story_4_revelation'] }),
  createCampaignChapter({ id: 'chapter_5', number: 5, title: 'Pampanaa', subtitle: 'What was protected may be more dangerous than what was lost.', missionIds: ['mission_5'], narrativeEventIds: ['story_5_outcome'] }),
]);

export const NARRATIVE_EVENTS = Object.freeze([
  createNarrativeEvent({ id: 'story_1_intro', chapterId: 'chapter_1', missionId: 'mission_1', type: NARRATIVE_EVENT_TYPES.INTRO, title: 'The Last Watch', text: 'The Haven has survived by staying silent. Tonight, the perimeter answers with a signal.', required: true }),
  createNarrativeEvent({ id: 'story_1_discovery', chapterId: 'chapter_1', missionId: 'mission_1', type: NARRATIVE_EVENT_TYPES.DISCOVERY, title: 'A Signal Beneath the Static', text: 'The returning transmission carries a pattern no survivor in the Haven recognizes.', required: true }),
  createNarrativeEvent({ id: 'story_2_intro', chapterId: 'chapter_2', missionId: 'mission_2', type: NARRATIVE_EVENT_TYPES.INTRO, title: 'Beyond the Wall', text: 'The Warden crosses into the Frontier and finds evidence that someone was here after the world went silent.', required: true }),
  createNarrativeEvent({ id: 'story_3_signal', chapterId: 'chapter_3', missionId: 'mission_3', type: NARRATIVE_EVENT_TYPES.REVELATION, title: 'The Signal', text: 'The transmission is not a distress call. It is a response.', required: true }),
  createNarrativeEvent({ id: 'story_4_revelation', chapterId: 'chapter_4', missionId: 'mission_4', type: NARRATIVE_EVENT_TYPES.REVELATION, title: 'The Truth', text: 'The silence was created to hide what the old network had awakened.', required: true }),
  createNarrativeEvent({ id: 'story_5_outcome', chapterId: 'chapter_5', missionId: 'mission_5', type: NARRATIVE_EVENT_TYPES.OUTCOME, title: 'Pampanaa', text: 'The Warden returns to the Haven carrying the truth — and a choice about what happens next.', required: true }),
]);
