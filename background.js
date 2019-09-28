'use strict';

const notify = e => chrome.notifications.create({
  type: 'basic',
  iconUrl: '/data/icons/48.png',
  title: chrome.runtime.getManifest().name,
  message: e.message || e
});

chrome.browserAction.onClicked.addListener(() => chrome.tabs.executeScript({
  file: 'data/inject/inject.js',
  runAt: 'document_start'
}, () => {
  const lastError = chrome.runtime.lastError;
  if (lastError) {
    return notify(lastError.message);
  }
}));


chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'notify') {
    notify(request.message);
  }
  else if (request.method === 'inject-tts') {
    chrome.storage.local.get({
      'how-to-close': true
    }, prefs => {
      if (prefs['how-to-close']) {
        notify('Press the toolbar button once more to close the TTS popup');
        chrome.storage.local.set({
          'how-to-close': false
        });
      }
    });
    chrome.tabs.insertCSS({
      file: 'data/inject/inject.css',
      runAt: 'document_start'
    }, () => chrome.tabs.executeScript({
      file: 'data/tts/tts.js',
      runAt: 'document_start'
    }, () => chrome.tabs.executeScript({
      file: 'data/tts/engines/watson.js',
      runAt: 'document_start'
    }, response)));
    return true;
  }
});
