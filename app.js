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

async function loadAssets(){
  if(rawText && keyData && reportTemplate) return;
  
  if (!selectedFile) {
    throw new Error('No PDF file selected');
  }

  try {
    const base64 = await convertFileToBase64(selectedFile);
    
    const response = await fetch('https://mortgage-api-229824289274.europe-west2.run.app/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdf_base64: base64,
        stages_to_run: [1, 2],
        enable_llm: true
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const apiData = await response.json();
    console.log('Full API response:', JSON.stringify(apiData, null, 2));
    console.log('API processing metadata:', apiData.processing_metadata);
    console.log('Field sources:', apiData.field_sources);
    
    rawText = apiData.extracted_text || '';
    console.log('Extracted text length:', rawText ? rawText.length : 'undefined/empty');
    console.log('Extracted text preview:', rawText ? rawText.substring(0, 200) + '...' : 'No text');
    
    keyData = {
      lender: apiData.lender,
      term: apiData.term,
      initial_amount: apiData.initial_amount,
      early_repayment_section: apiData.early_repayment_section,
      other_costs: apiData.other_costs,
      net_advance: apiData.net_advance,
      expiry_date: apiData.expiry_date,
      special_conditions: apiData.special_conditions
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
              data-start="${v.start?.one_off_costs || 0}"
              data-end="${v.end?.one_off_costs || 0}">
          ${esc(formattedOneOff)}
        </span><br>
        <span class="keyword ${clsRec}"
              data-search="${esc(recurringValue)}"
              data-start="${v.start?.recurring_costs || 0}"
              data-end="${v.end?.recurring_costs || 0}">
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

    html = html.replaceAll(
      ph,
      `<span class="keyword ${cls}"
             data-search="${esc(search)}"
             data-start="${v.positions?.start || 0}" data-end="${v.positions?.end || 0}">
         ${esc(display)}
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
    const {search,start,end}=this.dataset;
    
    console.log(`=== KEYWORD CLICK DEBUG ===`);
    console.log(`Keyword clicked: "${$(this).text()}"`);
    console.log(`Search patterns: "${search}"`);
    console.log(`Position range: ${start}-${end}`);
    
    if (search) {
      debugHighlighting(search);
    }
    
    if(start && end && +start > 0 && +end > 0) {
      console.log(`Trying position-based highlighting: ${start}-${end}`);
      if(highlightBySlice(+start,+end)) return;
    }
    
    if(search && highlightExact(search)) {
      console.log(`Used string matching fallback for: ${search}`);
      return;
    }
    
    console.warn(`Both highlighting methods failed for: ${search} (${start}-${end})`);
  });
}


function highlightExact(txt){
  if (!txt) return false;

  const $box = $('#renderedText');
  const mk   = new Mark($box[0]);
  mk.unmark();                                

  const alts = txt.split('|').map(s => s.trim()).filter(Boolean);
  console.log('highlightExact: trying alternatives:', alts);

  for (const alt of alts){
    console.log(`highlightExact: trying pattern "${alt}"`);
    
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
        continue;
      }
    }

    const wantRe =
        /£\d/.test(alt)        && /product\s*fee/i      ||   
        /none|£?0(\.00)?/i.test(alt) && /paid\s*regularly/i || 
        null;

    if (wantRe && $hits.length > 1){
      console.log('highlightExact: filtering hits with context filter');
      $hits = $hits.filter((_,el) => wantRe.test(el.parentNode.innerText));
      if (!$hits.length) $hits = $box.find('.marked');        
    }

    const $target = $hits.first();
    $box.find('.marked').not($target).removeClass('marked');

    scrollToMark($box);
    console.log(`highlightExact: successfully highlighted "${alt}"`);
    return true;                                    
  }

  console.warn('highlightExact failed for all alternatives:', alts);
  dbgMark(txt);                                    
  return false;
}




function highlightBySlice(start,end){
  if(!Number.isFinite(start)||!Number.isFinite(end)) return false;

  const slice = rawText.slice(start,end).replace(/\s+/g,' ').trim();
  console.log(`highlightBySlice: extracted slice "${slice}" from positions ${start}-${end}`);
  
  if(slice.length < 3) {
    console.warn(`highlightBySlice: slice too short (${slice.length} chars): "${slice}"`);
    return false;       
  }

  if (!/[£\d\/\-]/.test(slice)) {
    console.warn(`highlightBySlice: slice doesn't contain expected patterns: "${slice}"`);
    return false;
  }

  return highlightExact(slice);
}



function highlightSlice(start,end){
  if(!Number.isFinite(start)||!Number.isFinite(end)) return false;
  const $pre=$('#rawText')
      .show()
      .css({position:'absolute',top:0,left:0,right:0,bottom:0,background:'#fff',
            zIndex:1050,overflow:'auto',padding:'1rem'})
      .html(`${esc(rawText.slice(0,start))}
             <span class="marked">${esc(rawText.slice(start,end))}</span>
             ${esc(rawText.slice(end))}`);
  scrollToMark($pre);
  return true;
}


async function downloadReportPDF(){
  const { jsPDF } = window.jspdf;
  const margin=40;

  const src=document.getElementById('report');
  const clone=src.cloneNode(true);
  clone.removeAttribute('style');
  clone.style.width='800px';
  clone.style.lineHeight='1.6';
  clone.style.wordWrap='break-word';
  clone.style.overflowWrap='break-word';
  clone.classList.remove('overflow-auto');

  clone.querySelectorAll('.keyword,.marked')
       .forEach(el=>el.replaceWith(document.createTextNode(el.textContent)));

  document.body.appendChild(clone);
  const pdf=new jsPDF({unit:'pt',format:'a4'});
  await pdf.html(clone,{
    margin,
    autoPaging:'text',
    html2canvas:{scale:0.8,useCORS:true,backgroundColor:'#ffffff',letterRendering:true}
  });
  document.body.removeChild(clone);
  pdf.save('Mortgage_Report.pdf');
}

function clearMarks($c){ $c.find('.marked').replaceWith(function(){return $(this).text();}); }
function scrollToMark($c){ const $m=$c.find('.marked').first();
  if($m.length) $c.scrollTop($m.position().top + $c.scrollTop() - SCROLL_PAD); }
function escapeReg(s){ return s.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&'); }
function esc(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }



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
  console.log('Raw text length:', rawText ? rawText.length : 'No rawText');
  
  if (!rawText) {
    console.log('No rawText available for debugging');
    return;
  }
  
  const alternatives = searchText.split('|');
  for (const alt of alternatives) {
    const found = rawText.toLowerCase().includes(alt.toLowerCase());
    console.log(`"${alt}" found in rawText:`, found);
    
    if (found) {
      const index = rawText.toLowerCase().indexOf(alt.toLowerCase());
      const context = rawText.slice(Math.max(0, index - 50), index + alt.length + 50);
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
      
      const matches = rawText.match(re);
      console.log(`Regex matches for "${alt}":`, matches ? matches.length : 0);
      
      const $box = $('#renderedText');
      const htmlMatches = $box.text().match(re);
      console.log(`HTML regex matches for "${alt}":`, htmlMatches ? htmlMatches.length : 0);
    } catch (e) {
      console.error(`Error creating regex for "${alt}":`, e);
    }
  }
}
