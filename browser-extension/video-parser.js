(function attachFGetParser(global) {
  function isFacebookMediaUrl(value) {
    try {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      return url.protocol === "https:" && (
        host === "fbcdn.net" || host.endsWith(".fbcdn.net") ||
        host === "fbsbx.com" || host.endsWith(".fbsbx.com")
      );
    } catch {
      return false;
    }
  }

  function decodeCandidate(value) {
    if (!value) return "";
    const cleaned = value
      .replace(/&amp;/gi, "&")
      .replace(/\\u0026/gi, "&")
      .replace(/\\u003d/gi, "=")
      .replace(/\\u002f/gi, "/");
    let decoded;
    try {
      decoded = JSON.parse('"' + cleaned.replace(/"/g, '\\"') + '"');
    } catch {
      decoded = cleaned.replace(/\\\//g, "/").replace(/\\\\/g, "\\");
    }
    const markupStart = decoded.search(/(?:<|%3c)\//i);
    return (markupStart >= 0 ? decoded.slice(0, markupStart) : decoded)
      .replace(/[<>\s"'`]+$/g, "")
      .trim();
  }

  function firstMatch(source, patterns) {
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match && match[1]) {
        const value = decodeCandidate(match[1]);
        if (value) return value;
      }
    }
    return "";
  }

  function parseVideoSource(source) {
    const definitions = [
      {
        quality: "1080p (HD)",
        patterns: [
          /FBQualityClass=..hd.. FBQualityLabel=..1080p[\s\S]+?BaseURL>(https[\s\S]+?)BaseURL/i,
        ],
      },
      {
        quality: "720p (HD)",
        patterns: [
          /FBQualityClass=..hd.. FBQualityLabel=..720p[\s\S]+?BaseURL>(https[\s\S]+?)BaseURL/i,
          /(?:browser_native_hd_url|playable_url_quality_hd|hd_src_no_ratelimit|hd_src)(?:\\)?"?\s*:\s*(?:\\)?"([^"]+)/i,
        ],
      },
      {
        quality: "360p (SD)",
        patterns: [
          /(?:browser_native_sd_url|playable_url|sd_src_no_ratelimit|sd_src)(?:\\)?"?\s*:\s*(?:\\)?"([^"]+)/i,
          /property=["']og:video:url["'][^>]*content=["']([^"']+)/i,
          /contentUrl["']?\s*:\s*["']([^"']+)/i,
          /<video[^>]*src=["']([^"']+)/i,
        ],
      },
    ];

    const audioUrl = firstMatch(source, [
      /"mime_type"\s*:\s*"audio(?:\\\/|\/)mp4"[^}]*?"base_url"\s*:\s*"([^"]+)/i,
      /(?:audio_url|audio_src)(?:\\)?"?\s*:\s*(?:\\)?"([^"]+)/i,
    ]);

    const results = [];
    const seen = new Set();
    for (const definition of definitions) {
      const candidate = firstMatch(source, definition.patterns);
      if (candidate && isFacebookMediaUrl(candidate) && !seen.has(candidate)) {
        results.push({
          quality: definition.quality,
          videoUrl: candidate,
          audioUrl: isFacebookMediaUrl(audioUrl) ? audioUrl : "",
        });
        seen.add(candidate);
      }
    }

    if (!results.length) {
      const fallback = firstMatch(source, [
        /(?:video["']?\s*,\s*["']src["']|video_url|video_src)(?:\\)?"?\s*:\s*(?:\\)?"([^"]+)/i,
        /<source[^>]*src=["']([^"']+\.mp4[^"']*)/i,
      ]);
      if (fallback && isFacebookMediaUrl(fallback)) {
        results.push({
          quality: "วิดีโอ",
          videoUrl: fallback,
          audioUrl: isFacebookMediaUrl(audioUrl) ? audioUrl : "",
        });
      }
    }

    const title = firstMatch(source, [
      /<h2 class="uiHeaderTitle"?[^>]*>([\s\S]+?)<\/h2>/i,
      /<title[^>]*>([\s\S]+?)<\/title>/i,
      /<title id="pageTitle">([\s\S]+?)<\/title>/i,
    ])
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return { title, results };
  }

  global.FGetVideoParser = { parseVideoSource };
})(globalThis);
