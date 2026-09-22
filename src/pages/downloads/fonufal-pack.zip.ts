import part1 from '../../data/downloads/fonufal-pack.part01.b64?raw';
import part2 from '../../data/downloads/fonufal-pack.part02.b64?raw';
import part3 from '../../data/downloads/fonufal-pack.part03.b64?raw';
import part4 from '../../data/downloads/fonufal-pack.part04.b64?raw';
import part5 from '../../data/downloads/fonufal-pack.part05.b64?raw';
import part6 from '../../data/downloads/fonufal-pack.part06.b64?raw';
import part7 from '../../data/downloads/fonufal-pack.part07.b64?raw';
import part8 from '../../data/downloads/fonufal-pack.part08.b64?raw';
import part9 from '../../data/downloads/fonufal-pack.part09.b64?raw';

export const prerender = true;

export async function GET() {
  const bytes = Buffer.from([part1, part2, part3, part4, part5, part6, part7, part8, part9].join(''), 'base64');
  return new Response(bytes, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="fonUFAL-Pack-de-Modelos.zip"',
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
