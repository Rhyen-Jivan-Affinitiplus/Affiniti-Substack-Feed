const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('preview/newsletter/loader-v2.js','utf8');
const html=fs.readFileSync('preview/newsletter/template-v2.html','utf8');
const validate=js.slice(js.indexOf('  function validate'),js.indexOf('async function get'));
const transform=js.slice(js.indexOf(' const descriptions='),js.indexOf(' if(!SERIES_DATA.length)'));
const render=js.slice(js.indexOf('      function renderArticlePreview'),js.indexOf('      const renderModalTimeline'));
const feed={schema_version:1,mode:'display_preview',ready:true,tags:[
 {id:'a',name:'First',slug:'first'},{id:'b',name:'<img src=x onerror=alert(1)>',slug:'second'},{id:'c',name:'Empty',slug:'empty'}
],articles:[{id:1,title:'Title',subtitle:'Summary',authors:['Author A','Author B'],canonical_url:'https://affinitiplus.substack.com/p/test-post',published_at:'2026-09-29T10:00:00Z',tag_ids:['a','b']}]};
const groups=JSON.parse(vm.runInNewContext(validate+'\nvalidate(feed);\n'+transform+'\nJSON.stringify(SERIES_DATA)',{feed,Set,Date}));
assert.equal(groups.length,2);
const post=groups[0].posts[0],authors={},date={},summary={},tags={children:[],replaceChildren(){this.children=[];},appendChild(e){this.children.push(e);}};
const context={modalAuthors:authors,modalDate:date,modalSummary:summary,modalTags:tags,
 document:{createElement(tag){assert.equal(tag,'li');return {};}},
 Intl,Date,post};
vm.runInNewContext(render+'\nrenderArticlePreview(post);',context);
assert.equal(authors.textContent,'Author A, Author B');
assert.equal(date.textContent,'29 September 2026');assert.equal(date.dateTime,post.published_at);
assert.equal(tags.children.length,2);assert.equal(tags.children[1].textContent,feed.tags[1].name);
assert.equal(summary.hidden,false);
post.summary='  ';post.tags=['Replacement'];
vm.runInNewContext('renderArticlePreview(post);',context);
assert.equal(summary.hidden,true);assert.equal(tags.children.length,1);
assert(!js.includes("createElement('iframe')"));assert(!js.includes("addEventListener('message'"));
assert(!html.includes('data-modal-embed-host'));assert(!html.includes('Loading Substack embed'));
assert(html.includes('data-modal-authors')&&html.includes('data-modal-date'));
feed.articles[0].canonical_url='javascript:alert(1)';
assert.throws(()=>vm.runInNewContext(validate+'\nvalidate(feed)',{feed,Set}));
console.log('Native preview: byline/date, tag assignment, literal unsafe text, empty subtitle, replacement, URL validation and iframe removal passed.');
