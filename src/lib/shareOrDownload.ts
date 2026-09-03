export async function downloadBlob(
  blob: Blob,
  filename = 'meta-glasses-spin-story.jpg'
): Promise<void> {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
    anchor.remove();
  }, 4000);
}

export async function shareBlob(
  blob: Blob,
  filename = 'meta-glasses-spin-story.jpg'
): Promise<'shared' | 'cancelled' | 'unsupported'> {
  const file = new File([blob], filename, { type: 'image/jpeg' });

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Meta Glasses Spin Photo',
        text: 'Converted for Instagram Spin View story (3024×4032)'
      });
      return 'shared';
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'cancelled';
      }
      return 'unsupported';
    }
  }

  return 'unsupported';
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
