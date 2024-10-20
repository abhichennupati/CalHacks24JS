const BASE_URL = "https://api.chennupati.dev";

// Helper function to handle API calls
async function callApi(endpoint, method, payload) {
  console.log(BASE_URL + endpoint, method, payload);
  try {
    const response = await fetch(BASE_URL + endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Assuming the API returns an object with an 'id' field
    if (!data.id) {
      throw new Error("API response missing id field");
    }

    return { id: data.id };
  } catch (error) {
    console.error("Error adding source:", error.message);
    throw error;
  }
}

// 1. Get Similar Papers
/**
 * @param {string} paperId
 * @returns {Promise<{ papers: Array<{ id: string, title: string, text: string, score: number }> }>}
 * @throws {Error} With message "Missing paper_id in request" or "An error occurred"
 */
export async function getSimilarPapers(paperId) {
  return callApi("/get_similar_papers", "POST", { paper_id: paperId });
}

// 2. Get Source Paper Links
/**
 * @param {string} sourceId
 * @returns {Promise<{ papers: Array<{ paper_id: string }> }>}
 * @throws {Error} With message "Missing source_id in request"
 */
export async function getSourcePaperLinks(sourceId) {
  return callApi("/get_source_paper_links", "POST", { source_id: sourceId });
}

// 3. Add Paper
/**
 * @param {string} title
 * @param {string} text
 * @param {string} owner
 * @returns {Promise<{ id: string }>}
 * @throws {Error} With message "missing field"
 */
export async function addPaper(title, text, owner) {
  return callApi("/add_paper", "POST", { title, text, owner });
}

// 4. Update Paper
/**
 * @param {string} id
 * @param {string} title
 * @param {string} text
 * @returns {Promise<void>}
 * @throws {Error} With message "missing field"
 */
export async function updatePaper(id, title, text) {
  return callApi("/update_paper", "POST", { id, title, text });
}

// 5. Add Source
/**
 * @param {string} paperId
 * @param {string} url
 * @param {string} title
 * @returns {Promise<{ id: string }>}
 * @throws {Error} With message "missing field"
 */
export async function addSource(paperId, url, title) {
  return callApi("/add_source", "POST", {
    paper_id: paperId,
    url: url,
    title: title,
  });
}
