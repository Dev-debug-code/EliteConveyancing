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
    console.log('Extracted text length:', rawText ? rawText.length : 'undefined/empty');
    console.log('Extracted text preview:', rawText ? rawText.substring(0, 200) + '...' : 'No text');
    
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
    console.log('Processed keyData:', JSON.stringify(keyData, null, 2));
    console.log('Non-empty fields:', Object.entries(keyData).filter(([k,v]) => v?.value).map(([k,v]) => `${k}: ${v.value}`));
    
    console.log('=== DEBUGGING START/END POSITIONS ===');
    for (const [key, data] of Object.entries(keyData)) {
      if (data && data.positions && data.positions.start !== undefined && data.positions.end !== undefined) {
        const extractedText = rawText.slice(data.positions.start, data.positions.end);
        console.log(`${key}:`);
        console.log(`  API value: "${data.value}"`);
        console.log(`  Positions: ${data.positions.start}-${data.positions.end}`);
        console.log(`  Extracted text: "${extractedText}"`);
        console.log(`  Match: ${extractedText === data.value ? 'YES' : 'NO'}`);
        console.log('---');
      } else if (data && data.value) {
        console.log(`${key}: No position data available (API value: "${data.value}")`);
      }
    }
    
    const tplResponse = await fetch('data/mortgage_report_template.html');
    reportTemplate = await tplResponse.text();
    
  } catch (error) {
    console.error('Error loading assets:', error);
    $('#loadingOverlay').addClass('d-none');
    alert(`Error processing PDF: ${error.message}`);
    throw error;
  }
}

function renderUI(){
  if (!rawText || rawText.trim() === '') {
    console.log('No extracted text available from API');
    $('#renderedText').html('<p class="text-muted">No document content available</p>');
  } else {
    console.log('Rendering extracted text with markdown parsing');
    $('#renderedText').html(marked.parse(rawText));
  }
  
  $('#rawText').text(rawText || '');
  $('#report').html(buildReport(reportTemplate,keyData));
  bindClicks();
}


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
        <span class="keyword ${clsOne}"
              data-search="${esc(oneOffCosts)}"
              data-source-text="${esc(oneOffCosts)}"
              data-display-text="${esc(formattedOneOff)}"
              data-start="${v.positions?.start?.one_off_costs || 0}"
              data-end="${v.positions?.end?.one_off_costs || 0}">
          ${esc(formattedOneOff)}
        </span><br>
        <span class="keyword ${clsRec}"
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
      `<span class="keyword ${cls}"
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
  $('#report').off('click', '.keyword').on('click', '.keyword', function(){
    const {search, start, end} = this.dataset;
    const sourceText = this.dataset.sourceText;
    const displayText = this.dataset.displayText;
    
    console.log(`=== KEYWORD CLICK DEBUG ===`);
    console.log(`Keyword clicked: "${$(this).text()}"`);
    console.log(`Search patterns: "${search}"`);
    console.log(`Source text: "${sourceText}"`);
    console.log(`Display text: "${displayText}"`);
    console.log(`Position range: ${start}-${end}`);
    console.log('Raw text available:', !!rawText);
    console.log('Raw text length:', rawText ? (rawText.textContent ? rawText.textContent.length : rawText.length) : 'N/A');
    
    if (!rawText || (!rawText.textContent && !rawText.length)) {
      console.error('Cannot highlight: No raw text available. This may indicate PDF extraction failed.');
      alert('Highlighting unavailable: PDF text extraction failed. This document may have structural issues.');
      return;
    }
    
    if (search) {
      debugHighlighting(search);
    }
    
    if(start && end && +start > 0 && +end > 0 && +end > +start) {
      console.log(`Trying position-based highlighting: ${start}-${end}`);
      const success = highlightBySlice(+start, +end);
      if(success) {
        console.log(`✓ Position-based highlighting succeeded`);
        return;
      } else {
        console.log(`❌ Position-based highlighting failed`);
      }
    }
    
    if(sourceText && sourceText !== 'undefined' && highlightExact(sourceText)) {
      console.log(`✓ Source text highlighting succeeded: ${sourceText}`);
      return;
    }
    
    if(search && highlightExact(search)) {
      console.log(`✓ Search pattern highlighting succeeded: ${search}`);
      return;
    }
    
    if(displayText && displayText !== search && highlightExact(displayText)) {
      console.log(`✓ Display text highlighting succeeded: ${displayText}`);
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

  const alts = txt.split('|').map(s => s.trim()).filter(Boolean);
  console.log('highlightExact: trying alternatives:', alts);

  for (const alt of alts){
    console.log(`highlightExact: trying pattern "${alt}"`);
    
    const betterMatch = findTextInSource(alt, textContent);
    if (betterMatch && betterMatch !== alt) {
      console.log(`highlightExact: found better match "${betterMatch}" for "${alt}"`);
      if (highlightExact(betterMatch)) {
        return true;
      }
    }
    
    if (/^\d+\.\s*Early\s*repayment/i.test(alt)) {
      console.log('highlightExact: handling numbered section converted to list');
      const $listItems = $box.find('li');
      console.log(`highlightExact: found ${$listItems.length} list items`);
      let found = false;
      $listItems.each(function(index) {
        const itemText = $(this).text().trim();
        console.log(`highlightExact: checking list item ${index}: "${itemText.substring(0, 50)}..."`);
        if (/Early\s*repayment/i.test(itemText)) {
          console.log(`highlightExact: found "Early repayment" in list item ${index}: "${itemText}"`);
          
          const $listItem = $(this);
          const $paragraph = $listItem.find('p');
          if ($paragraph.length > 0) {
            console.log(`highlightExact: highlighting text inside paragraph`);
            const html = $paragraph.html();
            const highlightedHtml = html.replace(/(Early\s*repayment)/i, '<span class="marked">$1</span>');
            $paragraph.html(highlightedHtml);
          } else {
            console.log(`highlightExact: no paragraph found, adding marked class to list item`);
            $listItem.addClass('marked');
          }
          
          found = true;
          return false; // break
        }
      });
      
      if (found) {
        scrollToMark($box);
        console.log(`highlightExact: successfully highlighted numbered section "${alt}"`);
        return true;
      } else {
        console.log('highlightExact: no list items found containing "Early repayment"');
        continue; // Try next alternative instead of falling through
      }
    }
    
    console.log(`highlightExact: checking if "${alt}" matches /8\\.\\s*Early\\s*repayment/i`);
    if (/8\.\s*Early\s*repayment/i.test(alt)) {
      console.log('highlightExact: trying direct list item search for Early repayment');
      const $listItems = $box.find('li');
      let found = false;
      $listItems.each(function(index) {
        const itemText = $(this).text().trim();
        if (/Early\s*repayment/i.test(itemText)) {
          console.log(`highlightExact: found "Early repayment" in list item ${index}: "${itemText.substring(0, 50)}..."`);
          
          const $listItem = $(this);
          const $paragraph = $listItem.find('p');
          if ($paragraph.length > 0) {
            console.log(`highlightExact: highlighting text inside paragraph element`);
            const html = $paragraph.html();
            const highlightedHtml = html.replace(/(Early\s*repayment)/gi, '<span class="marked">$1</span>');
            $paragraph.html(highlightedHtml);
            found = true;
          } else {
            console.log(`highlightExact: no paragraph found, highlighting directly in list item`);
            const html = $listItem.html();
            const highlightedHtml = html.replace(/(Early\s*repayment)/gi, '<span class="marked">$1</span>');
            $listItem.html(highlightedHtml);
            found = true;
          }
          
          return false; // break
        }
      });
      
      if (found) {
        scrollToMark($box);
        console.log(`highlightExact: successfully highlighted "Early repayment" in list item`);
        return true;
      } else {
        console.log('highlightExact: no direct list items found containing "Early repayment"');
        continue; // Try next alternative instead of falling through
      }
    }
    
    mk.mark(alt, {
      element:'span',
      className:'marked',
      accuracy: 'exactly',
      separateWordSearch:false
    });

    let $hits = $box.find('.marked');
    console.log(`highlightExact: found ${$hits.length} matches for "${alt}"`);
    
    if (!$hits.length){
      mk.unmark();
      
      console.log(`highlightExact: mark.js failed, trying manual highlighting for "${alt}"`);
      const boxText = $box.text();
      const altLower = alt.toLowerCase();
      const boxTextLower = boxText.toLowerCase();
      
      if (boxTextLower.includes(altLower)) {
        console.log(`highlightExact: found "${alt}" in text, applying manual highlighting`);
        const regex = new RegExp(escapeReg(alt), 'gi');
        
        $box.find('*').addBack().contents().filter(function() {
          return this.nodeType === 3; // Text nodes only
        }).each(function() {
          const text = this.textContent;
          if (regex.test(text)) {
            const highlightedText = text.replace(regex, '<span class="marked">$&</span>');
            $(this).replaceWith(highlightedText);
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




function highlightBySlice(start,end){
  if(!Number.isFinite(start)||!Number.isFinite(end)) return false;

  const textContent = rawText && rawText.textContent ? rawText.textContent : (typeof rawText === 'string' ? rawText : '');
  if (!textContent || textContent.length === 0) {
    console.warn('highlightBySlice: No text content available for highlighting');
    return false;
  }
  
  if (start < 0 || end > textContent.length || start >= end) {
    console.warn(`highlightBySlice: Invalid positions ${start}-${end} for text length ${textContent.length}`);
    return false;
  }

  const slice = textContent.slice(start,end);
  const normalizedSlice = slice.replace(/\s+/g,' ').trim();
  
  console.log(`📍 EXTRACTED: "${normalizedSlice}"`);
  
  if(normalizedSlice.length < 2) {
    console.warn(`highlightBySlice: slice too short (${normalizedSlice.length} chars): "${normalizedSlice}"`);
    return false;       
  }

  if (normalizedSlice.length < 3 && !/[£\d\/\-]/.test(normalizedSlice)) {
    console.warn(`highlightBySlice: short slice doesn't contain expected patterns: "${normalizedSlice}"`);
    return false;
  }

  console.log('highlightBySlice: using direct slice highlighting');
  return highlightSlice(start, end);
}



function highlightSlice(start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  
  const textContent = rawText && rawText.textContent ? rawText.textContent : (typeof rawText === 'string' ? rawText : '');
  if (!textContent || textContent.length === 0) {
    console.warn('highlightSlice: No text content available for highlighting');
    return false;
  }
  
  if (start < 0 || end > textContent.length || start >= end) {
    console.warn(`highlightSlice: Invalid positions ${start}-${end} for text length ${textContent.length}`);
    return false;
  }

  const slice = textContent.slice(start, end);
  const normalizedSlice = slice.replace(/\s+/g, ' ').trim();
  
  if (normalizedSlice.length < 2) {
    console.warn(`❌ Slice too short: "${normalizedSlice}"`);
    return false;       
  }

  const result = highlightInRenderedText(normalizedSlice);
  console.log(`🎯 MATCH: ${result ? '✅ SUCCESS' : '❌ FAILED'}`);
  return result;
}

function highlightInRenderedText(textToHighlight) {
  if (!textToHighlight || textToHighlight.length < 2) {
    console.warn('highlightInRenderedText: Invalid text to highlight');
    return false;
  }

  const $box = $('#renderedText');
  if ($box.length === 0) {
    console.warn('highlightInRenderedText: Rendered text container not found');
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
    console.warn(`❌ All highlighting strategies failed for: "${textToHighlight.substring(0, 50)}..."`);
  }

  return highlightSuccess;
}

function scrollToFirstMark($container) {
  const $firstMark = $container.find('mark.marked').first();
  if ($firstMark.length > 0) {
    const containerTop = $container.scrollTop();
    const markTop = $firstMark.position().top;
    $container.scrollTop(containerTop + markTop - 120); // 120px padding from top
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

  clone.querySelectorAll('.keyword,.marked')
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

function normalizeTextForMatching(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[""'']/g, '"')  // Normalize quotes
    .replace(/[–—]/g, '-')  // Normalize dashes
    .replace(/£(\d+)\.(\d+)/g, '£$1.$2')  // Normalize currency
    .replace(/\u00a0/g, ' ')  // Replace non-breaking spaces
    .replace(/[•·]/g, '-')  // Normalize bullet points
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

function debugSlices() {
  if (!rawText || !keyData) {
    console.log('No data available for debugging');
    return;
  }
  
  console.log('=== DEBUG SLICES ===');
  for (const [key, data] of Object.entries(keyData)) {
    if (data?.start && data?.end) {
      const slice = rawText.slice(data.start, data.end);
      console.log(`${key}: "${slice}" (${data.start}-${data.end})`);
    }
  }
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
