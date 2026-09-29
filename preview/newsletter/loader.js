(async function(){
'use strict';
const root=document.querySelector('[data-affiniti-newsletter]');
if(!root||root.dataset.started)return;root.dataset.started='true';
const status=root.querySelector('[role="status"]');
const abort=new AbortController(),deadline=setTimeout(()=>abort.abort(),15000);
  function validate(feed){
    if(!feed||feed.schema_version!==1||feed.mode!=='display_preview'||typeof feed.ready!=='boolean'||
       !Array.isArray(feed.tags)||feed.tags.length>200||!Array.isArray(feed.articles)||feed.articles.length>1000)
      throw Error('invalid_feed');
    var tags=new Set(),ids=new Set(),urls=new Set();
    feed.tags.forEach(function(t){if(!t||typeof t.id!=='string'||typeof t.name!=='string'||typeof t.slug!=='string'||tags.has(t.id))throw Error('invalid_tag');tags.add(t.id);});
    feed.articles.forEach(function(p){
      if(!p||!Number.isSafeInteger(p.id)||p.id<=0||ids.has(p.id)||urls.has(p.canonical_url)||
         typeof p.canonical_url!=='string'||!/^https:\/\/affinitiplus\.substack\.com\/p\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.canonical_url)||
         typeof p.title!=='string'||!p.title||p.title.length>4096||typeof p.subtitle!=='string'||p.subtitle.length>4096||
         !Array.isArray(p.authors)||!p.authors.length||!p.authors.every(function(a){return typeof a==='string'&&a.length>0&&a.length<=500;})||
         !Array.isArray(p.tag_ids)||!p.tag_ids.length||!p.tag_ids.every(function(id){return tags.has(id);}))throw Error('invalid_article');
      ids.add(p.id);urls.add(p.canonical_url);
    });return feed;
  }

async function get(url,type){const r=await fetch(url,{credentials:'omit',signal:abort.signal,cache:'no-cache'});if(!r.ok||!(r.headers.get('content-type')||'').includes(type))throw Error('response');const body=await r.text();if(body.length>500000)throw Error('size');return body;}
try{
 const base='https://rhyen-jivan-affinitiplus.github.io/Affiniti-Substack-Feed/preview/';
 const [raw,html]=await Promise.all([get(base+'feed.json','application/json'),get(base+'newsletter/template.html?v=1','text/html')]);
 const feed=validate(JSON.parse(raw));
 if(!feed.ready||!feed.articles.length)throw Error('empty_feed');
 if(feed.articles.some(p=>!Number.isFinite(Date.parse(p.published_at))))throw Error('invalid_date');
 const descriptions={"mind-the-gap": "A series about the gap between what we intend to do and what our minds actually do \u2014 why change feels impossible, why one insult can outweigh five compliments, and why self-criticism persists even when it does not work.", "agency": "A series that unpicks why you cannot manifest your way back into control, and what actually restores it.", "the-psychology-of-psychologists": "A series that goes behind the training: what it takes to become a clinical psychologist, and what the job does to you once you are one."};
 const SERIES_DATA=feed.tags.map(t=>{
   const posts=feed.articles.filter(p=>p.tag_ids.includes(t.id)).map(p=>({id:p.id,title:p.title,summary:p.subtitle,url:p.canonical_url,time:Date.parse(p.published_at)})).sort((a,b)=>b.time-a.time||a.id-b.id);
   return {id:t.id,name:t.name,description:descriptions[t.slug]||'',period:'Collected articles',status:posts.length+' articles',colours:{a:'#4a2824',b:'#2a1613',accent:'#e5d6b2',soft:'rgba(229,214,178,.13)'},posts};
 }).filter(s=>s.posts.length).sort((a,b)=>b.posts[0].time-a.posts[0].time||a.name.localeCompare(b.name,'en'));
 if(!SERIES_DATA.length)throw Error('no_series');
 if(document.querySelector('#nl-s02'))throw Error('duplicate_component');
 const template=document.createElement('template');template.innerHTML=html;
 if(template.content.querySelector('script'))throw Error('unexpected_script');
 root.appendChild(template.content.cloneNode(true));
 status.textContent=Date.now()-Date.parse(feed.collected_at)>172800000?'Showing the last available article collection.':'';
 root.dataset.renderer='newsletter-v1';
      const section = document.querySelector('#nl-s02[data-series-section]');
      if (!section || section.dataset.seriesReady === 'true') return;
      section.dataset.seriesReady = 'true';
      const viewport = section.querySelector('[data-series-viewport]');
      const track = section.querySelector('[data-series-track]');
      const selector = section.querySelector('[data-series-selector]');
      const prevButton = section.querySelector('[data-series-prev]');
      const nextButton = section.querySelector('[data-series-next]');

      const modal = document.querySelector('[data-post-modal]');

      /*
        Squarespace sections and Fluid Engine can create transformed stacking
        contexts. Moving the modal directly under <body> guarantees that its
        fixed positioning and maximum z-index sit above all page sections.
      */
      if (modal && modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }

      const modalSeriesName = document.querySelector('[data-modal-series-name]');
      const modalPosition = document.querySelector('[data-modal-position]');
      const modalTitle = document.querySelector('[data-modal-title]');
      const modalSummary = document.querySelector('[data-modal-summary]');
      const modalRead = document.querySelector('[data-modal-read]');
      const modalComments = document.querySelector('[data-modal-comments]');
      const modalPrev = document.querySelector('[data-modal-prev]');
      const modalNext = document.querySelector('[data-modal-next]');
      const modalTimeline = document.querySelector('[data-modal-timeline]');
      const modalEmbedHost = document.querySelector('[data-modal-embed-host]');
      const modalEmbedStatus = document.querySelector('[data-modal-embed-status]');

      let returnFocus = null;
      let activeSeries = 0;
      let activePost = 0;
      let drag = null;

      const orbitIcon = `
        <svg viewBox="0 0 34 20" aria-hidden="true">
          <circle class="nl-post-orbit-ring" cx="8" cy="10" r="5.5"></circle>
          <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"></circle>
          <path class="nl-post-orbit-line" d="M13.5 10H30"></path>
          <path class="nl-post-orbit-head" d="m25 5 5 5-5 5"></path>
        </svg>`;

      const buildPanels = () => {
        track.innerHTML = '';
        selector.innerHTML = '';
        SERIES_DATA.forEach((series, seriesIndex) => {
          const panel = document.createElement('section');
          panel.className = 'nl-series-panel';
          panel.style.setProperty('--panel-accent', series.colours.accent);
          panel.style.setProperty('--panel-soft', series.colours.soft);
          panel.setAttribute('aria-label', series.name);

          const postsMarkup = series.posts.map((post, slotIndex) => {
            const slotNumber = String(slotIndex + 1).padStart(2, '0');

            if (!post) {
              return `
                <article class="nl-post-tile nl-post-tile--empty" aria-label="Article slot ${slotNumber} reserved">
                  <span class="nl-post-tile__eyebrow">Article ${slotNumber}</span>
                  <span class="nl-post-tile__placeholder">Reserved for the next post in this series.</span>
                  <span class="nl-post-tile__footer">
                    <span class="nl-post-tile__status">Series space</span>
                    <span class="nl-post-tile__empty-mark" aria-hidden="true"></span>
                  </span>
                </article>`;
            }

            return `
              <button class="nl-post-tile" type="button" data-post-index="${slotIndex}" data-series-index="${seriesIndex}">
                <span class="nl-post-tile__eyebrow">Article ${slotNumber}</span>
                <span class="nl-post-tile__title">${escapeHTML(post.title)}</span>
                <span class="nl-post-tile__footer">
                  <span class="nl-post-tile__status">Read article</span>
                  <span class="nl-post-tile__open">${orbitIcon}</span>
                </span>
              </button>`;
          }).join('');

          panel.innerHTML = `
            <div class="nl-series-identity">
              <div>
                <span class="nl-series-index">Series ${String(seriesIndex + 1).padStart(2, '0')} of ${String(SERIES_DATA.length).padStart(2, '0')}</span>
                <h3 class="nl-series-name">${escapeHTML(series.name)}</h3>
                <p class="nl-series-description">${escapeHTML(series.description)}</p>
                <div class="nl-series-meta"><span>${escapeHTML(series.period)}</span><span>${escapeHTML(series.status)}</span></div>
              </div>
            </div>
            <div class="nl-series-posts">
              <div class="nl-series-posts__head">
                <h3>Posts in this series</h3>
                <span class="nl-series-posts__count">${series.posts.length}</span>
              </div>
              <div class="nl-post-grid">${postsMarkup}</div>
            </div>`;
          track.appendChild(panel);

          const navButton = document.createElement('button');
          navButton.type = 'button';
          navButton.className = 'nl-series-selector__button';
          navButton.textContent = series.name;
          navButton.setAttribute('aria-label', `Show ${series.name}`);
          navButton.addEventListener('click', () => setSeries(seriesIndex));
          selector.appendChild(navButton);
        });

        track.querySelectorAll('[data-post-index]').forEach(tile => {
          tile.addEventListener('click', event => {
            event.stopPropagation();
            openPost(Number(tile.dataset.seriesIndex), Number(tile.dataset.postIndex));
          });
        });
      };

      function escapeHTML(value) {
        return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[character]);
      }

      const updateTrack = (dragPixels = 0, immediate = false) => {
        const width = viewport?.clientWidth || 1;
        if (immediate) track.style.transition = 'none';
        track.style.transform = `translate3d(${(-activeSeries * width) + dragPixels}px,0,0)`;
        if (immediate) requestAnimationFrame(() => { track.style.transition = ''; });
      };

      const updateSeriesUI = () => {
        const series = SERIES_DATA[activeSeries];
        Array.from(track.children).forEach((panel,i)=>{panel.inert=i!==activeSeries;panel.setAttribute('aria-hidden',String(i!==activeSeries));});
        section.style.setProperty('--series-bg-a', series.colours.a);
        section.style.setProperty('--series-bg-b', series.colours.b);
        section.style.setProperty('--series-accent', series.colours.accent);
        section.style.setProperty('--series-soft', series.colours.soft);

        selector.querySelectorAll('.nl-series-selector__button').forEach((button, index) => {
          button.classList.toggle('is-active', index === activeSeries);
          button.setAttribute('aria-current', index === activeSeries ? 'true' : 'false');
        });
      };

      const setSeries = (index, immediate = false) => {
        activeSeries = (index + SERIES_DATA.length) % SERIES_DATA.length;
        updateTrack(0, immediate);
        updateSeriesUI();
      };
      const previousSeries = () => setSeries(activeSeries - 1);
      const nextSeries = () => setSeries(activeSeries + 1);

      prevButton?.addEventListener('click', previousSeries);
      nextButton?.addEventListener('click', nextSeries);
      viewport?.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); previousSeries(); }
        if (event.key === 'ArrowRight') { event.preventDefault(); nextSeries(); }
      });

      viewport?.addEventListener('pointerdown', event => {
        if (event.button !== 0 || event.target.closest('button')) return;
        drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, startTime: performance.now(), horizontal: false };
        viewport.setPointerCapture(event.pointerId);
      });
      viewport?.addEventListener('pointermove', event => {
        if (!drag || drag.id !== event.pointerId) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          drag.horizontal = true;
          viewport.classList.add('is-dragging');
        }
        if (!drag.horizontal) return;
        event.preventDefault();
        drag.lastX = event.clientX;
        let translated = dx;
        if ((activeSeries === 0 && dx > 0) || (activeSeries === SERIES_DATA.length - 1 && dx < 0)) translated *= .32;
        updateTrack(translated);
      });
      const finishDrag = event => {
        if (!drag || drag.id !== event.pointerId) return;
        const dx = event.clientX - drag.startX;
        const elapsed = Math.max(1, performance.now() - drag.startTime);
        const velocity = dx / elapsed;
        const threshold = Math.min(120, (viewport.clientWidth || 600) * .18);
        viewport.classList.remove('is-dragging');
        if (drag.horizontal && (Math.abs(dx) > threshold || Math.abs(velocity) > .55)) {
          dx < 0 ? nextSeries() : previousSeries();
        } else {
          updateTrack();
        }
        drag = null;
      };
      viewport?.addEventListener('pointerup', finishDrag);
      viewport?.addEventListener('pointercancel', finishDrag);
      window.addEventListener('resize', () => updateTrack(0, true));

      let embedTimer;
      let currentFrame=null;
      window.addEventListener('message',event=>{
        if(!currentFrame||event.origin!=='https://affinitiplus.substack.com'||event.source!==currentFrame.contentWindow)return;
        const value=event.data&&event.data.iframeHeight;
        if(typeof value!=='number' && !(typeof value==='string' && /^\d+(?:\.\d+)?$/.test(value)))return;
        const h=Number(value);if(!Number.isFinite(h)||h<100||h>10000)return;
        currentFrame.height=String(Math.ceil(h));modalEmbedStatus.hidden=true;clearTimeout(embedTimer);
      });
      const renderSubstackEmbed=post=>{
        clearTimeout(embedTimer);
        const frame=document.createElement('iframe');
        frame.title='Substack article: '+post.title;frame.height='470';frame.scrolling='no';
        frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-popups');
        frame.setAttribute('allow','clipboard-write');frame.referrerPolicy='strict-origin-when-cross-origin';
        const url=new URL(post.url);const embed=new URL('/embed'+url.pathname,url.origin);
        embed.searchParams.set('origin',location.origin);embed.searchParams.set('fullURL',location.origin+location.pathname);
        frame.src=embed.href;currentFrame=frame;modalEmbedStatus.hidden=false;
        modalEmbedStatus.textContent='Loading Substack embed…';modalEmbedHost.replaceChildren(frame);
        embedTimer=setTimeout(()=>{if(currentFrame===frame)modalEmbedStatus.textContent='If the embed is unavailable, use Read on Substack below.';},12000);
      };

      const renderModalTimeline = series => {
        modalTimeline.innerHTML = series.posts.map((post, index) => `
          <button class="nl-post-modal__timeline-item${index === activePost ? ' is-active' : ''}" type="button" data-modal-post-index="${index}">
            <span>${String(index + 1).padStart(2, '0')}</span>
            <strong>${escapeHTML(post.title)}</strong>
          </button>`).join('');
        modalTimeline.querySelectorAll('[data-modal-post-index]').forEach(button => {
          button.addEventListener('click', () => openPost(activeSeries, Number(button.dataset.modalPostIndex), true));
        });
      };

      const openPost = (seriesIndex, postIndex, keepOpen = false) => {
        const series = SERIES_DATA[seriesIndex];
        if (!series.posts.length) return;
        if (!keepOpen) returnFocus = document.activeElement;
        activeSeries = seriesIndex;
        activePost = (postIndex + series.posts.length) % series.posts.length;
        updateTrack();
        updateSeriesUI();
        const post = series.posts[activePost];
        modal.style.setProperty('--modal-a', series.colours.a);
        modal.style.setProperty('--modal-b', series.colours.b);
        modal.style.setProperty('--modal-accent', series.colours.accent);
        modalSeriesName.textContent = series.name;
        modalPosition.textContent = `Post ${activePost + 1} of ${series.posts.length}`;
        modalTitle.textContent = post.title;
        modalSummary.textContent = post.summary;
        modalRead.href = post.url;
        modalComments.href = `${post.url}#comments`;
        renderModalTimeline(series);
        renderSubstackEmbed(post);
        root.inert=true;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('nl-modal-open');
        document.body.classList.add('is-modal-locked');
        if (!keepOpen) modal.querySelector('[data-modal-close]')?.focus();
      };
      const closeModal = () => {
        clearTimeout(embedTimer);
        modalEmbedHost.replaceChildren();
        currentFrame=null;
        root.inert=false;
        returnFocus?.focus();
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('nl-modal-open');
        document.body.classList.remove('is-modal-locked');
      };
      document.querySelectorAll('[data-modal-close]').forEach(button => button.addEventListener('click', closeModal));
      modalPrev?.addEventListener('click', () => openPost(activeSeries, activePost - 1, true));
      modalNext?.addEventListener('click', () => openPost(activeSeries, activePost + 1, true));
      document.addEventListener('keydown', event => {
        if (!modal.classList.contains('is-open')) return;
        if (event.key === 'Escape') closeModal();
        if(event.key==='Tab'){
          const focusable=Array.from(modal.querySelectorAll('button,a[href],iframe')).filter(e=>!e.disabled&&e.getClientRects().length);
          const first=focusable[0],last=focusable[focusable.length-1];
          if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
          else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        }
        if (event.key === 'ArrowLeft') openPost(activeSeries, activePost - 1, true);
        if (event.key === 'ArrowRight') openPost(activeSeries, activePost + 1, true);
      });

      const sort=section.querySelector('[data-post-sort]');
      sort.addEventListener('change',()=>{
        SERIES_DATA.forEach(s=>s.posts.sort((a,b)=>(sort.value==='oldest'?1:-1)*(a.time-b.time)||a.id-b.id));
        buildPanels();setSeries(activeSeries,true);
      });
      buildPanels();
      setSeries(0, true);
    
}catch(e){status.textContent='The newsletter collection is unavailable. Please use the Substack link below.';}
finally{clearTimeout(deadline);}
})();
