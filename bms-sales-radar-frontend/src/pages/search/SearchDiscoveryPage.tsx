import * as React from 'react';

import SearchIcon from '@mui/icons-material/Search';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Link from '@mui/material/Link';
import Pagination from '@mui/material/Pagination';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {
  authenticatedFetch,
  hasPermission,
} from '../../auth/authStorage';

interface GoogleSearchResult {
  title?: string;
  titleNoFormatting?: string;
  url: string;
  content?: string;
  contentNoFormatting?: string;
}

interface SearchKeyword {
  id: number;
  keyword: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ResolvedBusinessMatch {
  placeId: string;
  name: string;
  address?: string;
  googleMapsUrl?: string;
  phone?: string;
}

interface GoogleMapCandidate {
  district: string;
  place: {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    googleMapsUri?: string;
  };
}

type CandidateConfidence =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

interface CaptionCandidate {
  id: string;
  businessName: string;
  instagramUrl: string;
  locationHint?: string;
  openingEvidence?: string;
  context: string;
  confidence: CandidateConfidence;
  selectedByDefault: boolean;
}

type ResultDateStatus =
  | 'recent'
  | 'old'
  | 'unknown';

type DiscoveryPlatform =
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'KARIYER_NET'
  | 'SAHIBINDEN';
type SearchPlatform = DiscoveryPlatform | 'ALL';

interface ResultDateInfo {
  status: ResultDateStatus;
  label: string;
}

function getSocialResultUrl(resultUrl: string): string {
  try {
    const parsedUrl = new URL(resultUrl);
    const hostname = parsedUrl.hostname
      .toLocaleLowerCase('en-US')
      .replace(/^www\./, '');

    if (hostname === 'google.com' && parsedUrl.pathname === '/url') {
      const targetUrl = parsedUrl.searchParams.get('q');

      if (targetUrl) {
        return new URL(targetUrl).toString();
      }
    }
  } catch {
    return resultUrl;
  }

  return resultUrl;
}

function getSocialPlatform(
  url: string,
  fallback: SearchPlatform,
): DiscoveryPlatform {
  try {
    const hostname = new URL(url).hostname
      .toLocaleLowerCase('en-US')
      .replace(/^(www|m)\./, '');

    if (hostname === 'facebook.com') {
      return 'FACEBOOK';
    }

    if (hostname === 'linkedin.com') {
      return 'LINKEDIN';
    }

    if (hostname === 'instagram.com') {
      return 'INSTAGRAM';
    }

    if (hostname === 'kariyer.net') {
      return 'KARIYER_NET';
    }

    if (hostname === 'sahibinden.com') {
      return 'SAHIBINDEN';
    }
  } catch {
    // Seçilen platform aşağıda güvenli varsayılan olarak kullanılır.
  }

  return fallback === 'ALL' ? 'INSTAGRAM' : fallback;
}

function getSocialUrlPayload(
  platform: DiscoveryPlatform,
  url: string,
): Record<string, string> {
  if (platform === 'FACEBOOK') {
    return { facebookUrl: url };
  }

  if (platform === 'LINKEDIN') {
    return { linkedinUrl: url };
  }

  if (platform === 'KARIYER_NET' || platform === 'SAHIBINDEN') {
    return { jobPostingUrl: url };
  }

  return { instagramUrl: url };
}

function suggestBusinessName(
  result: GoogleSearchResult,
): string {
  const title =
    result.titleNoFormatting ??
    result.title ??
    '';

  const resultText = [
    title,
    result.contentNoFormatting,
    result.content,
  ]
    .filter(Boolean)
    .join(' ');

  const mention = resultText.match(
    /@([a-zA-Z0-9._]+)/,
  );

  if (mention?.[1]) {
    return mention[1];
  }

  return title
    .replace(
      /\s*[-|–]\s*(Instagram|Facebook).*$/i,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

const turkishMonths: Record<string, number> = {
  oca: 0,
  şub: 1,
  mar: 2,
  nis: 3,
  may: 4,
  haz: 5,
  tem: 6,
  ağu: 7,
  eyl: 8,
  eki: 9,
  kas: 10,
  ara: 11,
};

function analyzeResultDate(
  result: GoogleSearchResult,
): ResultDateInfo {
  const text = [
    result.titleNoFormatting,
    result.title,
    result.contentNoFormatting,
    result.content,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('tr-TR');

  const now = new Date();

  const cutoffDate = new Date(now);
  cutoffDate.setDate(
    cutoffDate.getDate() - 30,
  );

  const relativeMatch = text.match(
    /(\d+)\s+(dakika|saat|gün|hafta|ay)\s+önce/,
  );

  if (relativeMatch) {
    const amount = Number(
      relativeMatch[1],
    );

    const unit = relativeMatch[2];
    const resultDate = new Date(now);

    if (unit === 'dakika') {
      resultDate.setMinutes(
        resultDate.getMinutes() -
          amount,
      );
    } else if (unit === 'saat') {
      resultDate.setHours(
        resultDate.getHours() -
          amount,
      );
    } else if (unit === 'gün') {
      resultDate.setDate(
        resultDate.getDate() -
          amount,
      );
    } else if (unit === 'hafta') {
      resultDate.setDate(
        resultDate.getDate() -
          amount * 7,
      );
    } else if (unit === 'ay') {
      resultDate.setMonth(
        resultDate.getMonth() -
          amount,
      );
    }

    return {
      status:
        resultDate >= cutoffDate
          ? 'recent'
          : 'old',
      label: relativeMatch[0],
    };
  }

  const absoluteMatch = text.match(
    /(\d{1,2})\s+(oca|şub|mar|nis|may|haz|tem|ağu|eyl|eki|kas|ara)\s+(\d{4})/,
  );

  if (absoluteMatch) {
    const day = Number(
      absoluteMatch[1],
    );

    const month =
      turkishMonths[
        absoluteMatch[2]
      ];

    const year = Number(
      absoluteMatch[3],
    );

    const resultDate = new Date(
      year,
      month,
      day,
    );

    return {
      status:
        resultDate >= cutoffDate &&
        resultDate <= now
          ? 'recent'
          : 'old',
      label: absoluteMatch[0],
    };
  }

  return {
    status: 'unknown',
    label: 'Tarih belirlenemedi',
  };
}

interface SearchElement {
  execute(query: string): void;
}

interface GoogleSearchApi {
  search: {
    cse: {
      element: {
        getElement(
          name: string,
        ): SearchElement | null;

        go(): void;
      };
    };
  };
}

declare global {
  interface Window {
    google?: GoogleSearchApi;

    __gcse?: {
      parsetags?: 'onload' | 'explicit';

      initializationCallback?: () => void;

      searchCallbacks?: {
        web?: {
          ready?: (
            name: string,
            query: string,
            promotions: unknown[],
            results: GoogleSearchResult[],
            resultsDiv: HTMLElement,
          ) => boolean;
        };
      };
    };

    __bmsPseResultHandler?: (
      results: GoogleSearchResult[],
    ) => void;
  }
}


const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000';

const PSE_SCRIPT_ID =
  'google-pse-script';

const RESULTS_PER_PAGE = 10;

export default function SearchDiscoveryPage() {
  const [discoveryTab, setDiscoveryTab] =
    React.useState<'SOCIAL' | 'MAPS'>('SOCIAL');
  const [searchPlatform, setSearchPlatform] =
    React.useState<SearchPlatform>('INSTAGRAM');

  const [currentPage, setCurrentPage] = React.useState(1);
  const [expandedResultUrl, setExpandedResultUrl] =
    React.useState<string | null>(null);
  const [savingCandidateKey, setSavingCandidateKey] =
    React.useState<string | null>(null);
  const [savedCandidateKeys, setSavedCandidateKeys] =
    React.useState<string[]>([]);
  const [mapsScanning, setMapsScanning] = React.useState(false);
  const [mapCandidates, setMapCandidates] =
    React.useState<GoogleMapCandidate[]>([]);
  const [keywords, setKeywords] =
    React.useState<SearchKeyword[]>([]);

  const [
    selectedKeyword,
    setSelectedKeyword,
  ] = React.useState('');

  const [keywordInput, setKeywordInput] =
    React.useState('');
    
  const [results, setResults] =
    React.useState<GoogleSearchResult[]>([]);

  const [searchReady, setSearchReady] =
    React.useState(false);

  const [resolvingUrl, setResolvingUrl] =
    React.useState<string | null>(null);

  const [
    businessMatches,
    setBusinessMatches,
  ] = React.useState<
    Record<
      string,
      ResolvedBusinessMatch[]
    >
  >({});

  const [
    selectedMatches,
    setSelectedMatches,
  ] = React.useState<
    Record<
      string,
      ResolvedBusinessMatch
    >
  >({});

  const [
    businessNameInputs,
    setBusinessNameInputs,
  ] = React.useState<
    Record<string, string>
  >({});

  const [
    locationHintInputs,
    setLocationHintInputs,
  ] = React.useState<
    Record<string, string>
  >({});

  const [
    captionInputs,
    setCaptionInputs,
  ] = React.useState<
    Record<string, string>
  >({});

  const [
    captionCandidates,
    setCaptionCandidates,
  ] = React.useState<
    Record<string, CaptionCandidate[]>
  >({});

  const [
    analyzingUrl,
    setAnalyzingUrl,
  ] = React.useState<string | null>(null);

  const [
    deletingKeywordId,
    setDeletingKeywordId,
  ] = React.useState<number | null>(null);

  const [message, setMessage] =
    React.useState<{
      text: string;
      severity: 'success' | 'error';
    } | null>(null);

  React.useEffect(() => {
    const cx =
      import.meta.env.VITE_GOOGLE_PSE_CX;

    if (!cx) {
      setMessage({
        text:
          'VITE_GOOGLE_PSE_CX tanımlanmamış.',
        severity: 'error',
      });

      return;
    }

    let cancelled = false;

    let retryTimer:
      | number
      | undefined;

    window.__bmsPseResultHandler = (
      googleResults,
    ) => {
      if (cancelled) {
        return;
      }

      setResults((previousResults) => {
        const combinedResults = [
          ...previousResults,
          ...googleResults,
        ];

        return Array.from(
          new Map(
            combinedResults.map(
              (result) => [
                result.url,
                result,
              ],
            ),
          ).values(),
        );
      });
    };

    const waitForSearchElement = (
      attempt = 0,
    ) => {
      if (cancelled) {
        return;
      }

      const searchElement =
        window.google?.search.cse.element
          .getElement(
            'salesRadarSearch',
          );

      if (searchElement) {
        setSearchReady(true);
        return;
      }

      if (attempt >= 50) {
        setSearchReady(false);

        setMessage({
          text:
            'Google arama bileşeni oluşturulamadı. CX değerini ve tarayıcı içerik engelleyicilerini kontrol edin.',
          severity: 'error',
        });

        return;
      }

      retryTimer = window.setTimeout(
        () => {
          waitForSearchElement(
            attempt + 1,
          );
        },
        100,
      );
    };

    window.__gcse = {
      parsetags: 'onload',

      initializationCallback: () => {
        waitForSearchElement();
      },

      searchCallbacks: {
        web: {
          ready: (
            _name,
            _query,
            _promotions,
            googleResults,
          ) => {
            window
              .__bmsPseResultHandler?.(
                googleResults,
              );

            return false;
          },
        },
      },
    };

    const existingScript =
      document.getElementById(
        PSE_SCRIPT_ID,
      );

    if (existingScript) {
      window.google?.search.cse.element
        .go();

      waitForSearchElement();
    } else {
      const script =
        document.createElement(
          'script',
        );

      script.id = PSE_SCRIPT_ID;
      script.async = true;

      script.src =
        'https://cse.google.com/cse.js?cx=' +
        encodeURIComponent(cx);

      script.addEventListener(
        'load',
        () => {
          waitForSearchElement();
        },
      );

      script.addEventListener(
        'error',
        () => {
          if (cancelled) {
            return;
          }

          setSearchReady(false);

          setMessage({
            text:
              'Google arama bileşeni yüklenemedi.',
            severity: 'error',
          });
        },
      );

      document.head.appendChild(
        script,
      );
    }

    return () => {
      cancelled = true;

      if (
        retryTimer !== undefined
      ) {
        window.clearTimeout(
          retryTimer,
        );
      }

      delete window
        .__bmsPseResultHandler;
    };
  }, []);

  const loadKeywords =
    React.useCallback(async () => {
      try {
        const response = await authenticatedFetch(
          `${API_URL}/search-keywords`,
        );

        if (!response.ok) {
          throw new Error(
            'Anahtar kelimeler alınamadı.',
          );
        }

        const data: SearchKeyword[] =
          await response.json();

        setKeywords(data);

        const firstActiveKeyword =
          data.find(
            (item) => item.isActive,
          );

        setSelectedKeyword(
          (currentKeyword) => {
            const currentStillExists =
              data.some(
                (item) =>
                  item.isActive &&
                  item.keyword ===
                    currentKeyword,
              );

            return currentStillExists
              ? currentKeyword
              : firstActiveKeyword
                  ?.keyword ?? '';
          },
        );
      } catch (error) {
        setMessage({
          text:
            error instanceof Error
              ? error.message
              : 'Anahtar kelimeler alınamadı.',
          severity: 'error',
        });
      }
    }, []);

  React.useEffect(() => {
    void loadKeywords();
  }, [loadKeywords]);

  const addKeyword = async () => {
    const normalizedKeyword =
      keywordInput.trim();

    if (!normalizedKeyword) {
      setMessage({
        text:
          'Bir anahtar kelime girin.',
        severity: 'error',
      });

      return;
    }

    try {
      const response = await authenticatedFetch(
        `${API_URL}/search-keywords`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            keyword:
              normalizedKeyword,
          }),
        },
      );

      const responseBody =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        const errorMessage =
          Array.isArray(
            responseBody?.message,
          )
            ? responseBody.message.join(
                ' ',
              )
            : responseBody?.message ??
              'Anahtar kelime eklenemedi.';

        throw new Error(
          errorMessage,
        );
      }

      setKeywordInput('');
      setSelectedKeyword(
        responseBody.keyword,
      );

      await loadKeywords();

      setMessage({
        text:
          'Anahtar kelime eklendi.',
        severity: 'success',
      });
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Anahtar kelime eklenemedi.',
        severity: 'error',
      });
    }
  };

  const deleteKeyword = async (
    keyword: SearchKeyword,
  ) => {
    const confirmed = window.confirm(
      `“${keyword.keyword}” anahtar kelimesini silmek istediğinize emin misiniz?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingKeywordId(keyword.id);

      const response = await authenticatedFetch(
        `${API_URL}/search-keywords/${keyword.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        const responseBody =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          responseBody?.message ??
            'Anahtar kelime silinemedi.',
        );
      }

      if (
        selectedKeyword ===
        keyword.keyword
      ) {
        setResults([]);
        setBusinessMatches({});
        setSelectedMatches({});
        setBusinessNameInputs({});
        setLocationHintInputs({});
        setCaptionInputs({});
        setCaptionCandidates({});
      }

      await loadKeywords();

      setMessage({
        text:
          'Anahtar kelime silindi.',
        severity: 'success',
      });
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Anahtar kelime silinemedi.',
        severity: 'error',
      });
    } finally {
      setDeletingKeywordId(null);
    }
  };

  const runSearch = () => {
    const searchElement =
      window.google?.search.cse.element
        .getElement(
          'salesRadarSearch',
        );

    if (!searchElement) {
      setMessage({
        text:
          'Google arama bileşeni henüz hazır değil.',
        severity: 'error',
      });

      return;
    }

    const siteQuery =
      searchPlatform === 'INSTAGRAM'
        ? 'site:instagram.com'
        : searchPlatform === 'FACEBOOK'
          ? 'site:facebook.com'
          : searchPlatform === 'LINKEDIN'
            ? '(site:linkedin.com/posts OR site:linkedin.com/feed/update)'
            : searchPlatform === 'KARIYER_NET'
              ? 'site:kariyer.net/is-ilani'
              : searchPlatform === 'SAHIBINDEN'
                ? 'site:sahibinden.com/restoran-konaklama'
                : '(site:instagram.com OR site:facebook.com OR site:linkedin.com/posts OR site:linkedin.com/feed/update OR site:kariyer.net/is-ilani OR site:sahibinden.com/restoran-konaklama)';

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const afterDate = cutoffDate.toISOString().slice(0, 10);

    const query =
      `${siteQuery} ${selectedKeyword} after:${afterDate}`;

    setResults([]);
    setBusinessMatches({});
    setSelectedMatches({});
    setBusinessNameInputs({});
    setLocationHintInputs({});
    setCaptionInputs({});
    setCaptionCandidates({});
    setCurrentPage(1);
    setExpandedResultUrl(null);

    searchElement.execute(query);
  };

  const analyzeCaption = async (
    result: GoogleSearchResult,
  ) => {
    const caption =
      (
        captionInputs[result.url] ??
        result.contentNoFormatting ??
        result.content ??
        ''
      ).trim();

    if (!caption) {
      setMessage({
        text:
          'Analiz etmek için post açıklamasını girin.',
        severity: 'error',
      });

      return;
    }

    try {
      setAnalyzingUrl(result.url);

      const response = await authenticatedFetch(
        `${API_URL}/analyzer/caption`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            caption,
          }),
        },
      );

      const responseBody =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        const errorMessage =
          Array.isArray(
            responseBody?.message,
          )
            ? responseBody.message.join(
                ' ',
              )
            : responseBody?.message ??
              'Post açıklaması analiz edilemedi.';

        throw new Error(
          errorMessage,
        );
      }

      const candidates =
        responseBody as
          CaptionCandidate[];

      setCaptionCandidates(
        (currentCandidates) => ({
          ...currentCandidates,
          [result.url]: candidates,
        }),
      );

      const firstSuggestedCandidate =
        candidates.find(
          (candidate) =>
            candidate.selectedByDefault,
        );

      if (firstSuggestedCandidate) {
        setBusinessNameInputs(
          (currentInputs) => ({
            ...currentInputs,
            [result.url]:
              firstSuggestedCandidate.businessName,
          }),
        );

        setLocationHintInputs(
          (currentInputs) => ({
            ...currentInputs,
            [result.url]:
              firstSuggestedCandidate.locationHint ??
              '',
          }),
        );
      }

      setMessage({
        text: candidates.length
          ? `${candidates.length} aday bulundu.`
          : 'Post açıklamasında işletme adayı bulunamadı.',
        severity: candidates.length
          ? 'success'
          : 'error',
      });
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Post açıklaması analiz edilemedi.',
        severity: 'error',
      });
    } finally {
      setAnalyzingUrl(null);
    }
  };

  const useCaptionCandidate = (
    result: GoogleSearchResult,
    candidate: CaptionCandidate,
  ) => {
    setBusinessNameInputs(
      (currentInputs) => ({
        ...currentInputs,
        [result.url]:
          candidate.businessName,
      }),
    );

    setLocationHintInputs(
      (currentInputs) => ({
        ...currentInputs,
        [result.url]:
          candidate.locationHint ?? '',
      }),
    );

    setBusinessMatches(
      (currentMatches) => ({
        ...currentMatches,
        [result.url]: [],
      }),
    );

    setSelectedMatches(
      (currentMatches) => {
        const nextMatches = {
          ...currentMatches,
        };

        delete nextMatches[result.url];

        return nextMatches;
      },
    );
  };

  const saveCandidate = async (
    key: string,
    payload: Record<string, unknown>,
  ) => {
    try {
      setSavingCandidateKey(key);
      const response = await authenticatedFetch(`${API_URL}/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseBody = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responseBody?.message ?? 'Aday kaydedilemedi.');
      }
      setSavedCandidateKeys((current) =>
        current.includes(key) ? current : [...current, key],
      );
      setMessage({ text: 'Aday kaydedildi ve rapora eklendi.', severity: 'success' });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Aday kaydedilemedi.',
        severity: 'error',
      });
    } finally {
      setSavingCandidateKey(null);
    }
  };

  const saveCaptionCandidate = (
    result: GoogleSearchResult,
    candidate: CaptionCandidate,
  ) => {
    const socialUrl = getSocialResultUrl(result.url);
    const platform = getSocialPlatform(socialUrl, searchPlatform);

    return saveCandidate(`${result.url}:${candidate.id}`, {
      name: candidate.businessName,
      address: candidate.locationHint,
      ...getSocialUrlPayload(platform, socialUrl),
      discoverySource: platform,
      notes: candidate.context || undefined,
    });
  };

  const runGoogleMapsScan = async () => {
    try {
      setMapsScanning(true);
      const response = await authenticatedFetch(`${API_URL}/google/new-businesses`);
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? 'Google Maps taraması başlatılamadı.');
      }
      setMapCandidates((body?.newPlaces ?? []) as GoogleMapCandidate[]);
      setMessage({
        text: body?.baselineCreated
          ? 'İlk tarama referans liste olarak kaydedildi.'
          : `${body?.newPlaceCount ?? 0} yeni aday bulundu.`,
        severity: 'success',
      });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Google Maps taraması başarısız.',
        severity: 'error',
      });
    } finally {
      setMapsScanning(false);
    }
  };

  const resolveBusiness = async (
    result: GoogleSearchResult,
  ) => {
    const businessName =
      (
        businessNameInputs[
          result.url
        ] ??
        suggestBusinessName(result)
      ).trim();

    if (!businessName) {
      setMessage({
        text:
          'Google Places araması için işletme adını girin.',
        severity: 'error',
      });

      return;
    }

    try {
      setResolvingUrl(result.url);

      const response = await authenticatedFetch(
        `${API_URL}/google/resolve-business`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            businessName,
            sourceUrl: result.url,
            locationHint:
              locationHintInputs[
                result.url
              ]?.trim() ||
              undefined,
            city: 'İstanbul',
          }),
        },
      );

      const responseBody =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        const errorMessage =
          Array.isArray(
            responseBody?.message,
          )
            ? responseBody.message.join(
                ' ',
              )
            : responseBody?.message ??
              'İşletme bilgileri bulunamadı.';

        throw new Error(
          errorMessage,
        );
      }

      const matches =
        responseBody as
          ResolvedBusinessMatch[];

      setBusinessMatches(
        (currentMatches) => ({
          ...currentMatches,
          [result.url]: matches,
        }),
      );

      setSelectedMatches(
        (currentMatches) => {
          const nextMatches = {
            ...currentMatches,
          };

          delete nextMatches[
            result.url
          ];

          return nextMatches;
        },
      );

      setMessage({
        text: matches.length
          ? `${matches.length} işletme eşleşmesi bulundu.`
          : 'Bu sonuç için işletme eşleşmesi bulunamadı.',
        severity: matches.length
          ? 'success'
          : 'error',
      });
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'İşletme bilgileri bulunamadı.',
        severity: 'error',
      });
    } finally {
      setResolvingUrl(null);
    }
  };

  const visibleResults = React.useMemo(
    () =>
      results.filter(
        (result) =>
          analyzeResultDate(result)
            .status !== 'old',
      ),
    [results],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(visibleResults.length / RESULTS_PER_PAGE),
  );

  const paginatedResults = React.useMemo(() => {
    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    return visibleResults.slice(start, start + RESULTS_PER_PAGE);
  }, [currentPage, visibleResults]);

  React.useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          Aday Keşfi
        </Typography>

        <Typography
          color="text.secondary"
        >
          Google üzerinden Instagram ve Facebook
          işletme profillerini bulun,
          inceleyin ve aday olarak
          kaydedin.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ px: 2 }}>
        <Tabs
          value={discoveryTab}
          onChange={(_event, value: 'SOCIAL' | 'MAPS') =>
            setDiscoveryTab(value)
          }
        >
          <Tab value="SOCIAL" label="Sosyal Medya" />
          <Tab value="MAPS" label="Google Maps" />
        </Tabs>
      </Paper>

      {discoveryTab === 'SOCIAL' && (
        <>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
        }}
      >
        <Stack spacing={2}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            Anahtar kelime
          </Typography>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={searchPlatform}
            onChange={(_event, value: SearchPlatform | null) => {
              if (value) {
                setSearchPlatform(value);
              }
            }}
          >
            <ToggleButton value="INSTAGRAM">Instagram</ToggleButton>
            <ToggleButton value="FACEBOOK">Facebook</ToggleButton>
            <ToggleButton value="LINKEDIN">LinkedIn</ToggleButton>
            <ToggleButton value="KARIYER_NET">Kariyer.net</ToggleButton>
            <ToggleButton value="SAHIBINDEN">Sahibinden</ToggleButton>
            <ToggleButton value="ALL">Tümü</ToggleButton>
          </ToggleButtonGroup>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1}
          >
            <TextField
              fullWidth
              size="small"
              label="Yeni anahtar kelime"
              value={keywordInput}
              onChange={(event) => {
                setKeywordInput(
                  event.target.value,
                );
              }}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  event.preventDefault();
                  void addKeyword();
                }
              }}
            />

            <Button
              variant="outlined"
              disabled={
                !keywordInput.trim()
              }
              onClick={() => {
                void addKeyword();
              }}
            >
              Ekle
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              flexWrap: 'wrap',
            }}
          >
            {keywords
              .filter(
                (keyword) =>
                  keyword.isActive,
              )
              .map((keyword) => (
                <Chip
                  key={keyword.id}
                  label={
                    keyword.keyword
                  }
                  clickable
                  disabled={
                    deletingKeywordId ===
                    keyword.id
                  }
                  color={
                    selectedKeyword ===
                    keyword.keyword
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => {
                    setSelectedKeyword(
                      keyword.keyword,
                    );
                  }}
                  onDelete={() => {
                    void deleteKeyword(
                      keyword,
                    );
                  }}
                />
              ))}
          </Stack>

          <Button
            variant="contained"
            startIcon={
              <SearchIcon />
            }
            disabled={
              !searchReady ||
              !selectedKeyword
            }
            onClick={runSearch}
          >
            {searchReady
              ? 'Google’da ara'
              : 'Arama yükleniyor'}
          </Button>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          minHeight: 80,
        }}
      >
        <div
          className=
            "gcse-searchresults-only"
          data-gname=
            "salesRadarSearch"
          data-resultsetsize=
            "filtered_cse"
        />
      </Paper>

      <Alert severity="info">
        Google sonuç penceresinin altındaki sayfa numaralarını veya
        “Sonraki” bağlantısını kullanın. Açtığınız her sayfadaki yeni
        sonuçlar aşağıdaki aday listesine otomatik olarak eklenir.
      </Alert>

      {results.length > 0 && (
        <Stack spacing={2}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Kaydedilebilir sonuçlar
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {results.length} benzersiz sonuç
            toplandı.{' '}
            {visibleResults.length} sonuç
            gösteriliyor.
          </Typography>

          {paginatedResults.map(
            (result) => (
              <Paper
                key={result.url}
                variant="outlined"
                sx={{
                  p: 2,
                }}
              >
                <Stack spacing={1.5}>
                  <Link
                    href={result.url}
                    target="_blank"
                    rel=
                      "noopener noreferrer"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {result
                      .titleNoFormatting ??
                      result.title ??
                      result.url}
                  </Link>

                  <Chip
                    size="small"
                    label={
                      analyzeResultDate(
                        result,
                      ).label
                    }
                    color={
                      analyzeResultDate(
                        result,
                      ).status ===
                      'recent'
                        ? 'success'
                        : 'warning'
                    }
                    variant="outlined"
                    sx={{
                      alignSelf:
                        'flex-start',
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {result.contentNoFormatting ??
                      result.content ??
                      'Açıklama bulunamadı.'}
                  </Typography>

                  <Box>
                    <Button
                      size="small"
                      onClick={() => {
                        setExpandedResultUrl((current) =>
                          current === result.url ? null : result.url,
                        );
                      }}
                    >
                      {expandedResultUrl === result.url
                        ? 'Detayları kapat'
                        : 'İncele'}
                    </Button>
                  </Box>

                  <Collapse
                    in={expandedResultUrl === result.url}
                    unmountOnExit
                  >
                    <Stack spacing={1.5} sx={{ pt: 1 }}>

                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    size="small"
                    label="Post açıklaması"
                    value={
                      captionInputs[
                        result.url
                      ] ??
                      result
                        .contentNoFormatting ??
                      result.content ??
                      ''
                    }
                    helperText=
                      "Sosyal medya gönderisinin tam açıklamasını buraya yapıştırın."
                    onChange={(event) => {
                      setCaptionInputs(
                        (currentInputs) => ({
                          ...currentInputs,
                          [result.url]:
                            event.target.value,
                        }),
                      );
                    }}
                  />

                  <Box>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={
                        analyzingUrl ===
                        result.url
                      }
                      onClick={() => {
                        void analyzeCaption(
                          result,
                        );
                      }}
                    >
                      {analyzingUrl ===
                      result.url
                        ? 'Açıklama analiz ediliyor'
                        : 'Bilgileri analiz et'}
                    </Button>
                  </Box>

                  {(captionCandidates[
                    result.url
                  ]?.length ?? 0) >
                    0 && (
                    <Stack spacing={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Açıklamada bulunan
                        adaylar
                      </Typography>

                      {captionCandidates[
                        result.url
                      ].map((candidate) => (
                        <Paper
                          key={candidate.id}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                          }}
                        >
                          <Stack
                            spacing={1}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              useFlexGap
                              sx={{
                                flexWrap:
                                  'wrap',
                                alignItems:
                                  'center',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight:
                                    600,
                                }}
                              >
                                @{
                                  candidate.businessName
                                }
                              </Typography>

                              <Chip
                                size="small"
                                label={
                                  candidate.confidence ===
                                  'HIGH'
                                    ? 'Yüksek güven'
                                    : candidate.confidence ===
                                        'MEDIUM'
                                      ? 'Orta güven'
                                      : 'Düşük güven'
                                }
                                color={
                                  candidate.confidence ===
                                  'HIGH'
                                    ? 'success'
                                    : candidate.confidence ===
                                        'MEDIUM'
                                      ? 'warning'
                                      : 'default'
                                }
                                variant="outlined"
                              />

                              {candidate.selectedByDefault && (
                                <Chip
                                  size="small"
                                  label=
                                    "Önerilen"
                                  color="primary"
                                />
                              )}
                            </Stack>

                            <Typography
                              variant="body2"
                              color=
                                "text.secondary"
                            >
                              Konum:{' '}
                              {candidate.locationHint ??
                                'Bulunamadı'}
                            </Typography>

                            {candidate.openingEvidence && (
                              <Typography
                                variant="body2"
                                color=
                                  "text.secondary"
                              >
                                Sinyal:{' '}
                                {
                                  candidate.openingEvidence
                                }
                              </Typography>
                            )}

                            <Box>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    useCaptionCandidate(
                                      result,
                                      candidate,
                                    );
                                  }}
                                >
                                  Bu adayı kullan
                                </Button>

                                <Button
                                  size="small"
                                  variant="contained"
                                  disabled={
                                    savingCandidateKey ===
                                      `${result.url}:${candidate.id}` ||
                                    savedCandidateKeys.includes(
                                      `${result.url}:${candidate.id}`,
                                    ) ||
                                    !hasPermission('BUSINESS_CREATE')
                                  }
                                  onClick={() => {
                                    void saveCaptionCandidate(
                                      result,
                                      candidate,
                                    );
                                  }}
                                >
                                  {savedCandidateKeys.includes(
                                    `${result.url}:${candidate.id}`,
                                  )
                                    ? 'Kaydedildi'
                                    : 'Adayı kaydet'}
                                </Button>
                              </Stack>
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}

                  <TextField
                    fullWidth
                    size="small"
                    label=
                      "Google Places'ta aranacak işletme adı"
                    value={
                      businessNameInputs[
                        result.url
                      ] ??
                      suggestBusinessName(
                        result,
                      )
                    }
                    helperText=
                      "İşletme adını kontrol edin ve gerekirse düzeltin."
                    onChange={(event) => {
                      setBusinessNameInputs(
                        (currentInputs) => ({
                          ...currentInputs,
                          [result.url]:
                            event.target.value,
                        }),
                      );
                    }}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Konum ipucu"
                    value={
                      locationHintInputs[
                        result.url
                      ] ?? ''
                    }
                    helperText=
                      "İlçe, mahalle veya adres bilgisini kontrol edin."
                    onChange={(event) => {
                      setLocationHintInputs(
                        (currentInputs) => ({
                          ...currentInputs,
                          [result.url]:
                            event.target.value,
                        }),
                      );
                    }}
                  />

                  <Box>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={
                        resolvingUrl ===
                          result.url ||
                        !(
                          businessNameInputs[
                            result.url
                          ] ??
                          suggestBusinessName(
                            result,
                          )
                        ).trim()
                      }
                      startIcon={
                        resolvingUrl ===
                        result.url
                          ? (
                            <CircularProgress
                              size={16}
                            />
                          )
                          : (
                            <SearchIcon />
                          )
                      }
                      onClick={() => {
                        void resolveBusiness(
                          result,
                        );
                      }}
                    >
                      {resolvingUrl ===
                      result.url
                        ? 'İşletme aranıyor'
                        : "Google Places'ta ara"}
                    </Button>
                  </Box>

                  {(businessMatches[
                    result.url
                  ]?.length ?? 0) >
                    0 && (
                    <Stack spacing={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Google Places
                        eşleşmeleri
                      </Typography>

                      {businessMatches[
                        result.url
                      ].map((match) => {
                        const isSelected =
                          selectedMatches[
                            result.url
                          ]?.placeId ===
                          match.placeId;

                        return (
                          <Paper
                            key={
                              match.placeId
                            }
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderColor:
                                isSelected
                                  ? 'primary.main'
                                  : 'divider',
                              bgcolor:
                                isSelected
                                  ? 'action.selected'
                                  : 'background.paper',
                            }}
                          >
                            <Stack
                              spacing={1}
                            >
                              <Typography
                                sx={{
                                  fontWeight:
                                    600,
                                }}
                              >
                                {match.name}
                              </Typography>

                              <Typography
                                variant="body2"
                                color=
                                  "text.secondary"
                              >
                                {match.address ??
                                  'Adres bulunamadı.'}
                              </Typography>

                              <Stack
                                direction={{
                                  xs: 'column',
                                  sm: 'row',
                                }}
                                spacing={1}
                                sx={{
                                  alignItems: {
                                    xs:
                                      'stretch',
                                    sm:
                                      'center',
                                  },
                                }}
                              >
                                {match.googleMapsUrl && (
                                  <Link
                                    href={
                                      match.googleMapsUrl
                                    }
                                    target="_blank"
                                    rel=
                                      "noopener noreferrer"
                                  >
                                    Google Maps’te
                                    aç
                                  </Link>
                                )}

                                <Button
                                  size="small"
                                  variant={
                                    isSelected
                                      ? 'contained'
                                      : 'outlined'
                                  }
                                  onClick={() => {
                                    setSelectedMatches(
                                      (
                                        currentMatches,
                                      ) => ({
                                        ...currentMatches,
                                        [result.url]:
                                          match,
                                      }),
                                    );
                                  }}
                                >
                                  {isSelected
                                    ? 'Seçildi'
                                    : 'Bu işletmeyi seç'}
                                </Button>
                              </Stack>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}

                  <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
                    <Button
                      variant="contained"
                      disabled={
                        savedCandidateKeys.includes(result.url) ||
                        savingCandidateKey === result.url ||
                        !hasPermission('BUSINESS_CREATE') ||
                        !(businessNameInputs[result.url] ??
                          selectedMatches[result.url]?.name ??
                          suggestBusinessName(result)).trim()
                      }
                      onClick={() => {
                        const match = selectedMatches[result.url];
                        const socialUrl = getSocialResultUrl(result.url);
                        const platform = getSocialPlatform(
                          socialUrl,
                          searchPlatform,
                        );

                        void saveCandidate(result.url, {
                          name:
                            match?.name ??
                            businessNameInputs[result.url] ??
                            suggestBusinessName(result),
                          address:
                            match?.address ??
                            locationHintInputs[result.url] ??
                            undefined,
                          phone: match?.phone,
                          googlePlaceId: match?.placeId,
                          googleMapsUrl: match?.googleMapsUrl,
                          ...getSocialUrlPayload(platform, socialUrl),
                          discoverySource: platform,
                        });
                      }}
                    >
                      {savedCandidateKeys.includes(result.url)
                        ? 'Aday kaydedildi'
                        : 'Aday olarak kaydet'}
                    </Button>

                    {!selectedMatches[result.url] && (
                      <Typography variant="caption" color="text.secondary">
                        Google Places eşleşmesi seçilmeden de kaydedilebilir;
                        eksik alanlar daha sonra tamamlanabilir.
                      </Typography>
                    )}
                  </Stack>
                    </Stack>
                  </Collapse>
                </Stack>
              </Paper>
            ),
          )}

          {pageCount > 1 && (
            <Pagination
              count={pageCount}
              page={currentPage}
              color="primary"
              onChange={(_event, page) => {
                setCurrentPage(page);
                setExpandedResultUrl(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              sx={{ alignSelf: 'center', pt: 1 }}
            />
          )}
        </Stack>
      )}

        </>
      )}

      {discoveryTab === 'MAPS' && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Haftalık Google Maps taraması
              </Typography>
              <Typography color="text.secondary">
                Önceki taramada bulunmayan yeni işletmeleri keşfedin ve
                yalnızca uygun gördüklerinizi aday havuzuna kaydedin.
              </Typography>
              <Button
                variant="contained"
                disabled={mapsScanning}
                onClick={() => void runGoogleMapsScan()}
              >
                {mapsScanning ? 'İstanbul taranıyor...' : 'Taramayı başlat'}
              </Button>
            </Stack>
          </Paper>

          {mapCandidates.length === 0 ? (
            <Alert severity="info">
              Henüz listelenecek yeni Google Maps adayı bulunmuyor.
            </Alert>
          ) : (
            mapCandidates.map(({ district, place }) => {
              const key = `maps:${place.id}`;
              const saved = savedCandidateKeys.includes(key);
              return (
                <Paper key={place.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {place.displayName?.text ?? 'İsimsiz işletme'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {place.formattedAddress ?? district}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      <Chip size="small" label={district} />
                      {place.nationalPhoneNumber && (
                        <Chip size="small" label={place.nationalPhoneNumber} variant="outlined" />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      {place.googleMapsUri && (
                        <Button
                          component="a"
                          href={place.googleMapsUri}
                          target="_blank"
                          size="small"
                        >
                          Haritada aç
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        size="small"
                        disabled={
                          saved ||
                          savingCandidateKey === key ||
                          !hasPermission('BUSINESS_CREATE')
                        }
                        onClick={() =>
                          void saveCandidate(key, {
                            name: place.displayName?.text ?? 'İsimsiz işletme',
                            address: place.formattedAddress,
                            phone: place.nationalPhoneNumber,
                            googlePlaceId: place.id,
                            googleMapsUrl: place.googleMapsUri,
                            discoverySource: 'GOOGLE_MAPS',
                          })
                        }
                      >
                        {saved ? 'Aday kaydedildi' : 'Aday olarak kaydet'}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })
          )}
        </Stack>
      )}

      <Snackbar
        open={message !== null}
        autoHideDuration={5000}
        onClose={() => {
          setMessage(null);
        }}
      >
        <Alert
          severity={
            message?.severity ??
            'success'
          }
          onClose={() => {
            setMessage(null);
          }}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
