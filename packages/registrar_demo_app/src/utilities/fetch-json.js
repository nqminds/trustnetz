const fetchJson = async (url) => {
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(`Error fetching from url ${url}:`, error);
  }
}

export default fetchJson;