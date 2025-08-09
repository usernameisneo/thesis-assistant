// Web Worker for fetching URLs and parsing HTML/PDF content
// This worker handles document ingestion for the thesis-assistant app

// Listen for messages from the main thread
self.addEventListener('message', async function(event) {
  const { operation, url, file } = event.data;

  try {
    if (operation === 'html' && url) {
      await handleHtmlFetch(url);
    } else if (operation === 'pdf' && file) {
      await handlePdfParse(file);
    } else {
      postMessage({
        success: false,
        error: 'Invalid operation or missing data',
        operation: operation || 'unknown'
      });
    }
  } catch (error) {
    postMessage({
      success: false,
      error: error.message,
      operation: operation || 'unknown'
    });
  }
});

// Handle HTML URL fetching and parsing
async function handleHtmlFetch(url) {
  try {
    // Fetch the URL content
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const htmlContent = await response.text();
    
    // Parse HTML using DOMParser
    const parser = new DOMParser();
    const document = parser.parseFromString(htmlContent, 'text/html');
    
    // Extract relevant data
    const title = document.querySelector('title')?.textContent || 'No title found';
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Extract main content (try multiple selectors for better content extraction)
    let bodyText = '';
    const contentSelectors = [
      'main',
      'article', 
      '.content',
      '#content',
      '.post-content',
      '.entry-content',
      'body'
    ];
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        bodyText = element.textContent || element.innerText || '';
        break;
      }
    }
    
    // Clean up the text (remove extra whitespace)
    bodyText = bodyText.replace(/\s+/g, ' ').trim();
    
    // Extract links
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map(link => ({
        text: link.textContent.trim(),
        href: link.href
      }))
      .filter(link => link.text && link.href);
    
    // Extract headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(heading => ({
        level: heading.tagName.toLowerCase(),
        text: heading.textContent.trim()
      }))
      .filter(heading => heading.text);

    // Post successful result back to main thread
    postMessage({
      operation: 'html',
      success: true,
      data: {
        url: url,
        title: title,
        metaDescription: metaDescription,
        bodyText: bodyText.substring(0, 10000), // Limit to first 10k characters
        links: links.slice(0, 50), // Limit to first 50 links
        headings: headings.slice(0, 20), // Limit to first 20 headings
        contentLength: bodyText.length,
        fetchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    postMessage({
      operation: 'html',
      success: false,
      error: `Failed to fetch/parse HTML: ${error.message}`,
      url: url
    });
  }
}

// Handle PDF file parsing
async function handlePdfParse(file) {
  try {
    // Check if file is actually a PDF
    if (file.type !== 'application/pdf') {
      throw new Error('File is not a PDF document');
    }

    // For basic PDF parsing, we'll use a simple approach
    // In a real implementation, you'd want to use PDF.js or similar library
    // For now, we'll extract basic file metadata and simulate text extraction
    
    const fileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    };

    // Convert file to ArrayBuffer for potential PDF.js processing
    const arrayBuffer = await file.arrayBuffer();
    
    // Basic PDF validation - check for PDF signature
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfSignature = '%PDF';
    const fileStart = String.fromCharCode.apply(null, uint8Array.slice(0, 4));
    
    if (!fileStart.startsWith(pdfSignature)) {
      throw new Error('Invalid PDF file format');
    }

    // Simulate text extraction (in real implementation, use PDF.js)
    // For demonstration, we'll return metadata and a placeholder for content
    const simulatedContent = {
      text: 'PDF content extraction would be implemented here using PDF.js library',
      pages: 'Unknown', // Would be determined by PDF.js
      author: 'Unknown', // Would be extracted from PDF metadata
      subject: 'Unknown', // Would be extracted from PDF metadata
      creator: 'Unknown' // Would be extracted from PDF metadata
    };

    // Post successful result back to main thread
    postMessage({
      operation: 'pdf',
      success: true,
      data: {
        metadata: fileMetadata,
        content: simulatedContent,
        extractedAt: new Date().toISOString(),
        note: 'PDF parsing requires PDF.js library integration for full functionality'
      }
    });

  } catch (error) {
    postMessage({
      operation: 'pdf',
      success: false,
      error: `Failed to parse PDF: ${error.message}`,
      filename: file?.name || 'unknown'
    });
  }
}

// Handle any unhandled errors
self.addEventListener('error', function(error) {
  postMessage({
    success: false,
    error: `Worker error: ${error.message}`,
    operation: 'error'
  });
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', function(event) {
  postMessage({
    success: false,
    error: `Unhandled promise rejection: ${event.reason}`,
    operation: 'error'
  });
  event.preventDefault();
});

console.log('Ingest Worker initialized and ready to process URLs and PDFs');
