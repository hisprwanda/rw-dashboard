import React, { useState } from "react";
import axios from "axios";

const TokenTest = () => {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    setResponse(null);
    setError(null);

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `ApiToken ${token}`,
        },
      });

      setResponse(res.data);
    } catch (err) {
      setError(err.response?.statusText || err.message || "An error occurred");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-lg font-bold mb-4">Test API with Token</h1>
      <div className="mb-4">
        <label htmlFor="url" className="block font-medium mb-1">
          URL:
        </label>
        <input
          type="text"
          id="url"
          className="w-full p-2 border rounded"
          placeholder="Enter API URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="token" className="block font-medium mb-1">
          Token:
        </label>
        <input
          type="text"
          id="token"
          className="w-full p-2 border rounded"
          placeholder="Enter Bearer Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <button
        onClick={handleFetch}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Fetch Data
      </button>
      <div className="mt-4">
        {response && (
          <div className="p-4 bg-green-100 rounded">
            <h2 className="font-bold">Response:</h2>
            <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 rounded">
            <h2 className="font-bold">Error:</h2>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenTest;
