import * as pdfjsLib from "pdfjs-dist";

// Use a public CDN for the worker to avoid Vite build configuration issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const items = textContent.items;

          // Determine page width to calculate midpoint for column detection
          const viewport = page.getViewport({ scale: 1.0 });
          const midX = viewport.width / 2;

          const leftItems = [];
          const rightItems = [];
          let crossingMidpoint = 0;

          items.forEach((item) => {
            const x = item.transform[4];
            const width = item.width || item.str.length * 5; // Fallback estimate
            const rightEdge = x + width;

            if (x < midX) {
              leftItems.push(item);
              // If the item starts in the left column but crosses the center heavily
              if (rightEdge > midX + 20) {
                crossingMidpoint++;
              }
            } else {
              rightItems.push(item);
            }
          });

          // Helper to sort a column of text vertically then horizontally
          const sortColumn = (col) => {
            return col.sort((a, b) => {
              const yA = a.transform[5];
              const yB = b.transform[5];
              // If roughly on the same line (within 5 units)
              if (Math.abs(yA - yB) < 5) {
                return a.transform[4] - b.transform[4];
              }
              return yB - yA; // Y is usually bottom-to-top, so sort descending
            });
          };

          const processColumn = (colItems) => {
            let text = "";
            let lastY = null;
            for (const item of colItems) {
              if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
                text += "\n";
              } else if (lastY !== null) {
                text += " ";
              }
              text += item.str;
              lastY = item.transform[5];
            }
            return text;
          };

          let pageText = "";

          // If few items cross the center and we have a decent amount of text, it's likely multi-column
          if (
            crossingMidpoint < 5 &&
            items.length > 20 &&
            rightItems.length > 5
          ) {
            // Multi-column Layout Detection
            sortColumn(leftItems);
            sortColumn(rightItems);
            pageText =
              processColumn(leftItems) + "\n\n" + processColumn(rightItems);
          } else {
            // Single-column Layout
            const sorted = sortColumn(items);
            pageText = processColumn(sorted);
          }

          fullText += pageText + "\n\n";
        }
        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
