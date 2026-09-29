const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../preview/loader.js','utf8');
async function run(feed,ok=true){
 class Node {constructor(tag){this.tag=tag;this.children=[];this.dataset={};}appendChild(n){n.parentNode=this;this.children.push(n);return n;}setAttribute(k,v){this[k]=v;}querySelector(){return this.children.find(n=>n.role==='status');}}
 const root=new Node('div'),status=new Node('p'),head=new Node('head');status.role='status';root.appendChild(status);root.dataset.feed='./feed.json';
 const ctx={document:{baseURI:'https://example.invalid/preview/',head,querySelector:s=>s.startsWith('[data-')?root:null,createElement:t=>new Node(t)},AbortController,URL,Set,Error,JSON,setTimeout,clearTimeout,fetch:async()=>({ok,headers:{get:()=> 'application/json'},text:async()=>JSON.stringify(feed)})};
 vm.runInNewContext(source,ctx);for(let i=0;i<10;i++)await new Promise(resolve=>setImmediate(resolve));return {root,status,head};
}
(async()=>{
 let r=await run({schema_version:1,mode:'display_preview',ready:false,tags:[],articles:[]});assert.match(r.status.textContent,/No collected/);assert.equal(r.head.children.length,0);
 const feed={schema_version:1,mode:'display_preview',ready:true,tags:[{id:'a',name:'Series',slug:'series'}],articles:[{id:1,canonical_url:'https://affinitiplus.substack.com/p/test',title:'<script>bad</script>',subtitle:'text',authors:['Author'],tag_ids:['a']}]};
 r=await run(feed);assert.equal(r.head.children.length,1);assert.equal(r.head.children[0].src,'https://substack.com/embedjs/embed.js');const card=r.root.children[1].children[0].children[0];assert.equal(card.children[0].textContent,'<script>bad</script> by Author');assert.equal(card.children[2].href,feed.articles[0].canonical_url);
 feed.articles[0].canonical_url='javascript:bad';r=await run(feed);assert.match(r.status.textContent,/could not be loaded/);assert.equal(r.head.children.length,0);
 r=await run({},false);assert.match(r.status.textContent,/could not be loaded/);console.log('4 loader checks passed; no network or official embed script executed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
