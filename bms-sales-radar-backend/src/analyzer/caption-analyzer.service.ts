import { Injectable } from '@nestjs/common';

export interface CaptionCandidate {
  id: string;
  businessName: string;
  instagramUrl: string;
  locationHint?: string;
  openingEvidence?: string;
  context: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  selectedByDefault: boolean;
}

@Injectable()
export class CaptionAnalyzerService {
  analyze(caption: string): CaptionCandidate[] {
    const lines = caption
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const candidates: CaptionCandidate[] = [];

    for (let index = 0; index < lines.length; index += 1) {
      const heading = lines[index].match(/^📍\s*(.+)$/u);

      if (!heading) {
        continue;
      }

      const [businessPart, ...locationParts] = heading[1]
        .split(/\s+[–—-]\s+/)
        .map((part) => part.trim());

      if (!businessPart) {
        continue;
      }

      const contextLines: string[] = [];

      for (let next = index + 1; next < lines.length; next += 1) {
        if (/^📍\s*/u.test(lines[next])) {
          break;
        }

        contextLines.push(lines[next]);
      }

      const context = contextLines.join(' ').slice(0, 1000);
      const normalizedName = businessPart.replace(/^@/, '').trim();

      candidates.push({
        id: `${index}-${normalizedName.toLocaleLowerCase('tr-TR')}`,
        businessName: normalizedName,
        instagramUrl: '',
        locationHint: locationParts.join(' – ') || undefined,
        openingEvidence: /yeni|açıl|açtı|açıyor/i.test(
          `${caption.slice(0, 250)} ${context}`,
        )
          ? 'Yeni açılış ifadesi bulundu.'
          : undefined,
        context,
        confidence: locationParts.length ? 'HIGH' : 'MEDIUM',
        selectedByDefault: candidates.length === 0,
      });
    }

    if (candidates.length === 0) {
      const businessPattern =
        /(?:[\p{Lu}][\p{L}\d'’.-]*\s+){0,5}(?:Kafe(?:si)?|Cafe|Café|Restoran(?:ı)?|Restaurant|Lokanta(?:sı)?|Bistro|Brasserie|Pastane(?:si)?|Fırın(?:ı)?|Otel(?:i)?)(?=\s|\(|\)|,|\.|$)/gu;

      const genericMatches = Array.from(caption.matchAll(businessPattern));

      for (const [index, match] of genericMatches.entries()) {
        const businessName = match[0]
          .replace(/^[\s.,:;!?-]+|[\s.,:;!?-]+$/g, '')
          .trim();

        if (!businessName || businessName.split(/\s+/).length < 2) {
          continue;
        }

        const normalizedName = businessName.toLocaleLowerCase('tr-TR');
        if (
          candidates.some(
            (candidate) =>
              candidate.businessName.toLocaleLowerCase('tr-TR') === normalizedName,
          )
        ) {
          continue;
        }

        const locationMatch = caption.match(
          /([\p{Lu}][\p{L}]+)(?:['’](?:d[ae]|t[ae]))(?=\s|,|\.|$)/u,
        );

        candidates.push({
          id: `generic-${index}-${normalizedName}`,
          businessName,
          instagramUrl: '',
          locationHint: locationMatch?.[1],
          openingEvidence: /yeni|açıl|açtı|açıyor/i.test(caption)
            ? 'Yeni açılış ifadesi bulundu.'
            : undefined,
          context: caption.slice(0, 1000),
          confidence: 'MEDIUM',
          selectedByDefault: candidates.length === 0,
        });
      }
    }

    return candidates;
  }
}
