export default function decorate(block) {
  // Homepage block is no longer used - content is now in separate blocks (news-slider, cards)
  block.remove();
}
