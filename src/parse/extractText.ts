/** Turn an uploaded CV (PDF, DOCX or plain text) into plain text, all in the browser. */
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return pdfText(file);
  if (name.endsWith('.docx')) return docxText(file);
  if (name.endsWith('.txt') || name.endsWith('.md') || file.type.startsWith('text/')) return file.text();
  throw new Error('Unsupported file type. Please upload a PDF, DOCX or TXT file.');
}

async function pdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const doc = await task.promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Group text runs into lines by their baseline, then order each line left to right.
    const rows: { y: number; parts: { x: number; w: number; s: string }[] }[] = [];
    for (const item of content.items) {
      if (!('str' in item) || !item.str) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      let row = rows.find((r) => Math.abs(r.y - y) < 3);
      if (!row) rows.push((row = { y, parts: [] }));
      row.parts.push({ x, w: item.width, s: item.str });
    }
    rows.sort((a, b) => b.y - a.y);
    pages.push(
      rows
        .map((r) => {
          r.parts.sort((a, b) => a.x - b.x);
          // A wide horizontal gap means a separate column (e.g. a right-aligned date), so mark it.
          let line = '';
          let end = -Infinity;
          for (const p of r.parts) {
            // pdf.js often fills a column gap with one wide whitespace item instead of leaving a gap.
            if (!p.s.trim()) {
              if (p.w > 18 && line) line += ' | ';
              else if (line) line += ' ';
              end = p.x + p.w;
              continue;
            }
            const gap = p.x - end;
            if (line && !line.endsWith(' ')) line += gap > 18 ? ' | ' : gap > 1 ? ' ' : '';
            line += p.s;
            end = p.x + p.w;
          }
          line = line.replace(/(\s*\|\s*)+/g, ' | ');
          return line.replace(/\s+/g, ' ').trim();
        })
        .filter(Boolean)
        .join('\n'),
    );
  }
  await task.destroy();
  return pages.join('\n');
}

async function docxText(file: File): Promise<string> {
  const mammoth = (await import('mammoth')).default;
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value;
}
