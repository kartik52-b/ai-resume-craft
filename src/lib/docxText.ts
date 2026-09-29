/**
 * DOCX text extraction using mammoth (browser build, dynamically imported so
 * it stays out of the main bundle until a user actually imports a file).
 */
export async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value ?? '';
}
