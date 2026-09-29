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
      var grid=document.createElement('div');grid.className='affiniti-embed-test-grid';
      feed.articles.slice(0,6).forEach(function(p){
        var cell=document.createElement('div'),card=document.createElement('div');card.className='substack-post-embed';
        var title=text('p',p.title+' by '+p.authors.join(', '));title.lang='en-gb';card.appendChild(title);
        if(p.subtitle)card.appendChild(text('p',p.subtitle));
        var link=text('a','Read on Substack');link.setAttribute('data-post-link','');link.href=p.canonical_url;card.appendChild(link);
        cell.appendChild(card);grid.appendChild(cell);
      });root.appendChild(grid);
      status.textContent='Loaded '+feed.articles.length+' articles and '+feed.tags.length+' tags; showing '+Math.min(6,feed.articles.length)+'. Loading Substack rendering…';
      if(document.querySelector('script[src="https://substack.com/embedjs/embed.js"]')){
        status.textContent+=' Substack script already exists: inspect rendering or use the isolated hosted preview.';return;
      }
      var script=document.createElement('script');script.src='https://substack.com/embedjs/embed.js';script.async=true;script.charset='utf-8';
      script.onload=function(){status.textContent='Feed loaded and Substack script loaded. Check card rendering visually; collection coverage remains incomplete.';};
      script.onerror=function(){status.textContent='Feed loaded; Substack rendering unavailable. Article links remain usable.';};
      document.head.appendChild(script);
    }).catch(function(){status.textContent='The preview feed could not be loaded. Check Pages deployment, feed publication and browser network diagnostics.';})
    .finally(function(){clearTimeout(timer);});
})();
