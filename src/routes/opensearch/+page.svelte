<div class="max-w-screen-md mx-auto pt-6">
  <h2 class="pb-6">OpenSearch Integration for Query.rs</h2>
  <p>
    Query.rs now supports
    <a href="https://developer.mozilla.org/en-US/docs/Web/OpenSearch">
      OpenSearch specification</a
    >, enabling you to search Rust documentation directly from your browser's
    address bar.
  </p>
  <p class="py-4"></p>
  <h2 class="pb-6">How to Enable OpenSearch in Firefox?</h2>
  <ul class="list-decimal px-6">
    <li>
      Open <a href="/">https://query.rs</a>, right-click the address bar, then
      click <b>Add "Query.rs"</b>.
      <img
        class="py-6"
        src="/img/firefox-add-query-rs.png"
        alt="firefox-add-query-rs"
      />
    </li>
    <li>
      Go to <a href="about:preferences#search">about:preferences#search</a>
      page, set a shortcut of your choice <i>(e.g., @rust)</i> for Query.rs.
      <img
        class="py-6"
        src="/img/firefox-set-shortcut.png"
        alt="firefox-set-shortcut"
      />
    </li>
    <li>
      Use the shortcut in the address bar to search Rust docs
      <i>(e.g., @rust spawn)</i>
      <img class="py-6" src="/img/firefox-search.png" alt="firefox-search" />
    </li>
  </ul>
  <p class="py-4"></p>
  <p>
    <b>Troubleshooting</b>: If suggestions aren't working:
  </p>
  <ul class="list-decimal px-6">
    <li class="py-1">Navigate to <a href="about:config">about:config</a></li>
    <li class="py-1">
      Find <code class="text-[#f9bb2d]">browser.search.suggest.timeout</code>
    </li>
    <li class="py-1">
      Set the value to 2000 (milliseconds). (The default is 500ms and looks like
      not enough)
    </li>
    <li class="py-1">
      Remove and re-add the Query.rs search engine to apply changes
    </li>
  </ul>
  <p class="py-4"></p>
  <h2 class="pb-6">How to Enable OpenSearch in Edge?</h2>
  <ul class="list-decimal px-6">
    <li>
      Open <a href="/">https://query.rs</a>, click the star icon to add Query.rs
      to your favorites.
      <img
        class="py-6"
        src="/img/edge-add-query-rs.png"
        alt="edge-add-query-rs"
      />
    </li>
    <li>
      Go to
      <a href="edge://settings/searchEngines">edge://settings/searchEngines</a>
      page, set a shortcut of your choice <i>(e.g., @rust)</i> for Query.rs.
      <img
        class="py-6"
        src="/img/edge-set-shortcut.png"
        alt="edge-set-shortcut"
      />
    </li>
    <li>
      Use the shortcut in the address bar to search Rust docs
      <i>(e.g., @rust spawn)</i>
      <img class="py-6" src="/img/edge-search.png" alt="edge-search" />
    </li>
  </ul>
  <p class="py-4"></p>
  <p><b>Happy searching, Rustaceans!</b></p>
</div>
