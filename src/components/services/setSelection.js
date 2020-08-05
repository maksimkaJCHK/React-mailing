export default function setSelection(target) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(target);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
  target.focus();
  range.detach();
}