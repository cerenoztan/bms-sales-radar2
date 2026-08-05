import * as React from 'react';

import SearchIcon from '@mui/icons-material/Search';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  getAccessToken,
} from '../../auth/authStorage';

interface GoogleSearchResult {
  title?: string;
  titleNoFormatting?: string;
  url: string;
  content?: string;
  contentNoFormatting?: string;
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

const keywords = [
  'İstanbul yeni açılan kafe',
  'İstanbul yakında açılıyor restoran',
  'İstanbul yeni şube',
  'grand opening cafe Istanbul',
  'İstanbul yeni market',
];

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000';

const PSE_SCRIPT_ID =
  'google-pse-script';

export default function SearchDiscoveryPage() {
  const [
    selectedKeyword,
    setSelectedKeyword,
  ] = React.useState(keywords[0]);

  const [results, setResults] =
    React.useState<GoogleSearchResult[]>([]);

  const [searchReady, setSearchReady] =
    React.useState(false);

  const [savingUrl, setSavingUrl] =
    React.useState<string | null>(null);

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

      const uniqueResults = Array.from(
        new Map(
          googleResults.map((result) => [
            result.url,
            result,
          ]),
        ).values(),
      );

      setResults(uniqueResults);
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

    searchElement.execute(query);
  };

  const saveResult = async (
    result: GoogleSearchResult,
  ) => {
    try {
      setSavingUrl(result.url);

      const token =
        getAccessToken();

      const response = await fetch(
        `${API_URL}/sources/search-result`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            name:
              result
                .titleNoFormatting ??
              result.title ??
              result.url,

            url: result.url,

            platform:
              'INSTAGRAM',

            searchQuery:
              selectedKeyword,
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
              'Aday kaydedilemedi.';

        throw new Error(
          errorMessage,
        );
      }

      setMessage({
        text:
          'Kaynak başarıyla kaydedildi.',
        severity: 'success',
      });
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Aday kaydedilemedi.',
        severity: 'error',
      });
    } finally {
      setSavingUrl(null);
    }
  };

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
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              flexWrap: 'wrap',
            }}
          >
            {keywords.map(
              (keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  clickable
                  color={
                    selectedKeyword ===
                    keyword
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => {
                    setSelectedKeyword(
                      keyword,
                    );
                  }}
                />
              ),
            )}
          </Stack>

          <Button
            variant="contained"
            startIcon={
              <SearchIcon />
            }
            disabled={!searchReady}
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

          {results.map(
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

                  <Box>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={
                        savingUrl ===
                        result.url
                      }
                      startIcon={
                        savingUrl ===
                        result.url
                          ? (
                            <CircularProgress
                              size={16}
                            />
                          )
                          : (
                            <SaveOutlinedIcon />
                          )
                      }
                      onClick={() => {
                        void saveResult(
                          result,
                        );
                      }}
                    >
                      Aday olarak kaydet
                    </Button>
                  </Box>
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