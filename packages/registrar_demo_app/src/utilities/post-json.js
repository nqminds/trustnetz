const postJson = async (body, url) => {
  try {
    let options = {
      method: "POST",
      headers: {
          "Content-Type":"application/json",
      },
      body: JSON.stringify(body),
    }
    let res = await fetch(url, options);
    let response = null;
    try {
      response = await res.clone().json();
    }
    catch {
      response = await res.text();
    }
    return response;
  } catch (err) {
    console.error(err);
  }
}

export default postJson;