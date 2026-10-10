/**
 * Utility to print ONLY a specific HTML element cleanly.
 * Creates an isolated hidden iframe, injects the cloned HTML,
 * copies the document styles, and triggers print() inside the iframe.
 * This guarantees that headers, footers, sidebars, backgrounds, and other page elements
 * are NOT printed.
 */
export const printElement = (elementId: string, pageTitle?: string): boolean => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Print element #${elementId} not found, falling back to window.print()`);
    window.print();
    return false;
  }

  // Create an invisible iframe for isolated printing
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return false;
  }

  // Collect all stylesheets and style blocks from parent document
  const headElements = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map((node) => node.outerHTML)
    .join("\n");

  const titleHtml = pageTitle
    ? `<title>${pageTitle}</title>`
    : `<title>Parivattan Mission Foundation</title>`;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${titleHtml}
      ${headElements}
      <style>
        @page {
          size: auto;
          margin: 10mm;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body {
          background: #ffffff !important;
          background-image: none !important;
          color: #24312d !important;
          margin: 0 !important;
          padding: 12px !important;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        /* Hide all action buttons and print controls within the printed element */
        button, .no-print, [role="button"], .btn, input[type="button"], input[type="submit"] {
          display: none !important;
        }
        /* Ensure print borders and clean cards */
        .print-wrapper {
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
        }
      </style>
    </head>
    <body>
      <div class="print-wrapper">
        ${element.outerHTML}
      </div>
    </body>
    </html>
  `);
  doc.close();

  const trigger = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn("Iframe print notice:", e);
      window.print();
    } finally {
      // Remove iframe after user finishes or cancels print dialog
      setTimeout(() => {
        try {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        } catch {}
      }, 2500);
    }
  };

  // Wait for styles and images to settle in the iframe
  setTimeout(trigger, 300);
  return true;
};
