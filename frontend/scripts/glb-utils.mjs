export function readGlbDocument(buffer) {
  if (buffer.byteLength < 20) throw new Error('GLB is too short');
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const magic = view.getUint32(0, true);
  const version = view.getUint32(4, true);
  const declaredLength = view.getUint32(8, true);
  const jsonLength = view.getUint32(12, true);
  const jsonType = view.getUint32(16, true);
  if (magic !== 0x46546c67 || version !== 2 || declaredLength !== buffer.byteLength || jsonType !== 0x4e4f534a) {
    throw new Error('Invalid GLB 2.0 header');
  }
  const jsonStart = 20;
  const jsonEnd = jsonStart + jsonLength;
  if (jsonEnd > buffer.byteLength) throw new Error('GLB JSON chunk exceeds the file length');
  return JSON.parse(buffer.toString('utf8', jsonStart, jsonEnd).trim());
}
