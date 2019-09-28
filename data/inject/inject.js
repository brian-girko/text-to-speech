/* globals TTS */
'use strict';

{
  if (window.div) {
    window.div.tts.stop();
    window.div.remove();
    delete window.div;
  }
  else {
    const selection = window.getSelection();
    if (selection && selection.rangeCount && selection.toString().trim().length) {
      let range;
      if (selection.getRangeAt) {
        range = selection.getRangeAt(0);
      }
      else {
        range = document.createRange();
        range.setStart(selection.anchorNode, selection.anchorOffset);
        range.setEnd(selection.focusNode, selection.focusOffset);
      }
      // feed selected text
      const iterator = document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let c;
      while (c = iterator.nextNode()) {
        if (nodes.length === 0 && c !== range.startContainer) {
          continue;
        }
        nodes.push(c);
        if (c === range.endContainer) {
          break;
        }
      }
      range.collapse();
      //
      const div = document.createElement('div');
      window.div = div;
      div.style = `
        position: fixed;
        right: 10px;
        top: 10px;
        background-color: #f9f9f9;
        z-index: 100000;
      `;
      chrome.runtime.sendMessage({
        method: 'inject-tts'
      }, async () => {
        const tts = new TTS();
        div.tts = tts;
        tts.feed(...nodes);
        document.body.appendChild(div);
        await tts.attach(div);
        tts.create();
        tts.start();
        tts.on('idle', () => window.setTimeout(() => window.div.remove(), 500));
      });
    }
    else {
      chrome.runtime.sendMessage({
        method: 'notify',
        message: 'Please select some text then press this button to read the selected text'
      });
    }
  }
}
