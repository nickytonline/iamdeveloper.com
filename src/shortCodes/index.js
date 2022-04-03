/* eslint-env node */

const hashnodeData = require(`../_data/hashnodeUrls.json`);

/**
 * Generates markup for a boost on DEV button.
 *
 * @param {string} fileSlug A pages file slug.
 * @param {string} url A pages URL.
 *
 * @returns {string} Markup for a boost links on DEV and Hashnode.
 */
function boostLink(fileSlug, url) {
  if (!url.startsWith('/posts/')) {
    return '';
  }

  let hashnodeBoosterLink = '';
  const hashnodeUrl = hashnodeData[fileSlug];

  if (hashnodeUrl) {
    hashnodeBoosterLink =
      `<a href="${hashnodeUrl}" class="boost-link">Boost on Hashnode</a>` +
      hashnodeBoosterLink;
  }

  return (
    `<a href="https://dev.to/nickytonline/${fileSlug}" class="boost-link">Boost on DEV</a>` +
    hashnodeBoosterLink
  );
}

/**
 * Generates an iframe for a YouTube video embed.
 *
 * @param {string} videoUrl A YouTube video URL
 *
 * @returns {string} Markup for a YouTube video embed.
 */
function youtubeEmbed(videoUrl) {
  const [, videoId, time] = videoUrl.match(/.+\?v=([^&]+)(?:&t=([^&]+)s)?/) ?? [];
  const timeQueryParameter = time ? `start=${time}` : '';

  return `<iframe
    loading="lazy"
    src="https://www.youtube.com/embed/${videoId}?${timeQueryParameter}"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen="allowFullScreen"
    style="position: absolute; width: 100%; height: 100%; left: 0px; top: 0px;"
    width="560"
    height="315"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>`;
}

/**
 * Generates a code snippet for Google Analytics
 *
 * @param {string} googleAnalyticsId A Google Analytics ID
 * @param {boolean} isProduction Whether or not the application is being built for production or not.
 *
 * @returns {string} The markup snippet to inject Google Analytics.
 */
function googleAnalytics(
  googleAnalyticsId,
  isProduction = process.env.NODE_ENV === `production`
) {
  if (!isProduction) {
    return '';
  }

  return `<script async="async" src="https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());

      gtag('config', '${googleAnalyticsId}');
    </script>`;
}

/**
 * Generates a social image for the given title and excerpt of a page.
 *
 * @param {string} title
 * @param {string} excerpt
 *
 * @returns {string} An URL in string format representing a social image for a page.
 */
function socialImage(title, excerpt = '') {
  const innerWhitespaceTrimmedExcerpt = excerpt.replace(/\s+/g, ' ');
  const truncatedExcerpt =
    innerWhitespaceTrimmedExcerpt.length > 101
      ? innerWhitespaceTrimmedExcerpt.substr(0, 101) + '...'
      : innerWhitespaceTrimmedExcerpt;
  const encodedTitle = encodeURIComponent(encodeURIComponent(title));
  const encodedExcerpt = encodeURIComponent(encodeURIComponent(truncatedExcerpt));

  return `https://res.cloudinary.com/nickytonline/image/upload/w_1280,h_669,c_fill,q_auto,f_auto/w_860,c_fit,co_rgb:ffffff,g_south_west,x_30,y_280,l_text:roboto_64_bold:${encodedTitle}/w_860,c_fit,co_rgb:ffffff,g_north_west,x_30,y_410,l_text:arial_48:${encodedExcerpt}/social`;
}

/**
 * Generates an embed based on the given URL.
 *
 * @param {string} url URL to embed.
 *
 * @returns {string} Markup for the embed.
 */
function embedEmbed(url) {
  // This is based off the generic dev.to embed liquid tag.
  if (url.includes('youtube.com')) {
    const videoId = new URL(url).searchParams.get('v');
    return youtubeEmbed(videoId);
  }

  if (url.includes('github.com')) {
    return githubEmbed(url);
  }

  if (url.includes('twitter.com')) {
    const {tweetId} = url.match(
      /twitter\.com\/[^\/]+\/status\/(?<tweetId>[^\/]+)/
    ).groups;
    return twitterEmbed(tweetId);
  }

  if (url.includes('dev.to')) {
    const {username, slug} = url.match(
      /dev\.to\/(?<username>[^\/]+)\/(?<slug>[^\/]+)/
    ).groups;

    if (slug) {
      return devLinkEmbed(url);
    }

    if (username) {
      return devUserEmbed(username);
    }
  }

  throw new Error(`unsupported embed for ${url}`);
}

/**
 * Generates a Twitter embed based for the given Twee ID.
 *
 * @param {string} tweetId A tweet ID
 *
 * @returns {string} Markup for the Twitter embed.
 */
function twitterEmbed(tweetId) {
  return `<iframe class="liquidTag" src="https://dev.to/embed/twitter?args=${tweetId}" style="border: 0; width: 100%;"></iframe>`;
}

/**
 * Generates a Codepen embed for the given Codepen URL.
 *
 * @param {string} url A codepen URL
 *
 * @returns {string} Markup for the Codepen embed.
 */
function codepenEmbed(url) {
  return `<iframe height="300" style="width: 100%;" scrolling="no" title="Codepen from ${url}" src="${url}?default-tab=js%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"></iframe>`;
}

/**
 * Generates a dev.to link embed for the given dev.to URL.
 *
 * @param {string} url A dev.to URL
 *
 * @returns {string} Markup for the dev.to link embed.
 */
function devLinkEmbed(url) {
  return `<iframe class="liquidTag" src="https://dev.to/embed/link?args=${encodeURIComponent(
    url
  )}" style="border: 0; width: 100%;"></iframe>`;
}

/**
 * Generates a dev.to comment embed for the given dev.to comment ID.
 *
 * @param {string} commentId A dev.to comment ID.
 *
 * @returns {string} Markup for the dev.to comment embed.
 */
function devCommentEmbed(commentId) {
  return `<iframe class="liquidTag" src="https://dev.to/embed/devcomment?args=${commentId}" style="border: 0; width: 100%;"></iframe>`;
}

/**
 * Generates a GitHub embed for the given GitHub URL.
 *
 * @param {string} url A GitHub URL
 *
 * @returns {string} Markup for the GitHub embed.
 */
function githubEmbed(url) {
  return `<iframe class="liquidTag" src="https://dev.to/embed/github?args=${encodeURIComponent(
    url
  )}" style="border: 0; width: 100%;"></iframe>`;
}

/**
 * Generates a Instagram embed for the given Instagram URL.
 *
 * @param {string} url An Instagram URL
 *
 * @returns {string} Markup for the Instagram embed.
 */
function instagramEmbed(url) {
  return `<iframe class="liquidTag" src="https://dev.to/embed/instagram?args=${encodeURIComponent(
    url
  )}" style="border: 0; width: 100%;"></iframe>`;
}

/**
 * Generates a dev.to user embed for the given dev.to username.
 *
 * @param {string} username A dev.to username
 *
 * @returns {string} Markup for the dev.to user embed.
 */
function devUserEmbed(username) {
  return `<iframe class="liquidTag" src="https://dev.to/embed/user?args=${encodeURIComponent(
    username
  )}" style="border: 0; width: 100%;"></iframe>`;
}

/**
 * Generates a dev.to tag embed for the given dev.to tag ID.
 *
 * @param {string} tagId A dev.to username
 *
 * @returns {string} Markup for the dev.to tag embed.
 */
function devTagEmbed(tagId) {
  return `<iframe class="liquidTag" src="https://dev.to/embed/tag?args=${encodeURIComponent(
    tagId
  )}" style="border: 0; width: 100%;"></iframe>`;
}

/**
 * Generates a dev.to org embed for the given dev.to organization ID.
 *
 * @param {string} orgId A dev.to organization ID
 *
 * @returns {string} Markup for the dev.to user embed.
 */
function devOrgEmbed(orgId) {
  return `<iframe class="liquidTag" src="https://dev.to/embed/organization?args=${encodeURIComponent(
    orgId
  )}" style="border: 0; width: 100%;"></iframe>`;
}

/**
 * Generates a repl.it embed for the given repl.it URL.
 *
 * @param {string} url A repl.it URL
 *
 * @returns {string} Markup for the repl.it embed.
 */
function replitEmbed(url) {
  return `<iframe class="liquidTag" src="https://dev.to/embed/replit?args=${encodeURIComponent(
    url
  )}" style="border: 0; width: 100%;"></iframe>`;
}

/**
 * Generates a dev.to podcast embed for the given dev.to podcast URL.
 *
 * @param {string} url An dev.to podcast URL
 *
 * @returns {string} Markup for the dev.to podcast embed.
 */
function devPodcastEmbed(url) {
  return `<iframe class="liquidTag" src="https://dev.to/embed/podcast?args=${encodeURIComponent(
    url
  )}" style="border: 0; width: 100%;"></iframe>`;
}

/**
 * Generates a CodeSandbox embed for the given CodeSandbox ID.
 *
 * @param {string} sandboxId A CodeSandbox ID.
 *
 * @returns {string} Markup for the CodeSandbox embed.
 */
function codeSandboxEmbed(sandboxId) {
  return `<iframe src="https://codesandbox.io/embed/${sandboxId}?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="${sandboxId}"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>`;
}

module.exports = {
  boostLink,
  youtubeEmbed,
  googleAnalytics,
  socialImage,
  embedEmbed,
  twitterEmbed,
  codepenEmbed,
  devLinkEmbed,
  devCommentEmbed,
  githubEmbed,
  instagramEmbed,
  devUserEmbed,
  devTagEmbed,
  devOrgEmbed,
  replitEmbed,
  devPodcastEmbed,
  codeSandboxEmbed
};
