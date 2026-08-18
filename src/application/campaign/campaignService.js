import { CAMPAIGN_CHAPTERS, NARRATIVE_EVENTS } from '../../domain/campaign/campaignCatalog';
import { applyCampaignEvent, createCampaignState } from '../../domain/campaign/campaignRuntime';

export function createCampaignService({ onEvent, initialState } = {}) {
  let state = createCampaignState(initialState);
  const emit = (type, payload = {}) => onEvent?.(type, payload);

  return Object.freeze({
    getState: () => state,
    getChapters: () => CAMPAIGN_CHAPTERS,
    getNarrativeEvents: () => NARRATIVE_EVENTS,
    getChapter: (id) => CAMPAIGN_CHAPTERS.find((chapter) => chapter.id === id) ?? null,
    getNarrativeEvent: (id) => NARRATIVE_EVENTS.find((event) => event.id === id) ?? null,
    recordEvent(event) {
      state = applyCampaignEvent(state, event);
      emit('CAMPAIGN_UPDATED', { state, sourceEvent: event });
      return state;
    },
    discover(eventId) {
      const event = NARRATIVE_EVENTS.find((item) => item.id === eventId);
      if (!event) return null;
      state = applyCampaignEvent(state, { type: 'DISCOVERY_MADE', discoveryId: event.id });
      emit('NARRATIVE_DISCOVERED', { event, state });
      return event;
    },
    setFlag(key, value) {
      state = applyCampaignEvent(state, { type: 'NARRATIVE_FLAG_SET', key, value });
      emit('NARRATIVE_FLAG_SET', { key, value, state });
      return state;
    },
  });
}
