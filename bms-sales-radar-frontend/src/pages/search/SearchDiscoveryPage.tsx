import * as React from 'react';

import SearchIcon from '@mui/icons-material/Search';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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
}

type ResultDateStatus =
  | 'recent'
  | 'old'
  | 'unknown';

interface ResultDateInfo {
  status: ResultDateStatus;
  label: string;
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

export default function SearchDiscoveryPage() {
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
        const response = await fetch(
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
      const response = await fetch(
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

      const response = await fetch(
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

    const query =
      `site:instagram.com ${selectedKeyword}`;

    setResults([]);
    setBusinessMatches({});
    setSelectedMatches({});

    searchElement.execute(query);
  };

  const resolveBusiness = async (
    result: GoogleSearchResult,
  ) => {
    try {
      setResolvingUrl(result.url);

      const response = await fetch(
        `${API_URL}/google/resolve-business`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            title:
              result
                .titleNoFormatting ??
              result.title ??
              result.url,
            instagramUrl:
              result.url,
            snippet:
              result
                .contentNoFormatting ??
              result.content,
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
          Google üzerinden Instagram
          işletme profillerini bulun,
          inceleyin ve aday olarak
          kaydedin.
        </Typography>
      </Box>

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
        />
      </Paper>

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

          {visibleResults.map(
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

                  <Typography
                    variant="body2"
                    color=
                      "text.secondary"
                  >
                    {result
                      .contentNoFormatting ??
                      result.content ??
                      'Açıklama bulunamadı.'}
                  </Typography>

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

                  <Box>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={
                        resolvingUrl ===
                        result.url
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
                        : 'İşletme bilgilerini bul'}
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
                </Stack>
              </Paper>
            ),
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
