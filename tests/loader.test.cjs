const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../preview/loader.js','utf8');
async function run(feed,ok=true){
 class Node {constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.isConnected=true;if(tag==='iframe')this.contentWindow={};}appendChild(n){n.parentNode=this;this.children.push(n);return n;}setAttribute(k,v){this[k]=v;}querySelector(){return this.children.find(n=>n.role==='status');}}
 const root=new Node('div'),status=new Node('p'),head=new Node('head'),listeners={};status.role='status';root.appendChild(status);root.dataset.feed='./feed.json';
 const ctx={window:{location:{origin:'https://example.invalid',pathname:'/preview/',search:'?private=secret',hash:'#private'},addEventListener:(k,f)=>listeners[k]=f,removeEventListener:k=>delete listeners[k]},document:{baseURI:'https://example.invalid/preview/',head,querySelector:s=>s.startsWith('[data-')?root:null,createElement:t=>new Node(t)},AbortController,URL,Set,Error,JSON,setTimeout,clearTimeout,fetch:async()=>({ok,headers:{get:()=> 'application/json'},text:async()=>JSON.stringify(feed)})};
 vm.runInNewContext(source,ctx);for(let i=0;i<10;i++)await new Promise(resolve=>setImmediate(resolve));return {root,status,head,listeners};
}
(async()=>{
 const regex=/(?<url>.*)\/p\/(?<slug>.*)/g;
 const paths=['one','two','three','four','five','six'].map(s=>'https://affinitiplus.substack.com/p/'+s);
 assert.deepEqual(paths.map(p=>!!regex.exec(p)),[true,false,true,false,true,false]);
 let r=await run({schema_version:1,mode:'display_preview',ready:false,tags:[],articles:[]});assert.match(r.status.textContent,/No collected/);assert.equal(r.head.children.length,0);
 const feed={schema_version:1,mode:'display_preview',ready:true,tags:[{id:'a',name:'Series',slug:'series'}],articles:paths.map((url,i)=>({id:i+1,canonical_url:url,title:'<script>bad</script>',subtitle:'text',authors:['Author'],tag_ids:['a']}))};
 r=await run(feed);assert.equal(r.head.children.length,0);const grid=r.root.children.find(n=>n.className==='affiniti-embed-test-grid');assert.equal(grid.children.length,6);
 grid.children.forEach((cell,i)=>{const frame=cell.children[0],fallback=cell.children[1];const url=new URL(frame.src);assert.equal(url.pathname,'/embed/p/'+paths[i].split('/').pop());assert.equal(url.searchParams.get('fullURL'),'https://example.invalid/preview/');assert.equal(frame.title,'Substack article: <script>bad</script>');assert.equal(fallback.children[0].textContent,'<script>bad</script> by Author');});
 const frame=grid.children[0].children[0],fallback=grid.children[0].children[1],origin='https://affinitiplus.substack.com';
 r.listeners.message({origin:'https://evil.invalid',source:frame.contentWindow,data:{iframeHeight:800}});assert.equal(frame.height,'470');
 r.listeners.message({origin,source:{},data:{iframeHeight:800}});assert.equal(frame.height,'470');
 for(const h of [null,{},'800px',-1,Infinity,10001,''])r.listeners.message({origin,source:frame.contentWindow,data:{iframeHeight:h}});assert.equal(frame.height,'470');
 r.listeners.message({origin,source:frame.contentWindow,data:{iframeHeight:'800.2'}});assert.equal(frame.height,'801');assert.equal(fallback.hidden,true);assert.match(r.status.textContent,/1\/6/);
 for(const cell of grid.children)r.listeners.message({origin,source:cell.children[0].contentWindow,data:{iframeHeight:700}});assert.match(r.status.textContent,/6\/6/);
 r.root.isConnected=false;r.listeners.message({});assert.equal(r.listeners.message,undefined);
 feed.articles[0].canonical_url='javascript:bad';r=await run(feed);assert.match(r.status.textContent,/could not be loaded/);assert.equal(r.head.children.length,0);
 r=await run({},false);assert.match(r.status.textContent,/could not be loaded/);
 console.log('Passed: alternating RegExp reproduction, six unique frames, no embed.js, escaped DOM text, URL privacy, origin/source/height guards, six acknowledgments, cleanup, invalid URL and fetch failure. No network.');
})().catch(e=>{console.error(e);process.exitCode=1;});
