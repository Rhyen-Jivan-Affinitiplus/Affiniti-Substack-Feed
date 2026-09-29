"""Derive native preview v2 from the preserved, working iframe test v1."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
folder = root / 'preview/newsletter'
js = (folder / 'loader.js').read_text()
js = js.replace("newsletter/template.html?v=1", "newsletter/template-v2.html")
js = js.replace("newsletter-v1", "newsletter-native-v2")
js = js.replace("time:Date.parse(p.published_at)", "time:Date.parse(p.published_at),published_at:p.published_at,authors:p.authors.slice(),tags:feed.tags.filter(t=>p.tag_ids.includes(t.id)).map(t=>t.name)")
js = js.replace("      const modalEmbedHost = document.querySelector('[data-modal-embed-host]');\n      const modalEmbedStatus = document.querySelector('[data-modal-embed-status]');", """      const modalAuthors=modal.querySelector('[data-modal-authors]');
      const modalDate=modal.querySelector('[data-modal-date]');
      const modalTags=modal.querySelector('[data-modal-tags]');""")
start = js.index('      let embedTimer;')
end = js.index('      const renderModalTimeline', start)
js = js[:start] + """      function renderArticlePreview(post) {
        modalAuthors.textContent=post.authors.join(', ');
        modalDate.dateTime=post.published_at;
        modalDate.textContent=new Intl.DateTimeFormat('en-GB',{
          day:'numeric',month:'long',year:'numeric',timeZone:'Europe/London'
        }).format(new Date(post.time));
        modalTags.replaceChildren();
        post.tags.forEach(name=>{
          const tag=document.createElement('li');tag.textContent=name;modalTags.appendChild(tag);
        });
        modalSummary.hidden=!post.summary.trim();
      }

""" + js[end:]
js = js.replace('renderSubstackEmbed(post);', 'renderArticlePreview(post);')
js = js.replace('        clearTimeout(embedTimer);\n        modalEmbedHost.replaceChildren();\n        currentFrame=null;\n', '')
js = js.replace("querySelectorAll('button,a[href],iframe')", "querySelectorAll('button,a[href]')")
js = js.replace('        modalRead.href = post.url;', "        modalRead.href = post.url;\n        modalRead.setAttribute('aria-label','Read '+post.title+' on Substack (opens in a new tab)');")
(folder / 'loader-v2.js').write_text(js)
html = (folder / 'template.html').read_text()
html = html.replace('class="nl-post-modal" data-post-modal', 'class="nl-post-modal nl-native-preview" data-post-modal')
html = html.replace('>Selected article</span>', '>Article preview</span>\n<div class="nl-native-byline"><span data-modal-authors></span><time data-modal-date></time></div>')
start = html.index('<div class="nl-post-modal__embed-frame">')
end = html.index('<div class="nl-post-modal__actions">', start)
html = html[:start] + '<ul class="nl-native-tags" data-modal-tags aria-label="Article series"></ul>\n' + html[end:]
html += """<style id="nl-native-preview-v2">
.nl-native-preview .nl-native-byline{
  display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:18px;
  color:var(--nl-body-dark);font-family:"Proxima Nova",Arial,Helvetica,sans-serif;
  font-size:.9rem;line-height:1.6
}
.nl-native-preview .nl-native-tags{
  display:flex;flex-wrap:wrap;gap:8px;list-style:none;
  margin:24px 0 0;padding:0;font-family:"Proxima Nova",Arial,Helvetica,sans-serif
}
.nl-native-preview .nl-native-tags li{
  border:1px solid var(--nl-line-dark);border-radius:999px;
  padding:7px 12px;font-size:.8rem;line-height:1.4;color:var(--nl-cocoa)
}
.nl-native-preview .nl-post-modal__actions{
  margin-top:28px;padding-top:24px;border-top:1px solid var(--nl-line-dark)
}
.nl-native-preview .nl-post-modal__reader-head [hidden]{display:none!important}
.nl-native-preview .nl-post-modal__reader-head{overflow-wrap:anywhere}
[data-affiniti-newsletter] > p{color:#fff8ef}
[data-affiniti-newsletter] > p a{color:inherit}
</style>
"""
(folder / 'template-v2.html').write_text(html)
block=(folder / 'squarespace-block.html').read_text().replace('newsletter/loader.js?v=1','newsletter/loader-v2.js')
(folder / 'squarespace-block-v2.html').write_text(block)
(folder / 'native.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Native newsletter preview</title><body style="margin:0;background:#4a2824">'+block+'</body></html>')
