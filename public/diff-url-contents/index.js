function storeValue(key, value) {
  window.localStorage.setItem(key, value);
}

function getValue(key) {
  return window.localStorage.getItem(key) ?? undefined;
}

function handleUrlInput(event) {
  const {id, value} = event.target;
  storeValue(id, value);

  const queryParams = new URLSearchParams(window.decodeURI(window.location.hash.slice(1)));
  queryParams.set(id, window.encodeURI(value));
  window.location.hash = queryParams.toString();
}

async function getTextFromUrl(url) {
  if (url === undefined || url === "") {
    return "";
  }

  if (!isValidUrl(url)) {
    return `Error: Invalid URL ${url}`;
  }

  const response = await window.fetch(`https://corsproxy.io/?url=${encodeURI(url)}`);
  const text = await response.text();
  return text;
}

async function loadUrls(event, doDiff = false) {
  const urlA = getValue("url-a");
  const urlB = getValue("url-b");

  const textA = await getTextFromUrl(urlA);
  const textB = await getTextFromUrl(urlB);

  document.querySelector("#text-a").value = textA;
  document.querySelector("#text-b").value = textB;

  if (doDiff) {
    renderDiff(textA, textB);
  }
}

function diffTexts(event) {
  renderDiff(
    document.querySelector("#text-a").value,
    document.querySelector("#text-b").value,
  );
}

function renderDiff(a, b) {
  const diffRoot = document.querySelector("#diff-root");
  diffRoot.innerHTML = ""; // Remove any existing child elements.

  const diff = Diff.diffChars(a, b);

  for (const part of diff) {
    const span = document.createElement("span");
    span.style.backgroundColor = part.added ? "#00ff0044" : part.removed ? "#ff000044" : "transparent";
    span.style.color = part.added ? "#008800" : part.removed ? "#880000" : "black";
    span.style.textDecoration = part.added || part.removed ? "underline" : "none";
    span.textContent = part.value;
    diffRoot.insertAdjacentElement("beforeend", span);
  }
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("Diff URL Contents");

  const queryParams = new URLSearchParams(window.location.hash.slice(1));

  const urlA = document.querySelector("#url-a");
  urlA.addEventListener("input", handleUrlInput);

  const urlB = document.querySelector("#url-b");
  urlB.addEventListener("input", handleUrlInput);

  urlA.value = queryParams.get("url-a") ?? getValue(urlA.id) ?? "";
  urlB.value = queryParams.get("url-b") ?? getValue(urlB.id) ?? "";

  urlA.dispatchEvent(new Event("input"));
  urlB.dispatchEvent(new Event("input"));

  const loadUrlsButton = document.querySelector("#load-urls");
  loadUrlsButton.addEventListener("click", loadUrls);

  const diffTextsButton = document.querySelector("#diff-texts");
  diffTextsButton.addEventListener("click", diffTexts);

  if (isValidUrl(urlA.value) && isValidUrl(urlB.value)) {
    loadUrls(undefined, true);
  }
});
