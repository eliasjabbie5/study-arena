FIGS.pyramid={title:"Carroll's CSR pyramid",cap:"Economic and legal are core, ethical is expected, philanthropic is desired.",svg:function(o){
  o=o||{};var cx=105,names=[["Philanthropic","Desired"],["Ethical","Expected"],["Legal","Required (core)"],["Economic","Required (core), the foundation"]];
  var w=function(y){return 30+170*(y-10)/230},out="";
  for(var i=0;i<4;i++){var t=10+i*58,b=t+56,wt=w(t),wb=w(b),fromBase=4-i,on=o.hl===fromBase;
    out+='<polygon points="'+(cx-wt/2)+','+t+' '+(cx+wt/2)+','+t+' '+(cx+wb/2)+','+b+' '+(cx-wb/2)+','+b+'" fill="'+(on?"var(--accent)":"var(--accent-soft)")+'" stroke="var(--accent)" stroke-width="1.5"/>';
    out+=tx(cx,t+34,String(fromBase),{size:15,w:700,fill:on?"var(--accent-ink)":"var(--accent)"});
    if(!o.mask){out+=ln(cx+(wt+wb)/4+4,t+28,222,t+28)+tx(230,t+25,names[i][0],{a:"start",size:14,w:700})+tx(230,t+43,names[i][1],{a:"start",size:11,fill:"var(--muted)"})}
  }
  if(o.mask)out+=tx(300,125,"Layers numbered",{size:12,fill:"var(--muted)"})+tx(300,142,"from the base",{size:12,fill:"var(--muted)"});
  return svgW(420,250,"Carroll's pyramid with four layers",out)}};

FIGS.grid={title:"Stakeholder power/interest grid",cap:"Top right means high power and high interest: manage closely.",svg:function(o){
  o=o||{};var out="",q=[["A","Keep satisfied",0,0],["B","Manage closely",1,0],["C","Monitor",0,1],["D","Keep informed",1,1]];
  q.forEach(function(r){var x=50+r[2]*175,y=14+r[3]*100,on=!o.mask&&r[0]==="B";
    out+=box(x,y,175,100,{r:0,fill:on?"var(--accent)":"var(--accent-soft)",stroke:"var(--line)"});
    out+=tx(x+87,y+(o.mask?62:46),r[0],{size:o.mask?30:16,w:800,fill:on?"var(--accent-ink)":"var(--accent)"});
    if(!o.mask)out+=tx(x+87,y+68,r[1],{size:13,w:600,fill:on?"var(--accent-ink)":"var(--ink)"})});
  out+=ln(50,222,405,222,true)+ln(44,214,44,10,true)+tx(228,246,"Interest in the firm's decisions",{size:12,fill:"var(--muted)"});
  out+='<text transform="translate(16,114) rotate(-90)" font-size="12" text-anchor="middle" fill="var(--muted)" font-family="IBM Plex Sans, Segoe UI, sans-serif">Power to affect the firm</text>';
  out+=tx(58,238,"low",{size:10,a:"start",fill:"var(--muted)"})+tx(398,238,"high",{size:10,a:"end",fill:"var(--muted)"});
  return svgW(420,254,"Two by two grid of stakeholder power and interest",out)}};

FIGS.rest={title:"Rest's four stages of ethical decision making",cap:"Normative theories help at stage 2. Many failures happen at stage 3, when other goals outrank ethics.",svg:function(o){
  o=o||{};var st=[["Recognize the moral issue","Selective attention and ethical fading can hide it"],["Make a moral judgment","Normative theories are used here"],["Establish moral intent","Ethics must outrank other goals"],["Engage in moral behavior","Act on the intent despite pressure"]],out="";
  st.forEach(function(s,i){var y=6+i*62,on=o.hl===i;
    out+=box(10,y,400,48,{fill:on?"var(--accent)":"var(--surface)",stroke:on?"var(--accent)":"var(--line)"});
    out+=tx(34,y+30,String(i+1),{size:20,w:800,fill:on?"var(--accent-ink)":"var(--accent)"});
    if(!o.mask)out+=tx(58,y+21,s[0],{a:"start",size:14,w:700,fill:on?"var(--accent-ink)":"var(--ink)"})+tx(58,y+38,s[1],{a:"start",size:11,fill:on?"var(--accent-ink)":"var(--muted)"});
    else out+=tx(58,y+29,"Stage "+(i+1),{a:"start",size:14,w:600,fill:on?"var(--accent-ink)":"var(--muted)"});
    if(i<3)out+=ln(210,y+48,210,y+62,true)});
  return svgW(420,254,"Four stage flow from recognition to behavior",out)}};

FIGS.tree={title:"How the three normative theories fit together",cap:"Utilitarianism judges outcomes. Deontology and virtue ethics look at motives and principles.",svg:function(){
  var out=box(135,6,150,32,{fill:"var(--accent)",stroke:"var(--accent)"})+tx(210,27,"Ethical theories",{size:13,w:700,fill:"var(--accent-ink)"});
  out+=ln(210,38,105,70)+ln(210,38,315,70);
  out+=box(10,70,190,48)+tx(105,91,"Consequentialist",{size:13,w:700})+tx(105,108,"judges the outcome",{size:11,fill:"var(--muted)"});
  out+=box(220,70,190,48)+tx(315,91,"Non-consequentialist",{size:13,w:700})+tx(315,108,"judges motives and principles",{size:11,fill:"var(--muted)"});
  out+=ln(105,118,105,148)+ln(315,118,262,148)+ln(315,118,368,148);
  out+=box(10,148,190,92,{fill:"var(--accent-soft)",stroke:"var(--accent)"})+lines(105,172,["Utilitarianism","Bentham (act) · Mill (rule)","greatest good, greatest number","tends to absolutism"],{size:11,fill:"var(--muted)",first:{size:14,w:700,fill:"var(--ink)"}},17);
  out+=box(212,148,100,92,{fill:"var(--accent-soft)",stroke:"var(--accent)"})+lines(262,172,["Deontology","Kant","duty, universal law","tends to absolutism"],{size:11,fill:"var(--muted)",first:{size:13,w:700,fill:"var(--ink)"}},17);
  out+=box(318,148,96,92,{fill:"var(--warn-soft)",stroke:"var(--warn)"})+lines(366,172,["Virtue ethics","Aristotle","character, habit","tends to relativism"],{size:11,fill:"var(--muted)",first:{size:13,w:700,fill:"var(--ink)"}},17);
  return svgW(420,250,"Tree of normative ethical theories",out)}};

FIGS.tests={title:"The three ethical tests",cap:"Each test echoes one normative theory. Use all three on a hard decision.",svg:function(){
  var rows=[["Rights test",["Whose rights are enabled","or violated by this decision?"],"Deontology"],["Outcomes test",["Who gains value, and who","may be harmed?"],"Utilitarianism"],["Integrity test",["What kind of person or","organization do we become?"],"Virtue ethics"]],out="";
  rows.forEach(function(r,i){var y=8+i*70;
    out+=box(6,y,108,56,{fill:"var(--accent)",stroke:"var(--accent)"})+tx(60,y+34,r[0],{size:13,w:700,fill:"var(--accent-ink)"});
    out+=lines(124,y+25,r[1],{a:"start",size:12},16)+ln(318,y+28,330,y+28,true);
    out+=box(332,y+10,82,36,{fill:"var(--accent-soft)",stroke:"var(--accent)"})+tx(373,y+33,r[2],{size:11,w:600})});
  return svgW(420,224,"Three ethical tests mapped to theories",out)}};

FIGS.wicks={title:"Wicks et al.: three levels of ethics and strategy",cap:"Ethics is not a separate add-on. Firms must manage all three levels (eBay and Cranium are the chapter's examples).",svg:function(){
  var out=box(5,5,410,250,{fill:"var(--surface)",stroke:"var(--accent)",r:16})+tx(18,26,"Level 3 · Respect for societal standards of conduct",{a:"start",size:12,w:700});
  out+=box(28,40,364,205,{fill:"var(--accent-soft)",stroke:"var(--accent)",r:14})+tx(42,61,"Level 2 · Principles for stakeholder cooperation",{a:"start",size:12,w:700});
  out+=box(52,76,316,158,{fill:"var(--accent)",stroke:"var(--accent)",r:12})+tx(210,130,"Level 1",{size:12,fill:"var(--accent-ink)"})+tx(210,152,"Value proposition",{size:18,w:800,fill:"var(--accent-ink)"})+tx(210,178,"what the firm offers, and to whom",{size:11,fill:"var(--accent-ink)"});
  return svgW(420,260,"Nested circles of three levels",out)}};

FIGS.locus={title:"Locus of control",cap:"Internal people own outcomes and question authority. External people follow orders and peers.",svg:function(){
  var out='<defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--warn)"/></linearGradient></defs>';
  out+='<rect x="20" y="104" width="380" height="16" rx="8" fill="url(#lg)"/>'+tx(20,92,"Internal",{a:"start",size:15,w:800})+tx(400,92,"External",{a:"end",size:15,w:800});
  out+=lines(20,146,["Owns its outcomes","Questions authority","More likely to help others"],{a:"start",size:12},18)+lines(400,146,["Luck, fate, powerful others","Follows orders and rules","Swayed by peer pressure"],{a:"end",size:12},18);
  out+=tx(210,40,"How much do I control what happens to me?",{size:13,fill:"var(--muted)"});
  return svgW(420,215,"Spectrum from internal to external locus of control",out)}};

FIGS.orient={title:"Four ways to organize ethics management",cap:"Protection alone is a warning sign: it shields managers, not stakeholders.",svg:function(){
  var b=[["Compliance",["Prevent, detect and","punish violations of","law and regulation"],6,6,0],["Value",["Define values and","build employee","commitment to them"],214,6,0],["External",["Align practices with","what stakeholders","expect of the firm"],6,116,0],["Protection",["Shield top management","from blame for ethical","or legal problems"],214,116,1]],out="";
  b.forEach(function(r){out+=box(r[2],r[3],200,100,{fill:r[4]?"var(--warn-soft)":"var(--accent-soft)",stroke:r[4]?"var(--warn)":"var(--accent)"})+tx(r[2]+100,r[3]+26,r[0],{size:15,w:800})+lines(r[2]+100,r[3]+50,r[1],{size:12,fill:"var(--muted)"},16)});
  return svgW(420,224,"Four orientations of ethics management",out)}};

FIGS.eu={title:"EU Guidelines for Trustworthy AI",cap:"Four ethical principles.",svg:function(){
  var out=ln(210,52,210,75)+ln(210,175,210,204)+ln(136,125,162,125)+ln(284,125,258,125);
  out+='<circle cx="210" cy="125" r="48" fill="var(--accent)"/>'+tx(210,121,"Trustworthy",{size:13,w:800,fill:"var(--accent-ink)"})+tx(210,138,"AI",{size:13,w:800,fill:"var(--accent-ink)"});
  out+=box(110,6,200,46,{fill:"var(--accent-soft)",stroke:"var(--accent)"})+tx(210,27,"Respect for human autonomy",{size:13,w:700})+tx(210,43,"people stay in control",{size:11,fill:"var(--muted)"});
  out+=box(110,204,200,44,{fill:"var(--accent-soft)",stroke:"var(--accent)"})+tx(210,224,"Prevention of harm",{size:13,w:700})+tx(210,240,"safe, robust, secure",{size:11,fill:"var(--muted)"});
  out+=box(6,97,130,56,{fill:"var(--accent-soft)",stroke:"var(--accent)"})+tx(71,119,"Fairness",{size:13,w:700})+tx(71,135,"no bias, equal",{size:11,fill:"var(--muted)"})+tx(71,148,"treatment",{size:11,fill:"var(--muted)"});
  out+=box(284,97,130,56,{fill:"var(--accent-soft)",stroke:"var(--accent)"})+tx(349,119,"Explicability",{size:13,w:700})+tx(349,135,"transparent and",{size:11,fill:"var(--muted)"})+tx(349,148,"explainable",{size:11,fill:"var(--muted)"});
  return svgW(420,254,"Four principles around Trustworthy AI",out)}};

FIGS.vw={title:"How the VW diesel scandal unfolded",cap:"Situational pressure and culture led to a failure of moral intent, then to the defeat device.",svg:function(){
  var s=[["Strategy 2018","Goal: become the world's largest carmaker"],["Pressure and culture","Command and control, fear of bad news"],["US 'clean diesel' decision","Growth plan relied on diesel in the US"],["Defeat device","Software cuts NOx only during tests (from Bosch)"],["Discovery and fallout","Denial first, then fines and lost trust"]],out="";
  s.forEach(function(r,i){var y=6+i*62,last=i===4;
    out+=box(30,y,360,46,{fill:last?"var(--bad-soft)":i===3?"var(--warn-soft)":"var(--surface)",stroke:last?"var(--bad)":i===3?"var(--warn)":"var(--line)"})+tx(210,y+20,r[0],{size:14,w:700})+tx(210,y+36,r[1],{size:11,fill:"var(--muted)"});
    if(i<4)out+=ln(210,y+46,210,y+62,true)});
  return svgW(420,314,"Chain of events at Volkswagen",out)}};

FIGS.intensity={title:"Moral intensity",cap:"The higher the intensity, the more likely people notice the issue and act ethically.",svg:function(){
  var c=[["Magnitude of","consequences"],["Social","consensus"],["Probability","of effect"],["Temporal","immediacy"],["Proximity",""],["Concentration","of effect"]],out=box(60,6,300,36,{fill:"var(--accent)",stroke:"var(--accent)"})+tx(210,29,"Moral intensity of an issue",{size:14,w:800,fill:"var(--accent-ink)"});
  c.forEach(function(r,i){var x=6+(i%3)*138,y=62+Math.floor(i/3)*66;
    out+=ln(210,42,x+64,y)+box(x,y,128,50,{fill:"var(--accent-soft)",stroke:"var(--accent)"});
    out+=r[1]?tx(x+64,y+22,r[0],{size:12,w:600})+tx(x+64,y+38,r[1],{size:12,w:600}):tx(x+64,y+30,r[0],{size:12,w:600})});
  return svgW(420,196,"Six components of moral intensity",out)}};

FIGS.rational={title:"Six rationalization strategies",cap:"Rationalizations protect our self-image as good people.",svg:function(){
  var c=[["Denial of responsibility","\"My arm is being twisted\""],["Denial of injury","\"No one was really harmed\""],["Denial of victim","\"They deserved it\""],["Social weighting","\"Others are worse than us\""],["Appeal to higher loyalties","\"A more important cause\""],["Metaphor of the ledger","\"I work overtime, so it's fine\""]],out="";
  c.forEach(function(r,i){var x=6+(i%2)*208,y=6+Math.floor(i/2)*80;
    out+=box(x,y,200,72)+tx(x+100,y+30,r[0],{size:13,w:700})+tx(x+100,y+52,r[1],{size:11,fill:"var(--muted)",it:true})});
  return svgW(420,252,"Six rationalization strategies with example phrases",out)}};

FIGS.kidder={title:"Kidder: right versus right",cap:"Four dilemma paradigms and three principles to resolve them.",svg:function(){
  var p=[["Truth","Loyalty"],["Individual","Community"],["Short-term","Long-term"],["Justice","Mercy"]],out=tx(210,16,"Four paradigms",{size:12,w:700,fill:"var(--muted)"});
  p.forEach(function(r,i){var y=28+i*44;
    out+=box(6,y,170,34,{fill:"var(--accent-soft)",stroke:"var(--accent)"})+tx(91,y+22,r[0],{size:13,w:700})+tx(210,y+22,"vs",{size:12,fill:"var(--muted)"})+box(244,y,170,34,{fill:"var(--accent-soft)",stroke:"var(--accent)"})+tx(329,y+22,r[1],{size:13,w:700})});
  out+=tx(210,222,"Three decision principles",{size:12,w:700,fill:"var(--muted)"});
  [["Ends-based","outcomes"],["Rule-based","duties and rules"],["Care-based","empathy"]].forEach(function(r,i){var x=6+i*140;
    out+=box(x,234,134,50,{fill:"var(--surface)",stroke:"var(--accent)"})+tx(x+67,x*0+254,r[0],{size:13,w:700})+tx(x+67,272,r[1],{size:11,fill:"var(--muted)"})});
  return svgW(420,294,"Kidder's four paradigms and three principles",out)}};

FIGS.trolley={title:"The trolley problem (footbridge version)",cap:"Utilitarian: pushing saves four lives net. Deontology: you would use him merely as a means.",svg:function(){
  var out='<line x1="10" y1="150" x2="410" y2="150" stroke="var(--muted)" stroke-width="3"/>';
  out+='<rect x="26" y="120" width="64" height="28" rx="6" fill="var(--bad)"/><circle cx="42" cy="152" r="6" fill="var(--ink)"/><circle cx="76" cy="152" r="6" fill="var(--ink)"/>'+ln(96,134,150,134,true);
  out+='<line x1="170" y1="66" x2="290" y2="66" stroke="var(--ink)" stroke-width="5"/>'+person(230,50);
  out+=ln(240,64,268,128,true,true)+tx(300,98,"push",{size:12,w:700,a:"start"});
  [300,325,350,375,398].forEach(function(x){out+=person(x,140)});
  out+=tx(230,26,"1 person on the bridge",{size:12,fill:"var(--muted)"})+tx(348,190,"5 people on the track",{size:12,fill:"var(--muted)"})+tx(60,190,"runaway trolley",{size:12,fill:"var(--muted)"});
  return svgW(420,206,"Trolley approaching five people with one person on a bridge above",out)}};

/* assign diagrams to existing questions */
var FA={csr3:"pyramid",csr4:"pyramid",csr7:"grid",csr10:"wicks",csr11:"kidder",csr12:"kidder",csr15:"pyramid",
 theo5:["trolley","before"],theo11:"tree",theo12:"tree",theo14:"tests",theo15:"kidder",
 beh1:"rest",beh2:"rest",beh5:"intensity",beh6:"rational",beh7:"rational",beh8:"rational",beh11:"locus",beh15:"rational",
 mgmt3:"orient",mgmt4:"orient",mgmt5:"orient",mgmt6:"orient",mgmt12:"orient",ai4:"eu",ai8:"eu",ai13:"eu",cases5:"vw",cases6:"vw",cases7:"vw"};
Object.keys(FA).forEach(function(id){var q=Q.filter(function(x){return x.id===id})[0];if(!q)return;var v=FA[id];if(typeof v==="string")q.fig=v;else{q.fig=v[0];q.figPos=v[1]}});
