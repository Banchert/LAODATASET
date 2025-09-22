/**
 * Checks if a given font file supports essential Lao characters.
 * @param fontFile The font file to validate.
 * @returns A promise that resolves to true if the font is likely a Lao font, false otherwise.
 */
export async function isValidLaoFont(fontFile: File): Promise<boolean> {
  console.log(`Starting validation for font: ${fontFile.name}`);
  
  // Check file extension first
  const extension = fontFile.name.toLowerCase().split('.').pop();
  if (!['ttf', 'otf', 'woff', 'woff2'].includes(extension || '')) {
    console.log(`Font ${fontFile.name} rejected: Invalid extension`);
    return false;
  }

  // Check file size (should be reasonable for a font file) - more lenient range
  if (fontFile.size < 100 || fontFile.size > 100 * 1024 * 1024) {
    console.log(`Font ${fontFile.name} rejected: Invalid size ${fontFile.size} bytes`);
    return false;
  }

  const testString = 'ສະບາຍດີ'; // Common Lao greeting
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    console.error('Could not get canvas context for font validation.');
    // If canvas is not supported, assume font is valid for now
    return true;
  }

  canvas.width = 400;
  canvas.height = 100;

  // Perform actual font testing
  return performFontTest(fontFile, testString, canvas, ctx);
}

/**
 * Perform comprehensive font testing
 */
async function performFontTest(
  fontFile: File, 
  testString: string, 
  canvas: HTMLCanvasElement, 
  ctx: CanvasRenderingContext2D
): Promise<boolean> {
  const fontUrl = URL.createObjectURL(fontFile);
  const fontName = `font-validator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const fontFace = new FontFace(fontName, `url(${fontUrl})`);
    console.log(`🔍 Testing font: ${fontFile.name}`);
    
    await fontFace.load();
    document.fonts.add(fontFace);
    
    // Wait for font to be ready
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test 1: Render with custom font
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = `32px "${fontName}"`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(testString, 20, 50);
    
    const customImageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const customPixelCount = countNonBgPixels(customImageData, 255);

    // Test 2: Render with system font
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '32px Arial, sans-serif';
    ctx.fillText(testString, 20, 50);
    
    const systemImageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const systemPixelCount = countNonBgPixels(systemImageData, 255);

    // Test 3: Measure text width
    ctx.font = `32px "${fontName}"`;
    const customWidth = ctx.measureText(testString).width;
    
    ctx.font = '32px Arial, sans-serif';
    const systemWidth = ctx.measureText(testString).width;

    console.log(`Font test results for ${fontFile.name}:`);
    console.log(`- Custom pixels: ${customPixelCount}, width: ${customWidth}px`);
    console.log(`- System pixels: ${systemPixelCount}, width: ${systemWidth}px`);

    // Clean up
    document.fonts.delete(fontFace);
    URL.revokeObjectURL(fontUrl);

    // Enhanced validation logic
    const hasRendering = customPixelCount > 100; // Minimum pixels for text
    const hasReasonableWidth = customWidth > 20; // Minimum reasonable width
    const isDifferentPixels = Math.abs(customPixelCount - systemPixelCount) > 50;
    const isDifferentWidth = Math.abs(customWidth - systemWidth) > 5;
    const isDifferent = isDifferentPixels || isDifferentWidth;
    
    // Additional test: Check if font can render individual Lao characters
    const laoChars = ['ສ', 'ະ', 'ບ', 'າ', 'ຍ', 'ດ', 'ີ'];
    let laoCharSupport = 0;
    
    for (const char of laoChars) {
      ctx.font = `32px "${fontName}"`;
      const charWidth = ctx.measureText(char).width;
      if (charWidth > 5) { // Character has reasonable width
        laoCharSupport++;
      }
    }
    
    const laoSupportRatio = laoCharSupport / laoChars.length;
    const hasGoodLaoSupport = laoSupportRatio >= 0.7; // At least 70% of test characters work
    
    // Final validation
    const isValid = hasRendering && hasReasonableWidth && hasGoodLaoSupport && 
                   (isDifferent || customPixelCount > 500);
    
    console.log(`Font ${fontFile.name} validation: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- Has rendering: ${hasRendering} (${customPixelCount} pixels)`);
    console.log(`- Has reasonable width: ${hasReasonableWidth} (${customWidth}px)`);
    console.log(`- Is different from system: ${isDifferent}`);
    console.log(`- Lao character support: ${laoSupportRatio * 100}% (${laoCharSupport}/${laoChars.length})`);
    
    return isValid;

  } catch (error) {
    console.error(`Error testing font ${fontFile.name}:`, error);
    URL.revokeObjectURL(fontUrl);
    return false; // Be strict about errors
  }
}

/**
 * Counts the number of pixels in image data that are not a specific background color.
 */
function countNonBgPixels(data: Uint8ClampedArray, bgR: number): number {
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Check the red channel; if it's not the background color, count it.
    if (data[i] !== bgR) {
      count++;
    }
  }
  return count;
}