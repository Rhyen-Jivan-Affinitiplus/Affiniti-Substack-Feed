(function () {
  'use strict';
  var root=document.querySelector('[data-affiniti-embed-preview]');
  if(!root||root.dataset.started)return;
  root.dataset.started='true';
  var status=root.querySelector('[role="status"]')||document.createElement('p');
  status.setAttribute('role','status');if(!status.parentNode)root.appendChild(status);
  var abort=new AbortController(),timer=setTimeout(function(){abort.abort();},15000);
  function text(tag,value){var e=document.createElement(tag);e.textContent=value;return e;}
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
  fetch(new URL(root.dataset.feed,document.baseURI),{credentials:'omit',signal:abort.signal,cache:'no-cache'})
    .then(function(r){if(!r.ok)throw Error('fetch_failed');var mime=r.headers.get('content-type')||'';if(!/application\/json/i.test(mime))throw Error('not_json');return r.text();})
    .then(function(body){if(body.length>500000)throw Error('feed_too_large');return validate(JSON.parse(body));})
    .then(function(feed){
      if(!feed.ready){status.textContent='Hosting is ready. No collected articles have been published yet.';return;}
      // Source-confirmed 2026-09-29: embed.js reuses a global RegExp.exec across
      // URLs, skipping alternating cards. Use its iframe URL protocol directly.
      root.dataset.renderer='direct-iframe-v2';
      var style=document.createElement('style');
      style.textContent='[data-affiniti-embed-preview] .affiniti-embed-test-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:24px;align-items:start}[data-affiniti-embed-preview] .affiniti-embed-test-grid>div{min-width:0;width:100%;max-width:500px}[data-affiniti-embed-preview] iframe{display:block;width:100%;border:0}';
      root.appendChild(style);
      var grid=document.createElement('div');grid.className='affiniti-embed-test-grid';
      var entries=[],selected=feed.articles.slice(0,6);
      function report(){
        var confirmed=entries.filter(function(e){return e.confirmed;}).length;
        status.textContent='Renderer v2: '+entries.length+' embed frames created from '+feed.articles.length+
          ' articles / '+feed.tags.length+' tags; '+confirmed+'/'+entries.length+
          ' frames reported content height. Check visual rendering; collection coverage remains incomplete.';
      }
      function onMessage(event){
        if(!root.isConnected){window.removeEventListener('message',onMessage);return;}
        entries.forEach(function(entry){
          if(event.origin!==entry.origin||event.source!==entry.frame.contentWindow)return;
          var value=event.data&&event.data.iframeHeight;
          if(typeof value!=='number'&&typeof value!=='string')return;
          if(typeof value==='string'&&!/^\d+(?:\.\d+)?$/.test(value))return;
          var height=Number(value);
          if(!Number.isFinite(height)||height<100||height>10000)return;
          entry.frame.height=String(Math.ceil(height));
          entry.fallback.hidden=true;entry.confirmed=true;report();
        });
      }
      window.addEventListener('message',onMessage);
      selected.forEach(function(p){
        var cell=document.createElement('div'),fallback=document.createElement('div');
        var title=text('p',p.title+' by '+p.authors.join(', '));title.lang='en-gb';fallback.appendChild(title);
        if(p.subtitle)fallback.appendChild(text('p',p.subtitle));
        var link=text('a','Read on Substack');link.href=p.canonical_url;fallback.appendChild(link);
        var postURL=new URL(p.canonical_url),frameURL=new URL('/embed'+postURL.pathname,postURL.origin);
        frameURL.searchParams.set('origin',window.location.origin);
        // Keep host-page query parameters and fragments out of third-party URLs.
        frameURL.searchParams.set('fullURL',window.location.origin+window.location.pathname);
        var frame=document.createElement('iframe');
        frame.title='Substack article: '+p.title;frame.height='470';frame.scrolling='no';
        frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-popups');
        frame.setAttribute('allow','clipboard-write');
        frame.referrerPolicy='strict-origin-when-cross-origin';
        entries.push({frame:frame,origin:postURL.origin,fallback:fallback,confirmed:false});
        frame.src=frameURL.toString();cell.appendChild(frame);cell.appendChild(fallback);grid.appendChild(cell);
      });
      root.appendChild(grid);report();
    }).catch(function(){status.textContent='The preview feed could not be loaded. Check Pages deployment, feed publication and browser network diagnostics.';})
    .finally(function(){clearTimeout(timer);});
})();
