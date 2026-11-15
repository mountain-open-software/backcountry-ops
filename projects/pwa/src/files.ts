export function download(name: string, value: unknown, type = 'application/json') {
  const blob =
    value instanceof Blob
      ? value
      : new Blob([typeof value === 'string' ? value : JSON.stringify(value, null, 2)], { type });
  const url = URL.createObjectURL(blob),
    link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function readGPX(file: File) {
  if (!file || file.size > 20 * 1024 * 1024) throw new Error('Choose a GPX file up to 20 MB');
  const text = await file.text();
  if (/<!DOCTYPE|<!ENTITY/i.test(text))
    throw new Error('GPX files with document/entity declarations are not supported');
  const xml = new DOMParser().parseFromString(text, 'application/xml');
  if (xml.querySelector('parsererror') || xml.documentElement.localName !== 'gpx')
    throw new Error('Invalid GPX file');
  const points = Array.from(xml.getElementsByTagNameNS('*', '*')).filter((node) =>
    ['trkpt', 'rtept', 'wpt'].includes(node.localName),
  );
  if (
    !points.length ||
    points.some(
      (point) =>
        !point.hasAttribute('lat') ||
        !point.hasAttribute('lon') ||
        !Number.isFinite(Number(point.getAttribute('lat'))) ||
        !Number.isFinite(Number(point.getAttribute('lon'))) ||
        Math.abs(Number(point.getAttribute('lat'))) > 90 ||
        Math.abs(Number(point.getAttribute('lon'))) > 180,
    )
  )
    throw new Error('GPX must contain valid latitude/longitude points');
  return { points: points.length, segments: xml.getElementsByTagNameNS('*', 'trkseg').length };
}
