import { XMLParser, XMLValidator } from 'fast-xml-parser';
export function validateGPX(text: string): { points: number; segments: number } {
  if (
    text.length > 20 * 1024 * 1024 ||
    /<!DOCTYPE|<!ENTITY/i.test(text) ||
    XMLValidator.validate(text) !== true
  )
    throw new Error('Invalid GPX file');
  const parsed: unknown = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    parseAttributeValue: false,
  }).parse(text);
  if (!parsed || typeof parsed !== 'object' || !('gpx' in parsed))
    throw new Error('Choose a GPX file with a gpx root');
  let points = 0,
    segments = 0;
  const walk = (value: unknown, key = '') => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item, key);
      return;
    }
    if (!value || typeof value !== 'object') return;
    const object = value as Record<string, unknown>;
    if (['trkpt', 'rtept', 'wpt'].includes(key)) {
      const latitude = Number(object['@_lat']),
        longitude = Number(object['@_lon']);
      if (
        object['@_lat'] == null ||
        object['@_lon'] == null ||
        !Number.isFinite(latitude) ||
        Math.abs(latitude) > 90 ||
        !Number.isFinite(longitude) ||
        Math.abs(longitude) > 180
      )
        throw new Error('GPX has an invalid point');
      points++;
    }
    if (key === 'trkseg') segments++;
    for (const [child, item] of Object.entries(object)) walk(item, child);
  };
  walk(parsed);
  if (!points) throw new Error('GPX needs at least one point');
  return { points, segments };
}
