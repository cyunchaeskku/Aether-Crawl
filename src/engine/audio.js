// src/engine/audio.js — Audio helpers

import {
  SFX_ATTACK,
  SFX_DEATH,
  SFX_SHIELD,
  SFX_ENEMY_DEATH,
  SFX_ENEMY_ATTACK,
  BGM_PATH
} from '../data.js';
import { saveState } from '../state.js';

let bgmPlaylist = [];
let currentBgmIndex = 0;
let bgmPlayer = null;
let audioInitialized = false;

export function playSFX(type) {
  let file = '';
  if (type === 'attack') {
    file = SFX_ATTACK[Math.floor(Math.random() * SFX_ATTACK.length)];
  } else if (type === 'death') {
    file = SFX_DEATH;
  } else if (type === 'shield') {
    file = SFX_SHIELD;
  } else if (type === 'enemy_death') {
    file = SFX_ENEMY_DEATH[Math.floor(Math.random() * SFX_ENEMY_DEATH.length)];
  } else if (type === 'enemy_attack') {
    file = SFX_ENEMY_ATTACK;
  }
  if (!file) return;
  const sfx = new Audio(file);
  sfx.volume = 0.325;
  sfx.play().catch(() => {});
}

export async function initAudio(state) {
  if (audioInitialized) return;
  audioInitialized = true;
  if (!state.settings.bgmEnabled) return;
  try {
    const response = await fetch(BGM_PATH + 'list.json');
    bgmPlaylist = await response.json();
    currentBgmIndex = Math.floor(Math.random() * bgmPlaylist.length);
    playNextTrack(state);
  } catch (err) {
    console.error('Failed to load BGM list:', err);
  }
}

function playNextTrack(state) {
  if (!state.settings.bgmEnabled || !bgmPlaylist.length) return;

  if (bgmPlayer) {
    bgmPlayer.pause();
    bgmPlayer.removeEventListener('ended', playNextTrack);
  }
  const trackName = bgmPlaylist[currentBgmIndex];
  bgmPlayer = new Audio(BGM_PATH + encodeURIComponent(trackName));
  bgmPlayer.volume = 0.4;
  bgmPlayer.play().catch(() => console.log('Autoplay prevented. Click to play.'));

  const onEnded = () => {
    currentBgmIndex = (currentBgmIndex + 1) % bgmPlaylist.length;
    playNextTrack(state);
  };
  bgmPlayer.addEventListener('ended', onEnded);
}

export function toggleBGM(state, render) {
  state.settings.bgmEnabled = !state.settings.bgmEnabled;
  if (state.settings.bgmEnabled) {
    if (!audioInitialized) {
      initAudio(state);
    } else {
      playNextTrack(state);
    }
  } else {
    if (bgmPlayer) {
      bgmPlayer.pause();
    }
  }
  saveState(state);
  render();
}
