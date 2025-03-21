import React from "react";
import clipboardCopy from 'clipboard-copy';

type CopyUrlButton = {
  url: string;
};

const CopyUrlButton: React.FC<CopyUrlButton> = ({ url }) => {
  const copyToClipboard = () => {
    clipboardCopy(url)
      .then(() => {
        alert('URL copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  };

  return (
    <button onClick={copyToClipboard}>
      Copy URL
    </button>
  );
};

export default CopyUrlButton;