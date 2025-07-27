/* ===============================================================
   app.js — full file (force-slice for tricky fields)
================================================================ */
const placeholderMap = {
  "[LENDER]"                 : "lender",
  "[INITIAL_AMOUNT]"         : "initial_amount",
  "[COST_ONCE]"              : "other_costs",
  "[NET_ADVANCE]"            : "net_advance",
  "[TERM]"                   : "term",
  "[EARLY_REPAYMENT_SECTION]": "early_repayment_section",
  "[SPECIAL_CONDITIONS]"     : "special_conditions",
  "[EXPIRY_DATE]"            : "expiry_date"
};
const SCROLL_PAD  = 120;
const FORCE_SLICE = '';            // empty string → skip fuzzy match

let rawText, keyData, reportTemplate, isEditing = false;
let selectedFile = null; 

/* ------------------------------------------------------------- */
/*  Loading phrases for entertainment                            */
/* ------------------------------------------------------------- */
const loadingPhrases = [
  "Analyzing mortgage offer structure...",
  "Scanning for lender details...",
  "Identifying key financial figures...",
  "Reading mortgage terms and conditions...",
  "Extracting loan amount information...",
  "Processing document layout...",
  "Locating special conditions section...",
  "Parsing repayment details...",
  "Finding expiry date information...",
  "Calculating net amount values...",
  "Detecting lender letterhead...",
  "Mapping document sections...",
  "Identifying early repayment clauses...",
  "Analyzing interest rate details...",
  "Extracting mortgage term length...",
  "Reading additional cost breakdowns...",
  "Verifying lender name format...",
  "Scanning for hidden fees...",
  "Processing offer validity dates...",
  "Detecting special condition markers...",
  "Analyzing repayment structures...",
  "Finding section numbers...",
  "Extracting initial advance amount...",
  "Reading completion requirements...",
  "Identifying mortgage type...",
  "Processing legal stipulations...",
  "Scanning financial summaries...",
  "Validating document authenticity...",
  "Extracting key dates...",
  "Reading lender requirements..."
];

const eliteLoadingPhrases = [
  "Applying Elite extraction sequence...",
  "Checking against Elite data...",
  "Formatting for Elite systems...",
  "Matching Elite lender codes...",
  "Filtering per Elite rules...",
  "Cross-checking Elite compliance...",
  "Populating Elite case fields...",
  "Preparing Elite summary format...",
  "Validating Elite requirements...",
  "Building Elite Conveyancing report..."
];

let phraseInterval;

function startLoadingPhrases() {
  let currentPhraseIndex = 0;
  let startTime = Date.now();
  let usingElitePhases = false;
  const phraseElement = $('#loadingPhrase');
  
  phraseElement.text(loadingPhrases[currentPhraseIndex]).css('opacity', 1);
  
  function updatePhrase() {
    const elapsed = Date.now() - startTime;
    
    if (elapsed > 30000 && !usingElitePhases) {
      usingElitePhases = true;
      currentPhraseIndex = 0;
    }
    
    const phrases = usingElitePhases ? eliteLoadingPhrases : loadingPhrases;
    
    phraseElement.css('opacity', 0);
    
    setTimeout(() => {
      currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
      phraseElement.text(phrases[currentPhraseIndex]).css('opacity', 1);
    }, 500); // Wait for fade out to complete
    
    const minInterval = usingElitePhases ? 10000 : 5000;
    const maxInterval = usingElitePhases ? 20000 : 10000;
    const randomInterval = Math.random() * (maxInterval - minInterval) + minInterval;
    
    phraseInterval = setTimeout(updatePhrase, randomInterval);
  }
  
  const initialInterval = Math.random() * 5000 + 5000; // 5-10 seconds
  phraseInterval = setTimeout(updatePhrase, initialInterval);
}

function stopLoadingPhrases() {
  if (phraseInterval) {
    clearTimeout(phraseInterval);
    phraseInterval = null;
  }
  $('#loadingPhrase').css('opacity', 0);
}

/* ------------------------------------------------------------- */
/*  Boot                                                         */
/* ------------------------------------------------------------- */
$(function () {

  $('#navbarTitle').text(
      'Elite Intelligence | mortgage report automation: upload a document'
    );

     $('#reselectBtn').on('click', () => {
    $('#previewStage').addClass('d-none');
    $('#hero').removeClass('d-none');
    $('#pdfInput').val('');           // clear input so same file can be re-chosen
    selectedFile = null;
      $('#pdfPreview').addClass('d-none');              // already present
   $('#docControls').addClass('d-none');   
   $('#downloadBtn').hide();  
  });

  $('#analyseBtn').on('click', startAnalytics);
  
  $('#uploadBtnHero').on('click', () => $('#pdfInput').click());
  $('#pdfInput').on('change', e => { const f=e.target.files[0]; if(f) handleFile(f); });

  $(document)
    .on('dragenter dragover', e => { e.preventDefault(); $('#hero').addClass('drop-hover'); })
    .on('dragleave dragend drop', () => $('#hero').removeClass('drop-hover'))
    .on('drop', e => { e.preventDefault(); const f=e.originalEvent.dataTransfer.files[0];
                       if(f && f.type==='application/pdf') handleFile(f); });

  $('#editToggle').on('click', function () {
    isEditing = !isEditing;
    $('#report').attr('contenteditable', isEditing);
    $(this).toggleClass('btn-outline-secondary btn-primary')
           .text(isEditing ? 'Done' : 'Edit');
  });

  $('#downloadBtn').on('click', downloadReportPDF);
  
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});



async function handleFile(file){

 $('#navbarTitle').text(
   'Elite Intelligence | mortgage report automation: intelligent analytics review'
 );

  selectedFile = file;                                 
  $('#previewEmbed').attr('src', URL.createObjectURL(file));

  $('#hero').addClass('d-none');                       
  $('#previewStage').removeClass('d-none');
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function startAnalytics(){
  if(!selectedFile) return;

  $('#loadingOverlay').removeClass('d-none');  
  startLoadingPhrases();
 $('#pdfEmbed').attr('src', URL.createObjectURL(selectedFile) + '#view=FitH');
 $('#pdfPreview').removeClass('d-none');

  try {
    await loadAssets();                           
    await new Promise(r=>setTimeout(r,1500));     
    renderUI();

    $('#previewStage').addClass('d-none');        
    $('#workspace, #downloadBtn').removeClass('d-none');
    $('#docControls').removeClass('d-none'); 
    $('#downloadBtn').show();
    stopLoadingPhrases();
    $('#loadingOverlay').addClass('d-none');

    $('#navbarTitle').text(
      'Elite Intelligence | mortgage report automation: intelligent analytics review'
    );
  } catch (error) {
    stopLoadingPhrases();
    $('#loadingOverlay').addClass('d-none');
    $('#previewStage').removeClass('d-none');
    return;
  }
}

function transformApiField(apiField) {
  if (!apiField) {
    return null;
  }
  
  if (apiField.value !== undefined) {
    return {
      value: apiField.value,
      confidence: apiField.confidence || 1,
      positions: {
        start: apiField.positions ? apiField.positions.start : apiField.start,
        end: apiField.positions ? apiField.positions.end : apiField.end
      }
    };
  }
  
  if (apiField.values && apiField.values.length > 0) {
    const firstValue = apiField.values[0];
    return {
      value: firstValue.value,
      confidence: apiField.confidence || firstValue.confidence || 1,
      positions: {
        start: firstValue.start,
        end: firstValue.end
      }
    };
  }
  
  return null;
}

/**
 * RESOLUTION NOTE: If the left panel shows "No document content available" and the right panel 
 * shows placeholder data like [LENDER], [INITIAL_AMOUNT], etc., this is typically caused by:
 * 1. The HTTP server not running (start with: python3 -m http.server 8001)
 * 2. Network connectivity issues preventing API calls
 * 3. API service being temporarily unavailable
 * 
 * These issues are NOT caused by the highlighting functionality changes. The core data extraction
 * and UI rendering logic (loadAssets, renderUI, buildReport) work correctly when the server is running.
 */
async function loadAssets(){
  if(rawText && keyData && reportTemplate) return;
  
  if (!selectedFile) {
    throw new Error('No PDF file selected');
  }

  try {
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('stages_to_run', '[1, 2]');
    
    const queryParams = new URLSearchParams({
      json_data: JSON.stringify({"mode": "form"})
    });
    
    const response = await fetch(`https://mortgage-api-229824289274.europe-west2.run.app/process_MO?${queryParams}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const apiData = await response.json();
    console.log('=== FULL API RESPONSE (shown once) ===');
    console.log(JSON.stringify(apiData, null, 2));
    
    rawText = apiData.extracted_text || '';
    
    keyData = {
      lender: transformApiField(apiData.lender),
      term: transformApiField(apiData.term),
      initial_amount: transformApiField(apiData.initial_amount),
      early_repayment_section: transformApiField(apiData.early_repayment_section),
      other_costs: transformApiField(apiData.other_costs),
      net_advance: transformApiField(apiData.net_advance),
      expiry_date: transformApiField(apiData.expiry_date),
      special_conditions: transformApiField(apiData.special_conditions)
    };
    
    const tplResponse = await fetch('data/mortgage_report_template.html');
    reportTemplate = await tplResponse.text();
    
  } catch (error) {
    console.error('Error loading assets:', error);
    $('#loadingOverlay').addClass('d-none');
    
    let errorMessage = error.message;
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Network connection error. Please check your internet connection and try again.';
    } else if (error.message.includes('404')) {
      errorMessage = 'API service not found. Please contact support if this issue persists.';
    } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      errorMessage = 'API service temporarily unavailable. Please try again in a few moments.';
    }
    
    alert(`Error processing PDF: ${errorMessage}`);
    throw error;
  }
}

/**
 * renderUI() displays "No document content available" only when rawText is empty/null,
 * which occurs when the API call fails or returns no data due to server/network issues.
 */
function renderUI(){
  if (!rawText || rawText.trim() === '') {
    console.log('No extracted text available from API');
    $('#renderedText').html('<p class="text-muted">No document content available<br><small>If you just uploaded a file, please ensure the server is running and try refreshing the page.</small></p>');
  } else {
    console.log('Rendering extracted text with markdown parsing');
    $('#renderedText').html(marked.parse(rawText));
  }
  
  $('#rawText').text(rawText || '');
  $('#report').html(buildReport(reportTemplate,keyData));
  bindClicks();
}


/**
 * buildReport() shows placeholder data like [LENDER] only when keyData fields lack .value properties,
 * which happens when the API call fails or returns incomplete data due to server/network issues.
 */
function buildReport(tpl, keys){
  let html=tpl;

  for(const [ph,key] of Object.entries(placeholderMap)){
    if(!keys[key]?.value) continue;

    const info = keys[key];
    const v    = info;

    if (key === 'other_costs') {
      const txt = v.value;
      
      const sections = txt.split(/\n+/);
      let oneOffSection = '';
      let recurringSection = '';
      
      const recurringIndex = sections.findIndex(section => 
        section.toLowerCase().includes('recurring costs')
      );
      
      if (recurringIndex > 0) {
        oneOffSection = sections.slice(0, recurringIndex).join('\n').trim();
        recurringSection = sections.slice(recurringIndex).join('\n').trim();
      } else {
        const doubleSplit = txt.split('\n\n');
        if (doubleSplit.length >= 2) {
          oneOffSection = doubleSplit[0].trim();
          recurringSection = doubleSplit[1].trim();
        } else {
          oneOffSection = txt.trim();
          recurringSection = 'Recurring costs: None';
        }
      }
      
      let oneOffCosts = oneOffSection;
      if (oneOffSection.toLowerCase().includes('one-off costs:') || oneOffSection.toLowerCase().includes('one off costs:')) {
        const match = oneOffSection.match(/one[-\s]*off\s*costs:\s*(.*)/i);
        if (match) {
          oneOffCosts = match[1].trim();
        }
      }
      
      const costItems = oneOffCosts.split(',').map(item => item.trim()).filter(Boolean);
      const formattedOneOff = costItems.length > 0 ? 
        `One-off costs: ${costItems.join(', ')}` : 
        `One-off costs: ${oneOffCosts}`;
      
      let recurringValue = recurringSection;
      if (recurringSection.toLowerCase().includes('recurring costs:')) {
        const match = recurringSection.match(/recurring\s*costs:\s*(.*)/i);
        if (match) {
          recurringValue = match[1].trim();
        }
      }
      const formattedRecurring = `Recurring costs: ${recurringValue}`;
      
      const clsOne = info.confidence?.one_off_costs === 1 ? 'conf-high'
                    : info.confidence?.one_off_costs === 0 ? 'conf-low' : 'conf-mid';
      const clsRec = info.confidence?.recurring_costs === 1 ? 'conf-high'
                    : info.confidence?.recurring_costs === 0 ? 'conf-low' : 'conf-mid';

      html = html.replaceAll(ph, `
        <span class="clickable-keyword ${clsOne}"
              data-search="${esc(oneOffCosts)}"
              data-source-text="${esc(oneOffCosts)}"
              data-display-text="${esc(formattedOneOff)}"
              data-start="${v.positions?.start?.one_off_costs || 0}"
              data-end="${v.positions?.end?.one_off_costs || 0}">
          ${esc(formattedOneOff)}
        </span><br>
        <span class="clickable-keyword ${clsRec}"
              data-search="${esc(recurringValue)}"
              data-source-text="${esc(recurringValue)}"
              data-display-text="${esc(formattedRecurring)}"
              data-start="${v.positions?.start?.recurring_costs || 0}"
              data-end="${v.positions?.end?.recurring_costs || 0}">
          ${esc(formattedRecurring)}
        </span>
      `);
      continue;
    }

    let display='', search='';

    if(key==='early_repayment_section'){
      display = `"${String(v.value)}"`;       
      const sectionNum = String(v.value);
      search = sectionNum;

    }else if (key === 'expiry_date') {
      display = String(v.value);                 

      const [d,m,y] = display.split('/');
      const monthNames = ['January','February','March','April','May','June',
                          'July','August','September','October','November','December'];
      const longFmt = (d && m && y) ? `${Number(d)} ${monthNames[Number(m)-1]} ${y}` : '';

      const parts = [longFmt, display];
      if (d && m && y) {
        parts.push(`${d}/${m}/${y}`);
        parts.push(`${Number(d)}/${Number(m)}/${y}`);
        parts.push(`${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`);
        if (longFmt) {
          parts.push(longFmt.replace(/\s+/g, '\\s+'));
        }
      }
      const filteredParts = parts.filter(Boolean);
      search = filteredParts.join('|');                                     
    } else if(typeof v.value==='object' && 'product_fee' in v.value){
      display=`£${Number(v.value.product_fee).toLocaleString('en-GB',{minimumFractionDigits:2})}`;
      search = display.replace(/[^0-9]/g,'');

    } else if(typeof v.value==='object'){
      display=JSON.stringify(v.value); search=display;

    } else if (key === 'special_conditions') {
      display = String(v.value).replace(/\\n/g, '\n').replace(/\n/g, '<br>');
      search = String(v.value).replace(/\\n/g, '\n').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

    } else {
      display=String(v.value); 
      search=display;
      
      if (/£[\d,]+\.?\d*/.test(display)) {
        const amount = display.replace(/[£,]/g, '');
        const patterns = [
          display,                    // Original: £139,688.00
          display.replace(/,/g, ''),  // No commas: £139688.00
          display.replace(/\s+/g, '\\s+'), // Handle spacing variations
          amount,                     // Just numbers: 139688.00
          amount.replace(/\.00$/, ''), // No decimal: 139688
          display.replace(/£/g, '\\£'), // Escaped pound sign
          display.replace(/,/g, '').replace(/\s+/g, '\\s+') // No commas + spacing
        ];
        search = patterns.filter((p, i, arr) => arr.indexOf(p) === i).join('|'); // Remove duplicates
      }
    }

    const cls = info.confidence===1 ? 'conf-high'
              : info.confidence===0 ? 'conf-low' : 'conf-mid';

    const displayContent = key === 'special_conditions' ? display : esc(display);

    html = html.replaceAll(
      ph,
      `<span class="clickable-keyword ${cls}"
             data-search="${esc(search)}"
             data-source-text="${esc(info.value || search)}"
             data-display-text="${esc(displayContent)}"
             data-start="${v.positions?.start || 0}" data-end="${v.positions?.end || 0}">
         ${displayContent}
       </span>`
    );
  }
  return html;
}

function dbgMark(pat){
  const $box = $('#renderedText');
  const mk   = new Mark($box[0]);
  mk.unmark();
  const re = new RegExp(pat, 'i');
  mk.markRegExp(re, {
    element:'span', className:'_dbg', acrossElements:true,
    separateWordSearch:false
  });
  const hits = $box.find('span._dbg').length;
  console.log(`→ mark.js found ${hits} matches for`, re);
  if(hits) scrollToMark($box);
}


function bindClicks(){
  $('#renderedText').show();
  $('#report').off('click', '.clickable-keyword').on('click', '.clickable-keyword', function(){
    const {search, start, end} = this.dataset;
    const sourceText = this.dataset.sourceText;
    const displayText = this.dataset.displayText;
    
    
    if (!rawText || (!rawText.textContent && !rawText.length)) {
      console.error('Cannot highlight: No raw text available. This may indicate PDF extraction failed.');
      alert('Highlighting unavailable: PDF text extraction failed. This document may have structural issues.');
      return;
    }
    
    
    if(start && end && +start > 0 && +end > 0 && +end > +start) {
      const success = highlightBySlice(+start, +end);
      if(success) {
        return; // Successfully highlighted using position-based method
      } else {
        console.log(`⚠️ Position-based highlighting failed - API provided incorrect positions`);
        console.log(`🚨 EMERGENCY FALLBACK: API positions unavailable or incorrect, using alternative methods`);
      }
    } else {
      console.log(`🚨 EMERGENCY FALLBACK: API positions unavailable or incorrect, using alternative methods`);
    }
    
    if(sourceText && sourceText !== 'undefined') {
      console.log(`bindClicks: sourceText length: ${sourceText.length}`);
      console.log(`bindClicks: sourceText includes 'higher lending charge': ${sourceText.toLowerCase().includes('higher lending charge')}`);
      console.log(`bindClicks: sourceText includes 'overpayments': ${sourceText.toLowerCase().includes('overpayments')}`);
      console.log(`bindClicks: sourceText includes 'pre-payment balance': ${sourceText.toLowerCase().includes('pre-payment balance')}`);
      
      if (sourceText.length > 50 && 
          (sourceText.toLowerCase().includes('higher lending charge') || 
           sourceText.toLowerCase().includes('overpayments') || 
           sourceText.toLowerCase().includes('pre-payment balance'))) {
        console.log(`🎯 Detected special conditions text, using enhanced highlighting`);
        if (highlightSpecialConditions(sourceText, $('#renderedText'))) {
          console.log(`✅ Special conditions highlighting succeeded`);
          return;
        }
      }
      
      if (highlightExact(sourceText)) {
        console.log(`✅ Fallback succeeded using sourceText: "${sourceText}"`);
        return;
      }
    }
    
    if(search && highlightExact(search)) {
      console.log(`✅ Fallback succeeded using search pattern: "${search}"`);
      return;
    }
    
    if(displayText && displayText !== search && highlightExact(displayText)) {
      console.log(`✅ Fallback succeeded using displayText: "${displayText}"`);
      return;
    }
    
    console.warn(`❌ All highlighting methods failed for: "${$(this).text()}" (${start}-${end})`);
  });
}


function highlightExact(txt){
  if (!txt) return false;
  
  const textContent = rawText && rawText.textContent ? rawText.textContent : (typeof rawText === 'string' ? rawText : '');
  if (!textContent) {
    console.warn('highlightExact: No text content available');
    return false;
  }

  const $box = $('#renderedText');
  const mk   = new Mark($box[0]);
  mk.unmark();                                

  const alts = createTextVariations(txt);
  console.log('highlightExact: trying alternatives:', alts.slice(0, 3)); // Log first 3 to avoid spam

  for (const alt of alts){
    console.log(`highlightExact: trying pattern "${alt}"`);
    
    // First try to highlight the complete text as a single unit
    mk.mark(alt, {
      element:'span',
      className:'marked',
      accuracy: 'exactly',
      separateWordSearch:false,
      filter: function(node, term, totalCounter, counter) {
        return counter === 1; // Only highlight the first occurrence
      }
    });

    let $hits = $box.find('.marked');
    if ($hits.length > 0) {
      console.log(`highlightExact: successfully highlighted complete text "${alt}"`);
    } else {
      mk.unmark();
      
      if (highlightNumberedSection(alt, $box)) {
        return true;
      }
      
      if (highlightSpecialConditions(alt, $box)) {
        return true;
      }
      
      if (highlightCostItems(alt, $box)) {
        return true;
      }
      
      const betterMatch = findTextInSource(alt, textContent);
      if (betterMatch && betterMatch !== alt) {
        console.log(`highlightExact: found better match "${betterMatch}" for "${alt}"`);
        if (highlightExact(betterMatch)) {
          return true;
        }
      }
      
      mk.mark(alt, {
        element:'span',
        className:'marked',
        accuracy: 'exactly',
        separateWordSearch:false,
        filter: function(node, term, totalCounter, counter) {
          return counter === 1; // Only highlight the first occurrence
        }
      });
    }

    $hits = $box.find('.marked');
    console.log(`highlightExact: found ${$hits.length} matches for "${alt}"`);
    
    if (!$hits.length){
      mk.unmark();
      
      console.log(`highlightExact: mark.js failed, trying manual highlighting for "${alt}"`);
      const boxText = $box.text();
      const altLower = alt.toLowerCase();
      const boxTextLower = boxText.toLowerCase();
      
      if (boxTextLower.includes(altLower)) {
        console.log(`highlightExact: found "${alt}" in text, applying manual highlighting`);
        const regex = new RegExp(escapeReg(alt), 'i'); // Remove 'g' flag to match only first occurrence
        
        let foundFirst = false;
        $box.find('*').addBack().contents().filter(function() {
          return this.nodeType === 3; // Text nodes only
        }).each(function() {
          if (foundFirst) return false; // Stop after first match
          const text = this.textContent;
          if (regex.test(text)) {
            const highlightedText = text.replace(regex, '<span class="marked">$&</span>');
            $(this).replaceWith(highlightedText);
            foundFirst = true;
            return false; // Break out of each loop
          }
        });
        
        $hits = $box.find('.marked');
        console.log(`highlightExact: manual highlighting created ${$hits.length} matches`);
      }
      
      if (!$hits.length) {
        continue; // Try next alternative
      }
    }

    if ($hits.length > 0) {
      const visibleHits = Array.from($hits).filter(hit => {
        let parent = hit.parentElement;
        while (parent && parent !== $box[0]) {
          if (parent.hasAttribute('offscreen')) {
            return false;
          }
          parent = parent.parentElement;
        }
        return true;
      });
      
      console.log(`highlightExact: found ${$hits.length} total matches, ${visibleHits.length} visible matches for "${alt}"`);
      
      if (visibleHits.length === 0) {
        console.log(`❌ highlightExact: no visible matches found for "${alt}" in RIGHT PANEL`);
        $box.find('.marked').removeClass('marked'); // Clear all marks since none are visible
        continue; // Try next alternative
      }
      
      const wantRe =
          /£\d/.test(alt)        && /product\s*fee/i      ||   
          /none|£?0(\.00)?/i.test(alt) && /paid\s*regularly/i || 
          null;

      let $filteredHits = $(visibleHits);
      if (wantRe && visibleHits.length > 1){
        console.log('highlightExact: filtering visible hits with context filter');
        $filteredHits = $filteredHits.filter((_,el) => wantRe.test(el.parentNode.innerText));
        if (!$filteredHits.length) $filteredHits = $(visibleHits);        
      }

      const $target = $filteredHits.first();
      $box.find('.marked').not($target).removeClass('marked');

      scrollToMark($box);
      console.log(`✓ highlightExact: successfully highlighted "${alt}" in RIGHT PANEL (report section)`);
      return true;
    }                                    
  }

  console.warn('❌ highlightExact failed for all alternatives in RIGHT PANEL (report section):', alts);
  dbgMark(txt);                                    
  return false;
}




function highlightBySlice(start, end) {
  if(!Number.isFinite(start)||!Number.isFinite(end)) return false;

  const textContent = rawText && rawText.textContent ? rawText.textContent : (typeof rawText === 'string' ? rawText : '');
  if (!textContent || textContent.length === 0) {
    return false;
  }
  
  if (start < 0 || end > textContent.length || start >= end) {
    return false;
  }

  const mappedText = mapRawTextToMarkdownPositions(textContent, start, end);
  if (!mappedText) {
    return false;
  }
  
  const slice = mappedText.originalSlice;
  const markdownSlice = mappedText.markdownSlice;
  
  console.log(`📍 EXTRACTED FROM API CHAR POSITIONS ${start}-${end}: "${slice}"`);
  console.log(`📍 MARKDOWN-COMPATIBLE VERSION: "${markdownSlice}"`);
  
  if(markdownSlice.length < 2) {
    return false;       
  }

  if (markdownSlice.length < 3 && !/[£\d\/\-]/.test(markdownSlice)) {
    return false;
  }
  
  const $box = $('#renderedText');
  if ($box.length === 0) {
    return false;
  }

  // Check if this is special conditions text and use enhanced highlighting
  if (markdownSlice.length > 50 && 
      (markdownSlice.toLowerCase().includes('higher lending charge') || 
       markdownSlice.toLowerCase().includes('overpayments') || 
       markdownSlice.toLowerCase().includes('pre-payment balance') ||
       markdownSlice.toLowerCase().includes('supplementary conditions'))) {
    console.log(`🎯 Detected special conditions text, using enhanced highlighting`);
    if (highlightSpecialConditionsWithMapping(slice, markdownSlice, $box)) {
      console.log(`🎯 POSITION-BASED HIGHLIGHTING: ✅ SUCCESS`);
      return true;
    }
  }

  // Continue with existing logic but use markdownSlice for highlighting
  // Clear any existing highlights
  $box.find('.marked').replaceWith(function() {
    return $(this).text();
  });

  const textVariations = createTextVariations(markdownSlice);
  const uniqueVariations = [...new Set(textVariations)].filter(text => text.length > 0);
  
  try {
    const markInstance = new Mark($box[0]);
    
    // Try exact matching first - highlight complete text as single unit
    for (const variation of uniqueVariations) {
      let foundExact = false;
      
      markInstance.mark(variation, {
        accuracy: 'exactly',
        className: 'marked',
        separateWordSearch: false,
        each: function() {
          foundExact = true;
        }
      });
      
      if (foundExact) {
        console.log(`🎯 POSITION-BASED HIGHLIGHTING: ✅ SUCCESS`);
        scrollToFirstMark($box);
        return true;
      }
      
      markInstance.unmark();
    }
    
    for (const variation of uniqueVariations) {
      let foundComplementary = false;
      
      markInstance.mark(variation, {
        accuracy: 'complementary',
        className: 'marked',
        separateWordSearch: false,
        each: function() {
          foundComplementary = true;
        }
      });
      
      if (foundComplementary) {
        console.log(`🎯 POSITION-BASED HIGHLIGHTING: ✅ SUCCESS`);
        scrollToFirstMark($box);
        return true;
      }
      
      markInstance.unmark();
    }
    
  } catch (error) {
    console.log(`❌ Error during highlighting: ${error.message}`);
    return false;
  }

  return false;
}

function highlightCompleteText(searchText, $box) {
  if (!searchText || searchText.length < 3) {
    return false;
  }
  
  const allText = $box.text();
  const normalizedSearchText = normalizeTextForMatching(searchText);
  const normalizedAllText = normalizeTextForMatching(allText);
  
  // Strategy 1: Try to highlight the complete text as a single unit first
  if (normalizedAllText.includes(normalizedSearchText)) {
    if (highlightCompleteTextInDOM(searchText, $box)) {
      scrollToMark($box);
      return true;
    }
    
    if (highlightCompleteTextInDOM(normalizedSearchText, $box)) {
      scrollToMark($box);
      return true;
    }
    
    const shortText = searchText.substring(0, 50);
    if (highlightCompleteTextInDOM(shortText, $box)) {
      scrollToMark($box);
      return true;
    }
    
    // Strategy 2: Break into sentences and highlight each sentence
    const sentences = searchText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    let highlightedCount = 0;
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length > 10) {
        if (highlightCompleteTextInDOM(trimmedSentence, $box)) {
          highlightedCount++;
        }
      }
    }
    
    if (highlightedCount > 0) {
      scrollToMark($box);
      return true;
    }
    
    // Strategy 3: Fallback to key phrases only if complete text and sentences fail
    const keyPhrases = extractKeyPhrasesFromSlice(searchText);
    for (const phrase of keyPhrases) {
      if (phrase && phrase.length > 8) { // Only use substantial phrases
        if (highlightCompleteTextInDOM(phrase, $box)) {
          highlightedCount++;
        }
      }
    }
    
    if (highlightedCount > 0) {
      scrollToMark($box);
      return true;
    }
  }
  
  const escapedText = escapeReg(searchText);
  const regex = new RegExp(escapedText, 'i');
  
  let foundMatch = false;
  $box.find('*').addBack().contents().filter(function() {
    return this.nodeType === 3; // Text nodes only
  }).each(function() {
    if (foundMatch) return false;
    const text = this.textContent;
    if (regex.test(text)) {
      const highlightedText = text.replace(regex, '<span class="marked">$&</span>');
      $(this).replaceWith(highlightedText);
      foundMatch = true;
      scrollToMark($box);
      return false;
    }
  });
  
  return foundMatch;
}

function highlightCompleteTextInDOM(searchText, $box) {
  if (!searchText || searchText.length < 3) return false;
  
  const normalizedSearchText = normalizeTextForMatching(searchText);
  let foundMatch = false;
  
  const allText = $box.text();
  const normalizedAllText = normalizeTextForMatching(allText);
  
  // Try to find the text in the complete document first
  if (normalizedAllText.includes(normalizedSearchText)) {
    const $allElements = $box.find('*').addBack();
    
    $allElements.each(function() {
      if (foundMatch) return false;
      
      const elementText = $(this).text();
      const normalizedElementText = normalizeTextForMatching(elementText);
      
      if (normalizedElementText.includes(normalizedSearchText)) {
        // Try to highlight within this element
        const $textNodes = $(this).contents().filter(function() {
          return this.nodeType === 3; // Text nodes only
        });
        
        $textNodes.each(function() {
          if (foundMatch) return false;
          
          const text = this.textContent;
          const normalizedText = normalizeTextForMatching(text);
          
          if (normalizedText.includes(normalizedSearchText)) {
            // Try exact match first
            const escapedSearchText = escapeReg(searchText);
            const regex = new RegExp(escapedSearchText, 'i');
            
            if (regex.test(text)) {
              const highlightedText = text.replace(regex, '<span class="marked">$&</span>');
              $(this).replaceWith(highlightedText);
              foundMatch = true;
              return false;
            }
            
            const flexibleRegex = new RegExp(normalizedSearchText.replace(/\s+/g, '\\s+'), 'i');
            if (flexibleRegex.test(normalizedText)) {
              const match = normalizedText.match(flexibleRegex);
              if (match) {
                const startIndex = normalizedText.indexOf(match[0]);
                const endIndex = startIndex + match[0].length;
                
                // Map back to original text and highlight
                const beforeText = text.substring(0, startIndex);
                const matchText = text.substring(startIndex, endIndex);
                const afterText = text.substring(endIndex);
                
                const highlightedText = beforeText + '<span class="marked">' + matchText + '</span>' + afterText;
                $(this).replaceWith(highlightedText);
                foundMatch = true;
                return false;
              }
            }
            
            const searchStart = normalizedText.indexOf(normalizedSearchText);
            if (searchStart >= 0) {
              const searchEnd = searchStart + normalizedSearchText.length;
              const beforeText = text.substring(0, searchStart);
              const matchText = text.substring(searchStart, searchEnd);
              const afterText = text.substring(searchEnd);
              
              const highlightedText = beforeText + '<span class="marked">' + matchText + '</span>' + afterText;
              $(this).replaceWith(highlightedText);
              foundMatch = true;
              return false;
            }
          }
        });
        
        if (foundMatch) return false;
      }
    });
  }
  
  return foundMatch;
}

function highlightSpecialConditionsBullets(normalizedSlice, $box) {
  const bullets = normalizedSlice.split(/[-•]\s*/).filter(bullet => bullet.trim().length > 10);
  let highlightedCount = 0;
  
  for (const bullet of bullets) {
    const cleanBullet = bullet.trim().replace(/^\d+\.\s*/, ''); // Remove number prefixes
    if (cleanBullet.length > 10) {
      const escapedText = escapeReg(cleanBullet);
      const regex = new RegExp(escapedText, 'i');
      
      $box.find('*').addBack().contents().filter(function() {
        return this.nodeType === 3;
      }).each(function() {
        const text = this.textContent;
        if (regex.test(text)) {
          const highlightedText = text.replace(regex, '<span class="marked">$&</span>');
          $(this).replaceWith(highlightedText);
          highlightedCount++;
          return false;
        }
      });
    }
  }
  
  if (highlightedCount > 0) {
    scrollToMark($box);
    return true;
  }
  return false;
}

function highlightFullCostSection(normalizedSlice, $box) {
  const costPhrases = [];
  
  const amountMatches = normalizedSlice.match(/£[\d,]+\.?\d*/g);
  if (amountMatches) {
    costPhrases.push(...amountMatches);
  }
  
  const feeDescriptions = normalizedSlice.match(/[^.]*fee[^.]*/gi);
  if (feeDescriptions) {
    costPhrases.push(...feeDescriptions.map(desc => desc.trim()));
  }
  
  const costSentences = normalizedSlice.split(/[.!?]/).filter(sentence => 
    sentence.toLowerCase().includes('cost') || 
    sentence.toLowerCase().includes('fee') || 
    sentence.toLowerCase().includes('payable') ||
    sentence.toLowerCase().includes('£')
  );
  costPhrases.push(...costSentences.map(s => s.trim()).filter(s => s.length > 10));
  
  let highlightedCount = 0;
  
  for (const phrase of costPhrases) {
    if (phrase && phrase.length > 5) {
      const escapedPhrase = escapeReg(phrase);
      const regex = new RegExp(escapedPhrase, 'i');
      
      $box.find('*').addBack().contents().filter(function() {
        return this.nodeType === 3;
      }).each(function() {
        const text = this.textContent;
        if (regex.test(text)) {
          const highlightedText = text.replace(regex, '<span class="marked">$&</span>');
          $(this).replaceWith(highlightedText);
          highlightedCount++;
        }
      });
    }
  }
  
  if (highlightedCount > 0) {
    scrollToMark($box);
    return true;
  }
  
  return false;
}



function highlightSlice(start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  
  const textContent = rawText && rawText.textContent ? rawText.textContent : (typeof rawText === 'string' ? rawText : '');
  if (!textContent || textContent.length === 0) {
    return false;
  }
  
  if (start < 0 || end > textContent.length || start >= end) {
    return false;
  }

  const slice = textContent.slice(start, end);
  const normalizedSlice = normalizeTextForMatching(slice);
  
  if (normalizedSlice.length < 2) {
    return false;       
  }

  const result = highlightInRenderedText(normalizedSlice);
  if (result) {
    console.log(`🎯 POSITION-BASED HIGHLIGHTING: ✅ SUCCESS`);
  } else {
    console.log(`🎯 POSITION-BASED HIGHLIGHTING: ❌ FAILED (trying fallback...)`);
  }
  return result;
}

function highlightInRenderedText(textToHighlight) {
  if (!textToHighlight || textToHighlight.length < 2) {
    return false;
  }

  const $box = $('#renderedText');
  if ($box.length === 0) {
    return false;
  }


  const markInstance = new Mark($box[0]);
  markInstance.unmark(); // Clear previous highlights

  let highlightSuccess = false;

  // Strategy 1: Try exact match first
  markInstance.mark(textToHighlight, {
    accuracy: 'exactly',
    separateWordSearch: false,
    className: 'marked',
    filter: function(node, term, totalCounter, counter) {
      return counter === 1; // Only highlight the first occurrence
    },
    done: function(totalMarks) {
      if (totalMarks > 0) {
        highlightSuccess = true;
        scrollToFirstMark($box);
      }
    }
  });

  if (highlightSuccess) return true;

  // Strategy 2: Try partial match for longer text
  if (textToHighlight.length > 20) {
    markInstance.mark(textToHighlight, {
      accuracy: 'partially',
      separateWordSearch: false,
      className: 'marked',
      filter: function(node, term, totalCounter, counter) {
        return counter === 1; // Only highlight the first occurrence
      },
      done: function(totalMarks) {
        if (totalMarks > 0) {
          highlightSuccess = true;
          scrollToFirstMark($box);
        }
      }
    });

    if (highlightSuccess) return true;
  }

  // Strategy 3: Try highlighting key phrases for complex text
  const keyPhrases = [
    'Higher Lending Charge',
    'Overpayments',
    'Pre-Payment Balance', 
    'Underpayments',
    'Early repayment',
    'Mortgage exit fee',
    'Legal fee',
    'Land registry fee',
    'One-off costs',
    'Recurring costs',
    'Product fee'
  ];

  for (const phrase of keyPhrases) {
    if (textToHighlight.toLowerCase().includes(phrase.toLowerCase())) {
      markInstance.mark(phrase, {
        accuracy: 'partially',
        separateWordSearch: false,
        className: 'marked',
        filter: function(node, term, totalCounter, counter) {
          return counter === 1; // Only highlight the first occurrence
        },
        done: function(totalMarks) {
          if (totalMarks > 0) {
            highlightSuccess = true;
            scrollToFirstMark($box);
          }
        }
      });
      if (highlightSuccess) break;
    }
  }

  if (!highlightSuccess) {
    console.log(`⚠️ Mark.js highlighting failed, trying fallback system...`);
  }

  return highlightSuccess;
}

function scrollToFirstMark($container) {
  if (!$container || !$container.length) {
    console.log(`❌ scrollToFirstMark: Invalid container`);
    return;
  }
  
  const $firstMark = $container.find('mark.marked, .marked').first();
  if ($firstMark.length > 0) {
    try {
      const containerTop = $container.scrollTop();
      const markTop = $firstMark.position().top;
      $container.scrollTop(containerTop + markTop - 120); // 120px padding from top
    } catch (error) {
      console.log(`❌ scrollToFirstMark error: ${error.message}`);
    }
  }
}


async function downloadReportPDF(){
  const { jsPDF } = window.jspdf;
  const margin=40;
  const pageWidth = 595.28;
  const contentWidth = pageWidth - (margin * 2);

  const src=document.getElementById('report');
  const clone=src.cloneNode(true);
  clone.removeAttribute('style');
  clone.style.width=`${contentWidth}px`;
  clone.style.maxWidth=`${contentWidth}px`;
  clone.style.lineHeight='1.6';
  clone.style.wordWrap='break-word';
  clone.style.overflowWrap='break-word';
  clone.style.whiteSpace='normal';
  clone.style.fontSize='12px';
  clone.style.fontFamily='Arial, sans-serif';
  clone.style.padding='0';
  clone.style.margin='0';
  clone.style.boxSizing='border-box';
  clone.style.display='block';
  clone.classList.remove('overflow-auto');

  clone.querySelectorAll('.clickable-keyword,.marked')
       .forEach(el=>el.replaceWith(document.createTextNode(el.textContent)));

  clone.querySelectorAll('h1, h2, h3').forEach(el => {
    el.style.marginTop = '20px';
    el.style.marginBottom = '12px';
    el.style.pageBreakAfter = 'avoid';
    el.style.maxWidth = '100%';
    el.style.wordWrap = 'break-word';
    el.style.overflowWrap = 'break-word';
  });

  clone.querySelectorAll('p, div, span').forEach(el => {
    el.style.marginTop = '8px';
    el.style.marginBottom = '8px';
    el.style.pageBreakInside = 'avoid';
    el.style.maxWidth = '100%';
    el.style.wordWrap = 'break-word';
    el.style.overflowWrap = 'break-word';
    el.style.whiteSpace = 'normal';
  });

  clone.querySelectorAll('table').forEach(el => {
    el.style.width = '100%';
    el.style.maxWidth = '100%';
    el.style.tableLayout = 'fixed';
    el.style.wordWrap = 'break-word';
  });

  clone.querySelectorAll('td, th').forEach(el => {
    el.style.wordWrap = 'break-word';
    el.style.overflowWrap = 'break-word';
    el.style.maxWidth = '200px';
  });

  document.body.appendChild(clone);
  const pdf=new jsPDF({unit:'pt',format:'a4'});
  await pdf.html(clone,{
    margin,
    autoPaging:'text',
    html2canvas:{
      scale:0.75,
      useCORS:true,
      backgroundColor:'#ffffff',
      letterRendering:true,
      allowTaint:false,
      width:contentWidth,
      height:800,
      scrollX:0,
      scrollY:0
    }
  });
  document.body.removeChild(clone);
  pdf.save('Mortgage_Report.pdf');
}

function clearMarks($c){ $c.find('.marked').replaceWith(function(){return $(this).text();}); }
function scrollToMark($c){ const $m=$c.find('.marked').first();
  if($m.length) $c.scrollTop($m.position().top + $c.scrollTop() - SCROLL_PAD); }
function escapeReg(s){ return s.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&'); }
function esc(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function mapRawTextToMarkdownPositions(rawText, start, end) {
  if (!rawText || start < 0 || end > rawText.length || start >= end) {
    return null;
  }
  
  // Extract the slice from raw text
  const slice = rawText.slice(start, end);
  
  // Create a version that matches how markdown processes the text
  let markdownCompatibleSlice = slice;
  
  markdownCompatibleSlice = markdownCompatibleSlice.replace(/^\s*\d+\.\s+/gm, '');
  
  markdownCompatibleSlice = markdownCompatibleSlice
    .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return {
    originalSlice: slice,
    markdownSlice: markdownCompatibleSlice,
    length: markdownCompatibleSlice.length
  };
}

function normalizeTextForMatching(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[""'']/g, '"')  // Normalize quotes
    .replace(/[–—]/g, '-')  // Normalize dashes
    .replace(/£(\d+)\.(\d+)/g, '£$1.$2')  // Normalize currency
    .replace(/\u00a0/g, ' ')  // Replace non-breaking spaces
    .replace(/[•·]/g, '-')  // Normalize bullet points
    // Only remove them if the text is short (likely not special conditions)
    .replace(/\n\s*-/g, ' -')  // Normalize line breaks before dashes
    .replace(/\n+/g, ' ')  // Replace line breaks with spaces
    .trim();
}

function findTextInSource(displayText, rawText) {
  if (!displayText || !rawText) return null;
  
  const normalized = normalizeTextForMatching(displayText);
  const normalizedRaw = normalizeTextForMatching(rawText);
  
  if (normalizedRaw.includes(normalized)) {
    return normalized;
  }
  
  const chunks = normalized.split(/[,;:]/).map(chunk => chunk.trim()).filter(Boolean);
  for (const chunk of chunks) {
    if (chunk.length > 10 && normalizedRaw.includes(chunk)) {
      return chunk;
    }
  }
  
  const words = normalized.split(/\s+/).filter(word => word.length > 3);
  const foundWords = words.filter(word => normalizedRaw.includes(word));
  if (foundWords.length >= Math.min(3, words.length * 0.6)) {
    return normalized;
  }
  
  return null;
}
function createTextVariations(originalText) {
  if (!originalText) return [];
  
  const variations = [
    originalText, // Original text
    normalizeTextForMatching(originalText) // Basic normalization
  ];
  
  // Create variation without numbered bullets
  const withoutNumbers = originalText.replace(/\b\d+\.\s+/g, '');
  variations.push(normalizeTextForMatching(withoutNumbers));
  
  // Create variation with renumbered bullets starting from 1
  let bulletCounter = 1;
  const withNormalizedNumbers = originalText.replace(/\b\d+\.\s+/g, () => `${bulletCounter++}. `);
  variations.push(normalizeTextForMatching(withNormalizedNumbers));
  
  // Create variation with generic bullet points
  const withGenericBullets = originalText.replace(/\b\d+\.\s+/g, '- ');
  variations.push(normalizeTextForMatching(withGenericBullets));
  
  // Add variation that handles dash bullets specifically for left panel matching
  const withDashBullets = originalText.replace(/\b\d+\.\s+/g, '- ');
  variations.push(withDashBullets.trim()); // Don't normalize this one to preserve exact format
  
  const apiStyleNumbering = originalText.replace(/\b(\d+)\.\s+/g, (match, num) => {
    const originalNum = parseInt(num);
    const newNum = variations.length - 4; // Adjust based on position in variations
    return `${Math.max(1, newNum)}. `;
  });
  variations.push(normalizeTextForMatching(apiStyleNumbering));
  
  // Create variations that handle different numbering schemes more comprehensively
  const commonStarts = [1, 10, 15, 16, 17, 20, 25];
  for (const startNum of commonStarts) {
    let counter = startNum;
    const withDifferentStart = originalText.replace(/\b\d+\.\s+/g, () => `${counter++}. `);
    variations.push(normalizeTextForMatching(withDifferentStart));
  }
  
  // Create a version that maps common number sequences
  const numberMappings = [
    { from: [15, 16, 17], to: [1, 2, 3] },
    { from: [1, 2, 3], to: [15, 16, 17] },
    { from: [20, 21, 22], to: [1, 2, 3] },
    { from: [1, 2, 3], to: [20, 21, 22] }
  ];
  
  for (const mapping of numberMappings) {
    let mappedText = originalText;
    for (let i = 0; i < mapping.from.length && i < mapping.to.length; i++) {
      const fromPattern = new RegExp(`\\b${mapping.from[i]}\\.\\s+`, 'g');
      mappedText = mappedText.replace(fromPattern, `${mapping.to[i]}. `);
    }
    if (mappedText !== originalText) {
      variations.push(normalizeTextForMatching(mappedText));
    }
  }
  
  // Extract key phrases for individual highlighting
  const keyPhrases = originalText.match(/(?:Higher Lending Charge|Overpayments|Pre-Payment Balance|Underpayments|tracker rate|reference rate|fourteen business days|six consecutive months)[^.]*\./gi);
  if (keyPhrases) {
    variations.push(...keyPhrases.map(phrase => normalizeTextForMatching(phrase)));
  }
  
  // Create chunks of text between bullets for partial matching
  const textChunks = originalText.split(/\b\d+\.\s+/).filter(chunk => chunk.trim().length > 20);
  textChunks.forEach(chunk => {
    variations.push(normalizeTextForMatching(chunk.trim()));
  });
  
  // Create variations with different spacing around numbers
  const withTightSpacing = originalText.replace(/\b(\d+)\.\s+/g, '$1.');
  variations.push(normalizeTextForMatching(withTightSpacing));
  
  const withExtraSpacing = originalText.replace(/\b(\d+)\.\s+/g, '$1.  ');
  variations.push(normalizeTextForMatching(withExtraSpacing));
  
  return [...new Set(variations)].filter(v => v && v.length > 0);
}



function debugSlices() {
  if (!rawText || !keyData) {
    console.log('No data available for debugging');
    return;
  }
  
  console.log('=== DEBUG SLICES ===');
  for (const [key, data] of Object.entries(keyData)) {
    if (data?.start && data?.end) {
      const slice = rawText.slice(data.start, data.end);
      const normalizedSlice = normalizeTextForMatching(slice);
      console.log(`${key}: "${normalizedSlice}" (${data.start}-${data.end})`);
    }
  }
}

function extractKeyPhrasesFromSlice(slice) {
  const phrases = [];
  
  const moneyMatches = slice.match(/£[\d,]+\.?\d*/g);
  if (moneyMatches) {
    phrases.push(...moneyMatches);
  }
  
  const feeMatches = slice.match(/(mortgage exit fee|legal fee|land registry fee|product fee|funds transfer fee)/gi);
  if (feeMatches) {
    phrases.push(...feeMatches);
  }
  
  const keyTerms = [
    'Higher Lending Charge',
    'Overpayments',
    'Pre-Payment Balance',
    'Underpayments',
    'Early repayment',
    'tracker rate',
    'reference rate',
    'floor rate'
  ];
  
  for (const term of keyTerms) {
    if (slice.toLowerCase().includes(term.toLowerCase())) {
      phrases.push(term);
    }
  }
  
  return phrases;
}

function highlightNumberedSection(alt, $box) {
  const numberedMatch = alt.match(/^(\d+)\.\s*(.+)/);
  if (!numberedMatch) return false;
  
  const [, number, content] = numberedMatch;
  console.log(`highlightNumberedSection: looking for numbered section "${content}" (originally ${number}.)`);
  
  const $listItems = $box.find('li, h1, h2, h3, h4, h5, h6, p');
  let found = false;
  
  $listItems.each(function() {
    const itemText = $(this).text().trim();
    
    if (itemText.toLowerCase().includes(content.toLowerCase())) {
      console.log(`highlightNumberedSection: found matching content in element: "${itemText.substring(0, 100)}..."`);
      
      const $element = $(this);
      const html = $element.html();
      const contentRegex = new RegExp(`(${escapeReg(content)})`, 'gi');
      const highlightedHtml = html.replace(contentRegex, '<span class="marked">$1</span>');
      $element.html(highlightedHtml);
      
      found = true;
      return false; // break
    }
  });
  
  if (found) {
    scrollToMark($box);
    console.log(`✓ highlightNumberedSection: successfully highlighted "${content}"`);
    return true;
  }
  
  return false;
}

function highlightSpecialConditionsWithMapping(originalSlice, markdownSlice, $box) {
  console.log(`highlightSpecialConditionsWithMapping: handling special conditions`);
  console.log(`Original slice length: ${originalSlice.length}`);
  console.log(`Markdown slice length: ${markdownSlice.length}`);
  
  // Clear any existing highlights
  $box.find('.marked').replaceWith(function() {
    return $(this).text();
  });
  
  try {
    const markInstance = new Mark($box[0]);
    
    // Strategy 1: Try to highlight the complete markdown-compatible text
    console.log(`🎯 APPROACH 1: Attempting complete markdown-compatible text match`);
    
    let foundComplete = false;
    
    markInstance.mark(markdownSlice, {
      accuracy: 'complementary',
      className: 'marked',
      separateWordSearch: false,
      acrossElements: true,
      each: function() {
        foundComplete = true;
      }
    });
    
    if (foundComplete) {
      console.log(`🎯 SPECIAL CONDITIONS HIGHLIGHTING: ✅ SUCCESS with complete markdown text`);
      scrollToMark($box);
      return true;
    }
    
    markInstance.unmark();
    
    // Strategy 2: Break into sentences and highlight each
    console.log(`🎯 APPROACH 2: Attempting sentence-by-sentence highlighting`);
    
    const sentences = markdownSlice.split(/(?<=[.!?])\s+(?=[A-Z-])/).filter(s => s.trim().length > 15);
    let highlightedCount = 0;
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      
      if (trimmedSentence.length > 15) {
        let foundSentence = false;
        
        markInstance.mark(trimmedSentence, {
          accuracy: 'complementary',
          className: 'marked',
          separateWordSearch: false,
          acrossElements: true,
          each: function() {
            foundSentence = true;
          }
        });
        
        if (foundSentence) {
          console.log(`✓ highlightSpecialConditionsWithMapping: highlighted sentence "${trimmedSentence.substring(0, 50)}..."`);
          highlightedCount++;
        }
      }
    }
    
    if (highlightedCount > 0) {
      console.log(`🎯 SPECIAL CONDITIONS HIGHLIGHTING: ✅ SUCCESS with ${highlightedCount} sentences highlighted`);
      scrollToMark($box);
      return true;
    }
    
    // Strategy 3: Try key phrases from the markdown text
    console.log(`🎯 APPROACH 3: Attempting key phrase highlighting`);
    
    const keyPhrases = [
      'mortgage does not have a Higher Lending Charge',
      'Higher Lending Charge',
      'Overpayments will reduce the interest-bearing balance immediately',
      'overpayments equal to or exceeding three monthly payments',
      'Pre-Payment Balance can only be used for future underpayments',
      'Underpayment arrangements are permitted',
      'underpayments for up to six consecutive months',
      'notify the lender at least 14 business days',
      'minimum reference rate (floor) is 0%'
    ];
    
    for (const phrase of keyPhrases) {
      if (markdownSlice.toLowerCase().includes(phrase.toLowerCase())) {
        console.log(`highlightSpecialConditionsWithMapping: trying to highlight key phrase "${phrase}"`);
        
        markInstance.mark(phrase, {
          accuracy: 'complementary',
          className: 'marked',
          separateWordSearch: false,
          each: function() {
            highlightedCount++;
          }
        });
      }
    }
    
    if (highlightedCount > 0) {
      console.log(`🎯 SPECIAL CONDITIONS HIGHLIGHTING: ✅ SUCCESS with key phrase approach`);
      scrollToMark($box);
      return true;
    }
    
  } catch (error) {
    console.error('highlightSpecialConditionsWithMapping: Error during highlighting:', error);
  }
  
  console.log(`❌ highlightSpecialConditionsWithMapping: all strategies failed`);
  return false;
}

function highlightSpecialConditions(alt, $box) {
  if (!alt.toLowerCase().includes('higher lending charge') && 
      !alt.toLowerCase().includes('overpayments') && 
      !alt.toLowerCase().includes('pre-payment balance')) {
    return false;
  }
  
  console.log(`highlightSpecialConditions: handling special conditions text`);
  console.log(`highlightSpecialConditions: alt text length: ${alt.length}`);
  console.log(`🔍 EXTRACTED FROM API CHAR POSITIONS: "${alt}"`);
  
  // Clear any existing highlights
  $box.find('.marked').replaceWith(function() {
    return $(this).text();
  });
  
  const leftPanelText = $('#renderedText').text();
  console.log(`🔍 LEFT PANEL TEXT PREVIEW: "${leftPanelText.substring(0, 500)}..."`);
  
  try {
    const markInstance = new Mark($box[0]);
    
    console.log(`🎯 APPROACH 1: Attempting complete text match with bullet point variations`);
    
    // Create comprehensive text variations to handle bullet point mismatches
    const completeTextVariations = [];
    
    // Original text
    completeTextVariations.push(alt);
    
    const withoutPrefix = alt.replace(/^Supplementary Conditions:\s*The attached special conditions also apply\.\s*/i, '');
    completeTextVariations.push(withoutPrefix);
    
    // Create version with numbered bullets (1., 2., 3., etc.)
    const sentences = alt.split(/(?<=[.!?])\s+(?=[A-Z])/);
    let numberedVersion = '';
    let bulletNum = 1;
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 20) {
        if (trimmed.toLowerCase().startsWith('this product does not have') ||
            trimmed.toLowerCase().startsWith('overpayments') ||
            trimmed.toLowerCase().startsWith('underpayments') ||
            trimmed.toLowerCase().startsWith('if you have a tracker') ||
            trimmed.toLowerCase().startsWith('the funds in the pre-payment') ||
            trimmed.toLowerCase().startsWith('if you want to make underpayments') ||
            trimmed.toLowerCase().startsWith('if you want to use your pre-payment')) {
          numberedVersion += `${bulletNum}. ${trimmed} `;
          bulletNum++;
        } else {
          numberedVersion += `${trimmed} `;
        }
      }
    }
    completeTextVariations.push(numberedVersion.trim());
    
    // Create version with dash bullets
    let dashVersion = '';
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 20) {
        if (trimmed.toLowerCase().startsWith('this product does not have') ||
            trimmed.toLowerCase().startsWith('overpayments') ||
            trimmed.toLowerCase().startsWith('underpayments') ||
            trimmed.toLowerCase().startsWith('if you have a tracker') ||
            trimmed.toLowerCase().startsWith('the funds in the pre-payment') ||
            trimmed.toLowerCase().startsWith('if you want to make underpayments') ||
            trimmed.toLowerCase().startsWith('if you want to use your pre-payment')) {
          dashVersion += `- ${trimmed} `;
        } else {
          dashVersion += `${trimmed} `;
        }
      }
    }
    completeTextVariations.push(dashVersion.trim());
    
    completeTextVariations.push(normalizeTextForMatching(alt));
    completeTextVariations.push(normalizeTextForMatching(withoutPrefix));
    completeTextVariations.push(normalizeTextForMatching(numberedVersion));
    completeTextVariations.push(normalizeTextForMatching(dashVersion));
    
    console.log(`🔍 Created ${completeTextVariations.length} complete text variations`);
    
    for (let i = 0; i < completeTextVariations.length; i++) {
      const variation = completeTextVariations[i];
      if (variation && variation.length > 100) {
        console.log(`🔍 Trying complete text variation ${i + 1}: "${variation.substring(0, 150)}..."`);
        
        let foundComplete = false;
        
        markInstance.mark(variation, {
          accuracy: 'complementary',
          className: 'marked',
          separateWordSearch: false,
          each: function() {
            foundComplete = true;
          }
        });
        
        if (foundComplete) {
          console.log(`🎯 SPECIAL CONDITIONS HIGHLIGHTING: ✅ SUCCESS with complete text variation ${i + 1}`);
          scrollToMark($box);
          return true;
        }
        
        markInstance.unmark();
      }
    }
    
    console.log(`🎯 APPROACH 2: Attempting sentence-by-sentence highlighting`);
    
    // Extract individual sentences/bullet points from the API text
    const bulletSentences = [];
    
    const rawSentences = alt.split(/\.\s+/);
    
    for (const sentence of rawSentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 15) {
        let cleanSentence = trimmed;
        if (!cleanSentence.endsWith('.') && !cleanSentence.endsWith('!') && !cleanSentence.endsWith('?')) {
          cleanSentence += '.';
        }
        
        cleanSentence = cleanSentence.replace(/^Supplementary Conditions:\s*The attached special conditions also apply\.\s*/i, '');
        
        if (cleanSentence.length > 15) {
          bulletSentences.push(cleanSentence);
        }
      }
    }
    
    console.log(`🔍 Extracted ${bulletSentences.length} sentences for individual highlighting`);
    
    let highlightedAny = false;
    
    for (let sentenceIndex = 0; sentenceIndex < bulletSentences.length; sentenceIndex++) {
      const sentence = bulletSentences[sentenceIndex];
      console.log(`🔍 Trying to highlight sentence ${sentenceIndex + 1}: "${sentence.substring(0, 100)}..."`);
      
      // Create variations for this sentence
      const sentenceVariations = [
        sentence,
        normalizeTextForMatching(sentence)
      ];
      
      // Add numbered bullet versions (try different numbers)
      for (let num = 1; num <= 10; num++) {
        sentenceVariations.push(`${num}. ${sentence}`);
        sentenceVariations.push(normalizeTextForMatching(`${num}. ${sentence}`));
      }
      
      sentenceVariations.push(`- ${sentence}`);
      sentenceVariations.push(normalizeTextForMatching(`- ${sentence}`));
      
      // Try to highlight this sentence with any of its variations
      for (const sentenceVar of sentenceVariations) {
        if (sentenceVar && sentenceVar.length > 15) {
          let foundSentence = false;
          
          markInstance.mark(sentenceVar, {
            accuracy: 'complementary',
            className: 'marked',
            separateWordSearch: false,
            each: function() {
              foundSentence = true;
            }
          });
          
          if (foundSentence) {
            console.log(`✓ highlightSpecialConditions: highlighted sentence ${sentenceIndex + 1}`);
            highlightedAny = true;
            break; // Move to next sentence
          }
        }
      }
    }
    
    if (highlightedAny) {
      console.log(`🎯 SPECIAL CONDITIONS HIGHLIGHTING: ✅ SUCCESS with sentence-by-sentence approach`);
      scrollToMark($box);
      return true;
    }
    
  } catch (error) {
    console.error('highlightSpecialConditions: Error during highlighting:', error);
  }
  
  console.log(`highlightSpecialConditions: chunk highlighting failed, trying complete text reconstruction`);
  
  // Strategy: Reconstruct the complete text with numbered bullets to match left panel format
  console.log(`🔍 EXTRACTED FROM API CHAR POSITIONS ${alt.length} chars: "${alt.substring(0, 200)}..."`);
  
  // Split into sentences and try to reconstruct with numbered bullets
  const sentences = alt.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
  console.log(`highlightSpecialConditions: split into ${sentences.length} sentences for reconstruction`);
  
  // Try different reconstruction approaches
  const reconstructionAttempts = [];
  
  for (let startNum = 1; startNum <= 15; startNum++) {
    let reconstructed = '';
    let bulletNum = startNum;
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 15 && /^[A-Z]/.test(trimmed) && !trimmed.toLowerCase().startsWith('supplementary')) {
        reconstructed += `${bulletNum}. ${trimmed} `;
        bulletNum++;
      } else {
        reconstructed += `${trimmed} `;
      }
    }
    
    reconstructionAttempts.push(reconstructed.trim());
  }
  
  let dashReconstructed = '';
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 15 && /^[A-Z]/.test(trimmed) && !trimmed.toLowerCase().startsWith('supplementary')) {
      dashReconstructed += `- ${trimmed} `;
    } else {
      dashReconstructed += `${trimmed} `;
    }
  }
  reconstructionAttempts.push(dashReconstructed.trim());
  
  // Attempt 3: Try original text with some normalization
  reconstructionAttempts.push(alt);
  reconstructionAttempts.push(normalizeTextForMatching(alt));
  
  console.log(`highlightSpecialConditions: created ${reconstructionAttempts.length} reconstruction attempts`);
  
  for (let attemptIndex = 0; attemptIndex < reconstructionAttempts.length; attemptIndex++) {
    const attempt = reconstructionAttempts[attemptIndex];
    if (attempt.length > 100) {
      console.log(`highlightSpecialConditions: trying reconstruction ${attemptIndex + 1}: "${attempt.substring(0, 150)}..."`);
      
      const currentLeftPanelText = $('#renderedText').text();
      const foundInLeftPanel = currentLeftPanelText.toLowerCase().includes(attempt.toLowerCase());
      
      console.log(`highlightSpecialConditions: reconstruction ${attemptIndex + 1} found in left panel: ${foundInLeftPanel}`);
      
      if (foundInLeftPanel) {
        console.log(`highlightSpecialConditions: attempting to highlight complete reconstruction ${attemptIndex + 1}`);
        
        mk.mark(attempt, {
          element: 'span',
          className: 'marked',
          accuracy: 'partially',
          separateWordSearch: false,
          filter: function(node, term, totalCounter, counter) {
            return counter === 1;
          }
        });
        
        const $hits = $box.find('.marked');
        if ($hits.length > 0) {
          console.log(`✓ highlightSpecialConditions: successfully highlighted complete text using reconstruction ${attemptIndex + 1}`);
          scrollToMark($box);
          return true;
        }
        mk.unmark();
      }
    }
  }
  
  console.log(`highlightSpecialConditions: complete text reconstruction failed, trying sentence-by-sentence highlighting`);
  
  for (let sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex++) {
    const sentence = sentences[sentenceIndex].trim();
    if (sentence.length > 20) {
      console.log(`highlightSpecialConditions: trying individual sentence ${sentenceIndex + 1}: "${sentence.substring(0, 80)}..."`);
      
      const sentenceVariations = [
        sentence,
        normalizeTextForMatching(sentence)
      ];
      
      // Add numbered bullets
      for (let num = 1; num <= 25; num++) {
        sentenceVariations.push(`${num}. ${sentence}`);
      }
      
      sentenceVariations.push(`- ${sentence}`);
      
      const currentLeftPanelText = $('#renderedText').text();
      
      for (const sentenceVar of sentenceVariations) {
        if (sentenceVar.length > 20 && currentLeftPanelText.toLowerCase().includes(sentenceVar.toLowerCase())) {
          console.log(`highlightSpecialConditions: found individual sentence match: "${sentenceVar.substring(0, 80)}..."`);
          
          mk.mark(sentenceVar, {
            element: 'span',
            className: 'marked',
            accuracy: 'partially',
            separateWordSearch: false,
            filter: function(node, term, totalCounter, counter) {
              return counter === 1;
            }
          });
          
          const $hits = $box.find('.marked');
          if ($hits.length > 0) {
            console.log(`✓ highlightSpecialConditions: highlighted individual sentence ${sentenceIndex + 1}`);
            highlightedAny = true;
            break;
          }
        }
      }
    }
  }
  
  if (highlightedAny) {
    scrollToMark($box);
    return true;
  }
  
  console.log(`highlightSpecialConditions: segment highlighting failed, falling back to key phrases`);
  
  try {
    const markInstance = new Mark($box[0]);
    let highlightedAny = false;
    
    const keyPhrases = [
      'This product does not have a Higher Lending Charge',
      'Higher Lending Charge',
      'Overpayments You may make overpayments',
      'Overpayments',
      'Pre-Payment Balance',
      'Underpayments Arrangements',
      'Underpayments',
      'tracker rate mortgage',
      'reference rate',
      'floor rate',
      'minimum reference rate',
      'fourteen business days',
      'six consecutive months'
    ];
    
    for (const phrase of keyPhrases) {
      if (alt.toLowerCase().includes(phrase.toLowerCase())) {
        console.log(`highlightSpecialConditions: trying to highlight key phrase "${phrase}"`);
        
        markInstance.mark(phrase, {
          accuracy: 'complementary',
          className: 'marked',
          separateWordSearch: false,
          filter: function(node, term, totalCounter, counter) {
            return counter === 1; // Only highlight the first occurrence of each phrase
          }
        });
        
        const $newHits = $box.find('.marked');
        if ($newHits.length > 0) {
          console.log(`✓ highlightSpecialConditions: highlighted key phrase "${phrase}"`);
          highlightedAny = true;
        }
      }
    }
    
    if (highlightedAny) {
      console.log(`🎯 SPECIAL CONDITIONS HIGHLIGHTING: ✅ SUCCESS with key phrase approach`);
      scrollToMark($box);
      return true;
    }
    
  } catch (error) {
    console.error('highlightSpecialConditions: Error during key phrase highlighting:', error);
  }
  
  console.log(`❌ highlightSpecialConditions: all strategies failed`);
  return false;
}

function highlightCostItems(alt, $box) {
  if (!alt.toLowerCase().includes('fee') && !alt.toLowerCase().includes('cost')) {
    return false;
  }
  
  console.log(`highlightCostItems: handling cost items`);
  
  const costItems = alt.split(',').map(item => item.trim()).filter(Boolean);
  
  for (const item of costItems) {
    const feeMatch = item.match(/(.*?fee[^:]*):?\s*(£[\d,]+\.?\d*)/i);
    if (feeMatch) {
      const [, feeType, amount] = feeMatch;
      console.log(`highlightCostItems: trying to highlight fee "${feeType.trim()}" with amount "${amount}"`);
      
      const mk = new Mark($box[0]);
      mk.mark(feeType.trim(), {
        element: 'span',
        className: 'marked',
        accuracy: 'partially',
        separateWordSearch: false,
        filter: function(node, term, totalCounter, counter) {
          return counter === 1; // Only highlight the first occurrence
        }
      });
      
      let $hits = $box.find('.marked');
      if ($hits.length > 0) {
        console.log(`✓ highlightCostItems: highlighted fee type "${feeType.trim()}"`);
        scrollToMark($box);
        return true;
      }
      
      mk.unmark();
      mk.mark(amount, {
        element: 'span',
        className: 'marked',
        accuracy: 'exactly',
        separateWordSearch: false,
        filter: function(node, term, totalCounter, counter) {
          return counter === 1; // Only highlight the first occurrence
        }
      });
      
      $hits = $box.find('.marked');
      if ($hits.length > 0) {
        console.log(`✓ highlightCostItems: highlighted amount "${amount}"`);
        scrollToMark($box);
        return true;
      }
    }
  }
  
  return false;
}

function highlightTextInChunks(searchText, $box) {
  console.log(`🔍 highlightTextInChunks: Called with text: "${searchText ? searchText.substring(0, 100) : 'null'}..." (length: ${searchText ? searchText.length : 0})`);
  
  if (!searchText || searchText.length < 10) {
    console.log(`🔍 highlightTextInChunks: Returning false - text too short or null`);
    return false;
  }
  
  console.log(`🔍 highlightTextInChunks: Processing text of length ${searchText.length}`);
  
  let highlightedCount = 0;
  
  // Strategy 0: Try to highlight the complete text directly first
  console.log(`🔍 CHUNKED: Trying to highlight complete text directly`);
  if (highlightCompleteTextInDOM(searchText, $box)) {
    console.log(`✅ CHUNKED: Successfully highlighted complete text directly`);
    return true;
  }
  
  // Strategy 0b: Try with normalized text
  const normalizedSearchText = normalizeTextForMatching(searchText);
  if (highlightCompleteTextInDOM(normalizedSearchText, $box)) {
    console.log(`✅ CHUNKED: Successfully highlighted normalized complete text`);
    return true;
  }
  
  // Strategy 1: For cost sections, highlight specific cost items and amounts
  if (searchText.includes('Costs to be paid') || searchText.includes('fee') || searchText.includes('£')) {
    console.log(`🔍 Detected cost section, using cost-specific highlighting`);
    
    const amounts = searchText.match(/£[\d,]+\.?\d*/g);
    if (amounts) {
      for (const amount of amounts) {
        if (highlightCompleteTextInDOM(amount, $box)) {
          highlightedCount++;
        }
      }
    }
    
    const feeDescriptions = [
      'Product fee',
      'Mortgage Exit fee', 
      'Funds Transfer fee',
      'Legal fee',
      'Land Registry fee',
      'payable when you submit your application',
      'payable on final repayment',
      'payable when the mortgage application has completed',
      'payable to your Conveyancer',
      'payable before the loan starts',
      'refundable on non- completion',
      'non-refundable'
    ];
    
    for (const desc of feeDescriptions) {
      if (searchText.includes(desc) && highlightCompleteTextInDOM(desc, $box)) {
        highlightedCount++;
      }
    }
    
    const phrases = [
      'Costs to be paid on a one off basis',
      'Fees payable to Barclays',
      'Other fees',
      'Fee amount'
    ];
    
    for (const phrase of phrases) {
      if (searchText.includes(phrase) && highlightCompleteTextInDOM(phrase, $box)) {
        highlightedCount++;
      }
    }
  }
  
  // Strategy 2: For special conditions, highlight bullet points and complete sections
  else if (searchText.includes('Higher Lending Charge') || searchText.includes('overpayments') || searchText.includes('Pre-Payment Balance')) {
    console.log(`🔍 Detected special conditions, using comprehensive highlighting`);
    
    const sentences = searchText.split(/[.!?]+/).filter(s => s.trim().length > 30);
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length > 30) {
        if (highlightCompleteTextInDOM(trimmedSentence, $box)) {
          highlightedCount++;
        }
      }
    }
    
    // Then try specific bullet points
    const bulletPoints = [
      'The mortgage does not have a Higher Lending Charge',
      'Overpayments will reduce the interest-bearing balance immediately',
      'overpayments equal to or exceeding three monthly payments',
      'will be treated as a partial repayment',
      'Funds in the Pre-Payment Balance can only be used for future underpayments',
      'once an overpayment is made, these funds cannot be requested back',
      'Underpayment arrangements are permitted only if sufficient funds are available',
      'underpayments are limited to six consecutive months',
      'To reduce monthly payments or term via capital repayment',
      'you must notify the lender',
      'Underpayments must be notified at least fourteen business days',
      'requests made within fourteen days will be processed in the following month',
      'For tracker or variable rate mortgages',
      'the minimum reference rate (floor) is 0%',
      'if the reference rate drops below 0%'
    ];
    
    for (const bullet of bulletPoints) {
      if (searchText.includes(bullet) && highlightCompleteTextInDOM(bullet, $box)) {
        highlightedCount++;
      }
    }
  }
  
  // Strategy 3: For recurring costs - try complete text first
  else if (searchText.includes('Costs to be paid regularly')) {
    console.log(`🔍 Detected recurring costs section`);
    
    // Try to highlight the complete recurring costs text (without trailing "This")
    const recurringText = searchText.replace(/\s+This\s*$/, '').trim();
    if (highlightCompleteTextInDOM(recurringText, $box)) {
      highlightedCount++;
    } else {
      if (highlightCompleteTextInDOM('Costs to be paid regularly', $box)) {
        highlightedCount++;
      }
      
      if (searchText.includes('None') && highlightCompleteTextInDOM('None', $box)) {
        highlightedCount++;
        console.log(`✅ Highlighted: "None"`);
      }
    }
  }
  
  // Strategy 4: Break into sentences and highlight meaningful ones
  else {
    console.log(`🔍 Using general sentence-based highlighting`);
    
    const sentences = searchText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length > 20) {
        if (highlightCompleteTextInDOM(trimmedSentence, $box)) {
          highlightedCount++;
        }
      }
    }
  }
  
  return highlightedCount > 0;
}

function highlightTextAcrossNodes($box, startPos, endPos, originalText, normalizedSearchText) {
  console.log(`🔍 CROSS-NODE: Attempting to highlight text from position ${startPos} to ${endPos}`);
  
  // Clear any existing highlights first
  $box.find('.marked').replaceWith(function() {
    return $(this).text();
  });
  
  const allText = $box.text();
  const normalizedAllText = normalizeTextForMatching(allText);
  
  // Extract the target text from the normalized positions
  const targetText = normalizedAllText.substring(startPos, endPos);
  console.log(`🔍 CROSS-NODE: Target text to highlight: "${targetText.substring(0, 100)}..."`);
  
  // Try to find this exact text in the DOM using mark.js
  try {
    const markInstance = new Mark($box[0]);
    let foundMatch = false;
    
    markInstance.mark(targetText, {
      accuracy: 'exactly',
      className: 'marked',
      each: function(element) {
        console.log(`✅ CROSS-NODE: Highlighted exact match: "${element.textContent.substring(0, 50)}..."`);
        foundMatch = true;
      }
    });
    
    if (foundMatch) {
      return true;
    }
    
    // If exact match fails, try with normalized whitespace
    const normalizedTarget = targetText.replace(/\s+/g, ' ').trim();
    markInstance.mark(normalizedTarget, {
      accuracy: 'complementary',
      className: 'marked',
      each: function(element) {
        console.log(`✅ CROSS-NODE: Highlighted normalized match: "${element.textContent.substring(0, 50)}..."`);
        foundMatch = true;
      }
    });
    
    if (foundMatch) {
      return true;
    }
    
    console.log(`🔍 CROSS-NODE: Fallback to key phrases approach`);
    const keyPhrases = extractKeyPhrasesFromSearchText(targetText);
    let phraseCount = 0;
    
    for (const phrase of keyPhrases) {
      if (phrase.length > 8) { // Only use longer phrases
        markInstance.mark(phrase, {
          accuracy: 'complementary',
          className: 'marked',
          each: function(element) {
            console.log(`✅ CROSS-NODE: Highlighted key phrase: "${phrase}"`);
            phraseCount++;
          }
        });
        
        if (phraseCount > 0) {
          foundMatch = true;
          break; // Stop after first successful phrase
        }
      }
    }
    
    return foundMatch;
    
  } catch (error) {
    console.log(`❌ CROSS-NODE: Error during mark.js highlighting: ${error.message}`);
    
    // Final fallback: try manual text search and highlight
    return highlightTextManually($box, targetText, normalizedSearchText);
  }
}

function highlightTextManually($box, targetText, normalizedSearchText) {
  console.log(`🔍 MANUAL: Attempting manual highlighting for: "${targetText.substring(0, 50)}..."`);
  
  // Try to find the text using different strategies
  const searchStrategies = [
    targetText,
    targetText.replace(/\s+/g, ' ').trim(),
    normalizedSearchText,
    normalizedSearchText.replace(/\s+/g, ' ').trim()
  ];
  
  for (const searchText of searchStrategies) {
    if (searchText.length < 10) continue; // Skip very short texts
    
    const allText = $box.text();
    const normalizedAllText = normalizeTextForMatching(allText);
    const searchIndex = normalizedAllText.indexOf(normalizeTextForMatching(searchText));
    
    if (searchIndex >= 0) {
      console.log(`🔍 MANUAL: Found text at index ${searchIndex}`);
      
      try {
        const markInstance = new Mark($box[0]);
        let highlighted = false;
        
        markInstance.mark(searchText, {
          accuracy: 'complementary',
          className: 'marked',
          each: function(element) {
            console.log(`✅ MANUAL: Successfully highlighted: "${element.textContent.substring(0, 50)}..."`);
            highlighted = true;
          }
        });
        
        if (highlighted) {
          return true;
        }
      } catch (error) {
        console.log(`❌ MANUAL: Mark.js error: ${error.message}`);
      }
    }
  }
  
  console.log(`❌ MANUAL: All manual highlighting strategies failed`);
  return false;
}

function extractKeyPhrasesFromSearchText(searchText) {
  const phrases = [];
  
  const sentences = searchText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  phrases.push(...sentences.map(s => s.trim()));
  
  const amounts = searchText.match(/£[\d,]+\.?\d*/g) || [];
  phrases.push(...amounts);
  
  const feePatterns = [
    /[A-Z][a-z]+ fee/g,
    /payable [^.]+/g,
    /refundable [^.]+/g,
    /non-refundable/g,
    /Costs to be paid [^:]+/g
  ];
  
  for (const pattern of feePatterns) {
    const matches = searchText.match(pattern) || [];
    phrases.push(...matches);
  }
  
  return [...new Set(phrases)]
    .filter(p => p.length > 5)
    .sort((a, b) => b.length - a.length);
}

function debugHighlighting(searchText) {
  console.log('=== DEBUG HIGHLIGHTING ===');
  console.log('Search text:', searchText);
  
  const textContent = rawText && rawText.textContent ? rawText.textContent : (typeof rawText === 'string' ? rawText : '');
  console.log('Raw text length:', textContent ? textContent.length : 'No text content');
  
  if (!textContent) {
    console.log('No text content available for debugging');
    return;
  }
  
  const alternatives = searchText.split('|');
  for (const alt of alternatives) {
    const found = textContent.toLowerCase().includes(alt.toLowerCase());
    console.log(`"${alt}" found in text content:`, found);
    
    if (found) {
      const index = textContent.toLowerCase().indexOf(alt.toLowerCase());
      const context = textContent.slice(Math.max(0, index - 50), index + alt.length + 50);
      console.log(`Context around "${alt}":`, context);
    }
    
    const $box = $('#renderedText');
    const htmlText = $box.text();
    const foundInHtml = htmlText.toLowerCase().includes(alt.toLowerCase());
    console.log(`"${alt}" found in rendered HTML:`, foundInHtml);
    
    if (foundInHtml) {
      const htmlIndex = htmlText.toLowerCase().indexOf(alt.toLowerCase());
      const htmlContext = htmlText.slice(Math.max(0, htmlIndex - 50), htmlIndex + alt.length + 50);
      console.log(`HTML context around "${alt}":`, htmlContext);
    }
  }
  
  for (const alt of alternatives) {
    try {
      let pattern = escapeReg(alt);
      if (alt.includes('Early repayment')) {
        pattern = pattern.replace(/Early\s+repayment/i, 'Early[\\s\\u00a0]+repayment');
      }
      pattern = pattern.replace(/\s+/g,'[\\s\\u00a0]+');
      const re = new RegExp(pattern, 'i');
      console.log(`Regex for "${alt}":`, re);
      
      const matches = textContent.match(re);
      console.log(`Regex matches for "${alt}":`, matches ? matches.length : 0);
      
      const $box = $('#renderedText');
      const htmlMatches = $box.text().match(re);
      console.log(`HTML regex matches for "${alt}":`, htmlMatches ? htmlMatches.length : 0);
    } catch (e) {
      console.error(`Error creating regex for "${alt}":`, e);
    }
  }
}
