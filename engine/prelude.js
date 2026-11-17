var KEY=CONFIG.key;
document.title=CONFIG.title;
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};

var Q=[],cnt={};
function add(z,q){cnt[z]=(cnt[z]||0)+1;q.z=z;q.id=z+cnt[z];q.topic=q.topic||(TOPICS[z]||[])[cnt[z]-1]||"Other";Q.push(q)}
function M(z,q,opts,a,deep,x){add(z,Object.assign({t:"mcq",q:q,o:opts.map(function(p){return p[0]}),w:opts.map(function(p){return p[1]}),a:a,e:deep},x||{}))}
function R(p,k){return {p:p,k:k.split("|")}}
function T(z,t,q,rub,model,x){add(z,Object.assign({t:t,q:q,rub:rub,model:model},x||{}))}
var FIGS={};

/* ===== diagrams ===== */
function svgW(w,h,label,inner){return '<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(label)+'" xmlns="http://www.w3.org/2000/svg"><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>'+inner+'</svg>'}
function tx(x,y,s,o){o=o||{};return '<text x="'+x+'" y="'+y+'" font-size="'+(o.size||12)+'" font-weight="'+(o.w||500)+'" text-anchor="'+(o.a||"middle")+'" fill="'+(o.fill||"var(--ink)")+'" font-family="Hanken Grotesk, -apple-system, sans-serif"'+(o.it?' font-style="italic"':'')+'>'+esc(s)+'</text>'}
function lines(x,y,arr,o,lh){lh=lh||15;return arr.map(function(s,i){return tx(x,y+i*lh,s,i===0&&o&&o.first?Object.assign({},o,o.first):o)}).join("")}
function box(x,y,w,h,o){o=o||{};return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(o.r==null?8:o.r)+'" fill="'+(o.fill||"var(--surface)")+'" stroke="'+(o.stroke||"var(--line)")+'" stroke-width="'+(o.sw||1.5)+'"/>'}
function ln(x1,y1,x2,y2,arrow,dash){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="var(--muted)" stroke-width="1.6"'+(dash?' stroke-dasharray="4 4"':'')+(arrow?' marker-end="url(#ah)"':'')+'/>'}
function person(x,y,c){c=c||"var(--ink)";return '<g stroke="'+c+'" stroke-width="2" stroke-linecap="round" fill="none"><circle cx="'+x+'" cy="'+(y-18)+'" r="5" fill="'+c+'"/><path d="M'+x+' '+(y-13)+'V'+(y+4)+'M'+(x-7)+' '+(y-8)+'H'+(x+7)+'M'+x+' '+(y+4)+'L'+(x-5)+' '+(y+14)+'M'+x+' '+(y+4)+'L'+(x+5)+' '+(y+14)+'"/></g>'}


var LEARN=[];
function L(sec,id,title,o){LEARN.push(Object.assign({sec:sec,id:id,t:title},o))}

