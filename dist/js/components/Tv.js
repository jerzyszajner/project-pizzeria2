import { select, templates } from "../settings.js";

class Tv {
  constructor(element) {
    const thisTv = this;

    thisTv.render(element);
  }

  async render(element) {
    const thisTv = this;

    thisTv.dom = {};
    thisTv.dom.wrapper = element;
    thisTv.dom.wrapper.innerHTML = templates.tvSection();

    // Initialize the player
    thisTv.initializePlayer();
  }

  initializePlayer() {
    const thisTv = this;

    thisTv.streamLink = null;

    // Initialize video.js player
    thisTv.player = videojs(select.tv.playerVideo);

    // Add event listener for the play button
    thisTv.addPlayButtonListener();

    // Listen for the 'pause' event and stop streaming
    thisTv.player.on('pause', () => {
      thisTv.disposePlayer();
    });
  }

  addPlayButtonListener() {
    const thisTv = this;

    thisTv.bigPlayButton = document.querySelector(select.tv.bigPlayButton);
    thisTv.bigPlayButtonListener = async () => {
      if (!thisTv.player.currentSrc() && !thisTv.streamLink) {
        thisTv.streamLink = await thisTv.getNewStreamLink();
        console.log("Fetched stream link:", thisTv.streamLink);
        if (thisTv.streamLink) {
          thisTv.player.src({
            src: thisTv.streamLink,
            type: 'application/x-mpegURL'
          });
          thisTv.player.play(); // Start playback after setting the source
        } else {
          console.error('No stream link available');
        }
      } else if (thisTv.streamLink) {
        thisTv.player.play(); // Continue playback if the source already exists
      }
    };
    thisTv.bigPlayButton.addEventListener('click', thisTv.bigPlayButtonListener);
  }

  disposePlayer() {
    const thisTv = this;

    if (thisTv.player) {
      thisTv.player.dispose();
    }
    thisTv.dom.wrapper.querySelector(select.tv.containerVideo).innerHTML = '<video id="my-player" class="video-js vjs-default-skin" controls preload="none"></video>';
    thisTv.initializePlayer();
  }

  async getNewStreamLink(retries = 3) {
    try {
      const response = await fetch('http://localhost:3002/fetch-stream-link');
      if (response.ok) {
        const data = await response.json();
        return data.streamLink;
      } else {
        throw new Error(`Failed to fetch stream link: ${response.statusText}`);
      }
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying... (${3 - retries + 1})`);
        return await this.getNewStreamLink(retries - 1);
      } else {
        console.error('Error fetching stream link:', error);
        return null;
      }
    }
  }

}

export default Tv;