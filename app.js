/* ===============================================================
   app.js — full file (force-slice for tricky fields)
================================================================ */
const placeholderMap = {
  "[LENDER]"                 : "lender",
  "[INITIAL_AMOUNT]"         : "initial_amount",
  "[COST_ONCE]"              : "other_costs",
  "[COST_RECURRING]"         : "other_costs",
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
 $('#pdfEmbed').attr('src', URL.createObjectURL(selectedFile) + '#zoom=150' );
 $('#pdfPreview').removeClass('d-none');

  try {
    await loadAssets();                           
    await new Promise(r=>setTimeout(r,1500));     
    renderUI();

    $('#previewStage').addClass('d-none');        
    $('#workspace, #downloadBtn').removeClass('d-none');
    $('#docControls').removeClass('d-none'); 
    $('#downloadBtn').show();
    $('#loadingOverlay').addClass('d-none');

    $('#navbarTitle').text(
      'Elite Intelligence | mortgage report automation: intelligent analytics review'
    );
  } catch (error) {
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
      expiry_date: apiData.expiry_date,
      special_conditions: apiData.special_conditions
    };
    console.log('Processed keyData:', JSON.stringify(keyData, null, 2));
    console.log('Non-empty fields:', Object.entries(keyData).filter(([k,v]) => v?.value).map(([k,v]) => `${k}: ${v.value}`));
    
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
   const txt     = v.value;                                  
   const feeNum  = (txt.match(/£[\d,]+\.\d{2}/) || [''])[0]; 
   const feeDisp = `Product fee: ${feeNum || '?'}`;
   const recur   = txt.match(/Recurring costs:[^\n]*/i)?.[0]
                   || 'Recurring costs: None';

   const recurVal = recur.replace(/^Recurring costs:\s*/i,'').trim();

   const clsOne  = info.confidence?.one_off_costs === 1 ? 'conf-high'
                  : info.confidence?.one_off_costs === 0 ? 'conf-low' : 'conf-mid';
   const clsRec  = info.confidence?.recurring_costs === 1 ? 'conf-high'
                  : info.confidence?.recurring_costs === 0 ? 'conf-low' : 'conf-mid';

   html = html.replaceAll(ph, `
     <span class="keyword ${clsOne}"
           data-search="${feeNum}"
           data-start="${v.start?.one_off_costs || 0}"
           data-end="${v.end?.one_off_costs || 0}">
       ${esc(feeDisp)}
     </span><br>
     <span class="keyword ${clsRec}"
           data-search="${recurVal || 'None'}"
           data-start="${v.start?.recurring_costs || 0}"
           data-end="${v.end?.recurring_costs || 0}">
       ${esc(recur)}
     </span>
   `);
   continue;
}



    let display='', search='';

    if(key==='early_repayment_section'){
      display = String(v.value);       
      search  = 'Section ' + display;               

    } else if (key === 'expiry_date') {
      display = String(v.value);                 

      const [d,m,y] = display.split('/');
      const monthNames = ['January','February','March','April','May','June',
                          'July','August','September','October','November','December'];
      const longFmt = (d && m && y) ? `${Number(d)} ${monthNames[Number(m)-1]} ${y}` : '';

      const parts = [longFmt, display].filter(Boolean);  
      search      = parts.join('|');                                     
    } else if(typeof v.value==='object' && 'product_fee' in v.value){
      display=`£${Number(v.value.product_fee).toLocaleString('en-GB',{minimumFractionDigits:2})}`;
      search = display.replace(/[^0-9]/g,'');

    } else if(typeof v.value==='object'){
      display=JSON.stringify(v.value); search=display;

    } else {
      display=String(v.value); search=display;
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

  for (const alt of alts){
    const re = new RegExp(
        escapeReg(alt).replace(/\s+/g,'[\\s\\u00a0]+'),
        'i'
    );
    mk.markRegExp(re, {
      element:'span',
      className:'marked',
      acrossElements:true,
      separateWordSearch:false
    });

    let $hits = $box.find('.marked');
    if (!$hits.length){
      mk.unmark();                              
      continue;
    }

    const wantRe =
        /£\d/.test(alt)        && /product\s*fee/i      ||   
        /none|£?0(\.00)?/i.test(alt) && /paid\s*regularly/i || 
        null;

    if (wantRe && $hits.length > 1){
      $hits = $hits.filter((_,el) => wantRe.test(el.parentNode.innerText));
      if (!$hits.length) $hits = $box.find('.marked');        
    }

    const $target = $hits.first();
    $box.find('.marked').not($target).removeClass('marked');

    scrollToMark($box);
    return true;                                    
  }

  console.warn('highlightExact failed for:', txt);
  dbgMark(txt);                                    
  return false;
}




function highlightBySlice(start,end){
  if(!Number.isFinite(start)||!Number.isFinite(end)) return false;

  const slice = rawText.slice(start,end).replace(/\s+/g,' ').trim();
  if(slice.length < 3) return false;       

  return highlightExact(escapeReg(slice));
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
  clone.classList.remove('overflow-auto');

  clone.querySelectorAll('.keyword,.marked')
       .forEach(el=>el.replaceWith(document.createTextNode(el.textContent)));

  document.body.appendChild(clone);
  const pdf=new jsPDF({unit:'pt',format:'a4'});
  await pdf.html(clone,{
    margin,
    autoPaging:'text',
    html2canvas:{scale:1,useCORS:true,backgroundColor:'#ffffff'}
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
    console.warn('rawText / keyData not loaded yet – upload a PDF first.');
    return;
  }
  console.log('──────────────── slice inspector ────────────────');
  for (const [k, info] of Object.entries(keyData)) {
    (info.values || []).forEach((v, i) => {
      const slice = rawText.slice(v.start, v.end).replace(/\s+/g, ' ').trim();
      console.log(`${k}[${i}] →`, `"${slice}"`);
    });
  }
  console.log('──────────────────────────────────────────────────');
}
