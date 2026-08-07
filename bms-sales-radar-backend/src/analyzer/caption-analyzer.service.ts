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

    return candidates;
  }
}
