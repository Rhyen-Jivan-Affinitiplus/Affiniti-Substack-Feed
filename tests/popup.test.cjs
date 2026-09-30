const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('preview/popup/block.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(js);
const funcs=js.slice(js.indexOf(' function imageURL'),js.indexOf(' function date'));
const sandbox={URL,Set,Date};vm.createContext(sandbox);vm.runInContext(funcs,sandbox);
const valid={schema_version:1,mode:'display_preview',ready:true,
tags:[{id:'a',name:'Series',slug:'series'}],
articles:[{id:1,title:'<img src=x>',subtitle:'Text',authors:['Author'],published_at:'2026-09-30T09:00:00Z',canonical_url:'https://affinitiplus.substack.com/p/test',tag_ids:['a']}]};
assert.equal(sandbox.validate(valid),valid);
for(const change of [
f=>f.articles[0].canonical_url='javascript:alert(1)',
f=>f.articles[0].published_at='yesterday',
f=>f.articles[0].tag_ids=['missing'],
f=>f.articles.push({...f.articles[0]}),
f=>f.tags.push({...f.tags[0]}),
f=>f.articles[0].authors=[]
]){const f=structuredClone(valid);change(f);assert.throws(()=>sandbox.validate(f));}
assert.equal(sandbox.imageURL('https://substackcdn.com/image/example.jpg'),'https://substackcdn.com/image/example.jpg');
for(const url of ['http://substackcdn.com/a','https://substackcdn.com.evil.test/a','https://user:pass@substackcdn.com/a','javascript:alert(1)','https://127.0.0.1/a'])assert.equal(sandbox.imageURL(url),null);
assert(!/<script[^>]+src=/.test(html));assert(!/<link[^>]+stylesheet/.test(html));
assert(!js.includes('innerHTML'));
assert(js.includes('dialog.showModal()')&&js.includes('opener.focus()'));
assert(!/iframe|embedjs|function official/.test(html));
assert(js.includes('old.replaceWith(img)'));assert(js.includes("title.classList.remove('nlp-sr')"));
assert(js.includes('clearMedia();document.documentElement.style.overflow=savedOverflow'));
assert(html.includes('prefers-reduced-motion:reduce'));
console.log('Popup: source syntax, feed rejection cases, image allowlist, inline assets, text-only insertion, modal, native images and no-iframe checks passed.');
