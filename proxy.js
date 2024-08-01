import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const port = 3002;

app.use(cors());

const fetchStreamLink = async () => {
  const url = 'https://www.fashiontv.com/watch/18717158';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const text = await response.text();

    // Extract JSON data from the HTML
    const jsonRegex = /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/;
    const jsonMatch = text.match(jsonRegex);
    if (!jsonMatch) {
      throw new Error('No JSON match found in HTML');
    }

    const jsonData = JSON.parse(jsonMatch[1]);
    //console.log("Extracted JSON data:", jsonData);

    const streamURL = jsonData.props.pageProps.video.streamURL;
    if (!streamURL) {
      throw new Error('No stream URL found in JSON');
    }

    return streamURL;
  } catch (error) {
    console.error('Error fetching stream link:', error);
    throw error;
  }
};

app.get('/fetch-stream-link', async (req, res) => {
  try {
    const streamLink = await fetchStreamLink();
    res.json({ streamLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});