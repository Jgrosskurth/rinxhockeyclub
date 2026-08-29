instagram-feed.js:

export default function decorate(block) {
  const script = document.createElement('script');
  script.src = 'https://elfsightcdn.com/platform.js';
  script.async = true;
  document.head.appendChild(script);

  const widget = document.createElement('div');
  widget.className = 'elfsight-app-405c2abb-fb9e-4944-a39c-2f8f6f1a55ca';
  widget.setAttribute('data-elfsight-app-lazy', '');
  block.replaceChildren(widget);
}
