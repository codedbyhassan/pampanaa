import { asInteger, asString, freezeModel } from '../shared/schema';

export const CAMPAIGN_SCHEMA_VERSION = 1;

export function createCampaignStage(input = {}) {
  const from = Math.max(1, asInteger(input.from, 1));
  const to = Math.max(from, asInteger(input.to, from));
  return freezeModel({
    id: asInteger(input.id, 1),
    name: asString(input.name, 'Campaign Stage'),
    from,
    to,
    blurb: asString(input.blurb),
    schemaVersion: CAMPAIGN_SCHEMA_VERSION,
  });
}

export function createCampaignProgress(input = {}) {
  return freezeModel({
    campaignId: asString(input.campaignId, 'main') || 'main',
    currentWave: Math.max(1, asInteger(input.currentWave, 1)),
    unlockedWave: Math.max(1, asInteger(input.unlockedWave, 1)),
    schemaVersion: CAMPAIGN_SCHEMA_VERSION,
  });
}
