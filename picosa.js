
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- dados ---------- */
var DEFAULTS={
  nome:"Professor Nome Apelido",
  cargo:"Professor de Programação",
  escola:"Nome da Escola ou Instituto",
  email:"professor@email.com",
  frase:"Primeiro entende o problema, depois escreve o código.",
  autor:"Jorge Manuel",
  bio:"Sou o professor que faz uma pergunta antes de dar a resposta. Acredito que programar começa muito antes do editor: começa em perceber o problema, desenhar a solução no papel e só depois escrever código.\n\nNas aulas, cada conceito aparece num exemplo pequeno e real — uma função, uma tabela, uma página — para que o aluno veja a ideia a funcionar e consiga refazê-la sozinho.\n\nO meu objetivo é formar programadores que pensam, e não apenas que copiam.",
  trajetoria:"Formação | Bases sólidas | Estudo da informática e da lógica de programação, a base de tudo o que se ensina depois.\nPrática | Projetos reais | Aprender fazendo: sites, sistemas e bases de dados que saem do papel e funcionam.\nEnsino | A sala de aula | Transformar a experiência em aulas claras, com exemplos pequenos e exercícios que fazem pensar.\nHoje | Formar programadores | Cada aluno é incentivado a resolver sozinho antes de pedir ajuda, porque quem pensa, aprende.",
  mensagem:"Obrigado, professor, por me ensinar que programar não é decorar código: é aprender a pensar. Cada aula foi um degrau.",
  foto:""
};
var KEY="portfolio-professor-v1";
var cfg=Object.assign({},DEFAULTS);
try{var raw=localStorage.getItem(KEY);if(raw){cfg=Object.assign({},DEFAULTS,JSON.parse(raw));}}catch(e){}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(cfg));}catch(e){}}

var SUBJECTS=[
 {id:"logica",nome:"Lógica de programação",
  desc:"O alicerce de tudo. Variáveis, condições e ciclos: uma forma de pensar que funciona em qualquer linguagem.",
  pontos:["Decompor um problema em passos pequenos","Prever o resultado antes de executar","Testar à mão, com papel e caneta"],
  file:"logica.js",
  code:"// Quantos números pares existem de 1 a 10?\nlet pares = 0;\nfor (let i = 1; i <= 10; i++) {\n  if (i % 2 === 0) {\n    pares = pares + 1;\n  }\n}\nconsole.log(pares); // 5"},
 {id:"js",nome:"JavaScript",
  desc:"A linguagem da web. Funções, arrays e eventos para dar vida às páginas.",
  pontos:["Escrever funções pequenas e reutilizáveis","Trabalhar com listas de dados (arrays)","Reagir a cliques e outros eventos"],
  file:"media.js",
  code:"const notas = [12, 15, 9, 18];\nconst media = notas.reduce((a, b) => a + b, 0) / notas.length;\nconsole.log(\"Média: \" + media); // 13.5"},
 {id:"sql",nome:"Bases de dados",
  desc:"MySQL na prática: guardar, filtrar e ordenar a informação de um sistema real.",
  pontos:["Desenhar tabelas e relações","Consultar dados com SELECT","Filtrar e ordenar resultados"],
  file:"melhores.sql",
  code:"-- Os 3 melhores alunos\nSELECT nome, nota\nFROM alunos\nWHERE nota >= 10\nORDER BY nota DESC\nLIMIT 3;"},
 {id:"web",nome:"Desenvolvimento web",
  desc:"HTML e CSS para estruturar e desenhar páginas que funcionam em qualquer ecrã.",
  pontos:["Estruturar páginas com HTML semântico","Estilizar com CSS e layouts responsivos","Ligar a página ao JavaScript"],
  file:"menu.html",
  code:"<nav class=\"menu\">\n  <a href=\"#inicio\">Início</a>\n  <a href=\"#contacto\">Contacto</a>\n</nav>"}
];

var QUIZ=[
 {q:"O que mostra <code>console.log(2 == \"2\", 2 === \"2\")</code>?",o:["true true","true false","false true","false false"],a:1,
  e:"O <code>==</code> converte os tipos antes de comparar; o <code>===</code> compara valor e tipo."},
 {q:"Qual é o resultado de <code>typeof []</code> em JavaScript?",o:["\"array\"","\"object\"","\"list\"","\"undefined\""],a:1,
  e:"Em JavaScript os arrays são objetos. Para os distinguir usa-se <code>Array.isArray()</code>."},
 {q:"Em SQL, que cláusula filtra as linhas de uma tabela?",o:["ORDER BY","WHERE","INSERT","VALUES"],a:1,
  e:"<code>WHERE</code> define a condição que cada linha tem de cumprir para aparecer no resultado."},
 {q:"Qual é o valor de <code>soma</code> no fim?<br><code>let soma = 0; for (let i = 0; i &lt; 4; i++) { soma += i; }</code>",o:["4","6","10","3"],a:1,
  e:"O ciclo soma 0 + 1 + 2 + 3 = 6. O 4 nunca entra, porque a condição é <code>i &lt; 4</code>."},
 {q:"Qual é a etiqueta HTML semântica para o menu principal de navegação?",o:["<div>","<nav>","<menu-bar>","<section>"],a:1,
  e:"<code>&lt;nav&gt;</code> diz ao navegador e aos leitores de ecrã que ali está a navegação principal."}
];

/* ---------- realce de código ---------- */
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function hl(src){
  var s=esc(src),tk=[];
  s=s.replace(/(\/\/[^\n]*|--[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')/g,function(m,c){
    tk.push('<span class="'+(c?"c":"s")+'">'+m+"</span>");return "\u0000T"+(tk.length-1)+"\u0000";});
  s=s.replace(/\b(const|let|function|return|if|else|for|while|new|SELECT|FROM|WHERE|ORDER BY|DESC|ASC|LIMIT|AND|OR|INSERT INTO|VALUES)\b/g,'<span class="k">$1</span>');
  s=s.replace(/\b(\d+)\b/g,'<span class="n">$1</span>');
  s=s.replace(/\b([a-zA-Z_]\w*)(?=\()/g,'<span class="f">$1</span>');
  return s.replace(/\u0000T(\d+)\u0000/g,function(m,i){return tk[+i];});
}
function lines(html,caret){
  var arr=html.split("\n");
  return arr.map(function(l,i){
    return '<span class="ln">'+(l||" ")+(caret&&i===arr.length-1?'<span class="caret"></span>':"")+"</span>";
  }).join("");
}

/* ---------- renderização ---------- */
function initials(n){
  var p=n.replace(/^(Prof\.?|Professor|Professora|Eng\.?|Dr\.?|Dra\.?)\s+/i,"").trim().split(/\s+/).filter(Boolean);
  return ((p[0]||"P").charAt(0)+(p.length>1?p[p.length-1].charAt(0):"")).toUpperCase();
}
function parseTimeline(t){
  return t.split("\n").map(function(l){return l.split("|").map(function(x){return x.trim();});})
    .filter(function(p){return p.length>=2&&p[0]&&p[1];})
    .map(function(p){return {ano:p[0],titulo:p[1],texto:p.slice(2).join(" | ")};});
}
function renderStatic(){
  $$("[data-bind]").forEach(function(el){el.textContent=cfg[el.getAttribute("data-bind")]||"";});
  $$("[data-initials]").forEach(function(el){el.textContent=initials(cfg.nome);});
  document.title=cfg.nome+" — Portfólio";
  var bio=$("#bio");bio.innerHTML="";
  cfg.bio.split(/\n\s*\n/).filter(function(x){return x.trim();}).forEach(function(t){
    var p=document.createElement("p");p.textContent=t.trim();bio.appendChild(p);});
  var ph=$("#photo");
  if(cfg.foto){ph.style.backgroundImage='url("'+cfg.foto+'")';ph.classList.add("has-photo");}
  else{ph.style.backgroundImage="";ph.classList.remove("has-photo");}
  var tl=$("#timeline");tl.innerHTML="";
  parseTimeline(cfg.trajetoria).forEach(function(it){
    var li=document.createElement("li");
    var y=document.createElement("span");y.className="tl-year";y.textContent=it.ano;
    var h=document.createElement("h3");h.textContent=it.titulo;
    var p=document.createElement("p");p.textContent=it.texto;
    li.appendChild(y);li.appendChild(h);if(it.texto)li.appendChild(p);tl.appendChild(li);
  });
  $("#msg").textContent=cfg.mensagem;
  var mt=$("#mailText");mt.textContent=cfg.email;mt.href="mailto:"+cfg.email;
  updateMail();
}

/* ---------- herói: código a escrever-se ---------- */
function heroCode(c){
  return "// aula-01.js\nconst professor = {\n  nome: "+JSON.stringify(c.nome)+",\n  disciplina: \"Programação\",\n  escola: "+JSON.stringify(c.escola)+
    ",\n  ensina: [\"JavaScript\", \"MySQL\", \"Lógica\"],\n  lema() {\n    return "+JSON.stringify(c.frase)+";\n  }\n};\n\nconsole.log(professor.lema());";
}
var timer;
function showOut(){$("#heroOut").hidden=false;$("#heroOutText").textContent=cfg.frase;}
function typeHero(){
  clearInterval(timer);
  var code=heroCode(cfg),box=$("#heroCode");
  $("#heroOut").hidden=true;
  if(reduce){box.innerHTML=lines(hl(code));showOut();return;}
  var i=0;
  timer=setInterval(function(){
    i+=3;
    box.innerHTML=lines(hl(code.slice(0,i)),i<code.length);
    if(i>=code.length){clearInterval(timer);setTimeout(showOut,350);}
  },26);
}
$("#replay").addEventListener("click",typeHero);

/* ---------- disciplinas ---------- */
function selectSubject(id){
  var s=SUBJECTS.filter(function(x){return x.id===id;})[0];
  $$(".tab").forEach(function(b){b.setAttribute("aria-selected",String(b.dataset.id===id));});
  var p=$("#panel");
  p.innerHTML="";
  var left=document.createElement("div");
  var h=document.createElement("h3");h.textContent=s.nome;
  var d=document.createElement("p");d.textContent=s.desc;
  var ul=document.createElement("ul");ul.className="learn";
  s.pontos.forEach(function(t){var li=document.createElement("li");li.textContent=t;ul.appendChild(li);});
  left.appendChild(h);left.appendChild(d);left.appendChild(ul);
  var win=document.createElement("div");win.className="win flat";
  win.innerHTML='<div class="win-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span></span></div><pre class="code"></pre>';
  $("span:last-child",win).textContent=s.file;
  $("pre",win).innerHTML=lines(hl(s.code));
  p.appendChild(left);p.appendChild(win);
}
(function buildTabs(){
  var t=$("#tabs");
  SUBJECTS.forEach(function(s,i){
    var b=document.createElement("button");
    b.className="tab";b.type="button";b.setAttribute("role","tab");b.dataset.id=s.id;b.textContent=s.nome;
    b.addEventListener("click",function(){selectSubject(s.id);});
    t.appendChild(b);
  });
  selectSubject(SUBJECTS[0].id);
})();

/* ---------- desafio ---------- */
var qi=0,score=0,answered=false;
function renderQuiz(){
  var box=$("#quiz");answered=false;
  if(qi>=QUIZ.length){
    var msg=score===QUIZ.length?"Excelente! Já podes explicar isto a outro aluno."
      :score>=3?"Muito bom. Revê as explicações dos erros e tenta outra vez."
      :"Bom começo. Programar é treino: tenta de novo.";
    box.innerHTML='<div class="q-meta"><span>Resultado final</span></div><div class="score-big">'+score+' / '+QUIZ.length+'</div><p class="q-text">'+msg+'</p><div class="q-actions"></div>';
    var again=document.createElement("button");again.className="btn primary";again.type="button";again.textContent="Tentar outra vez";
    again.addEventListener("click",function(){qi=0;score=0;renderQuiz();});
    $(".q-actions",box).appendChild(again);
    return;
  }


  var q=QUIZ[qi];
  box.innerHTML='<div class="q-meta"><span>Pergunta '+(qi+1)+' de '+QUIZ.length+'</span><span>Pontos: '+score+'</span></div>'+
    '<div class="bar" aria-hidden="true"><i style="width:'+(qi/QUIZ.length*100)+'%"></i></div>'+
    '<h3 class="q-text">'+q.q+'</h3><div class="opts"></div><div class="q-fb" aria-live="polite"></div><div class="q-actions"></div>';
  var opts=$(".opts",box);
  q.o.forEach(function(t,idx){
    var b=document.createElement("button");b.className="opt";b.type="button";b.textContent=t;
    b.addEventListener("click",function(){answer(idx);});
    opts.appendChild(b);
  });
}

function answer(idx){
  if(answered)return;answered=true;
  var q=QUIZ[qi],btns=$$(".opt"),fb=$(".q-fb");
  btns.forEach(function(b,i){
    b.disabled=true;
    if(i===q.a)b.classList.add("ok");
    else if(i===idx)b.classList.add("bad");
    else b.classList.add("dim");
  });
  if(idx===q.a){score++;fb.innerHTML="<strong>✓ Certo.</strong> "+q.e;}
  else{fb.innerHTML="<strong>✗ Não é essa.</strong> "+q.e;}
  var next=document.createElement("button");next.className="btn primary small";next.type="button";
  next.textContent=qi===QUIZ.length-1?"Ver resultado":"Próxima pergunta";
  next.addEventListener("click",function(){qi++;renderQuiz();$("#quiz").scrollIntoView({block:"nearest"});});
  $(".q-actions").appendChild(next);next.focus();
}

/* ---------- contacto ---------- */
function msgText(){
  var n=$("#cNome").value.trim(),m=$("#cMsg").value.trim();
  return "Olá, "+cfg.nome+".\n\n"+(m||"(escreve aqui a tua mensagem)")+"\n\n"+(n?"Cumprimentos,\n"+n:"");
}

function updateMail(){
  var a=$("#mailBtn");
  a.href="mailto:"+cfg.email+"?subject="+encodeURIComponent("Mensagem para "+cfg.nome)+"&body="+encodeURIComponent(msgText());
}
$("#cNome").addEventListener("input",updateMail);
$("#cMsg").addEventListener("input",updateMail);
var toastT;
function toast(t){var el=$("#toast");el.textContent=t;el.classList.add("on");clearTimeout(toastT);toastT=setTimeout(function(){el.classList.remove("on");},2200);}
$("#copyBtn").addEventListener("click",function(){
  var text=msgText();
  function fallback(){
    try{var ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();
      var ok=document.execCommand("copy");document.body.removeChild(ta);toast(ok?"Mensagem copiada":"Não foi possível copiar");}
    catch(e){toast("Não foi possível copiar");}
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){toast("Mensagem copiada");},fallback);}
  else fallback();
});

/* ---------- tema ---------- */
$("#themeBtn").addEventListener("click",function(){
  var root=document.documentElement,cur=root.getAttribute("data-theme");
  if(!cur)cur=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  root.setAttribute("data-theme",cur==="dark"?"light":"dark");
});

/* ---------- navegação ativa ---------- */
if("IntersectionObserver" in window){
  var links=$$(".links a");
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){links.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")==="#"+e.target.id);});}
    });
  },{rootMargin:"-45% 0px -50% 0px"});
  $$("main section[id]").forEach(function(s){io.observe(s);});
}

/* ---------- painel Personalizar ---------- */
var FIELDS={f_nome:"nome",f_cargo:"cargo",f_escola:"escola",f_email:"email",f_frase:"frase",f_bio:"bio",f_traj:"trajetoria",f_msg:"mensagem",f_autor:"autor"};
function fillFields(){Object.keys(FIELDS).forEach(function(id){$("#"+id).value=cfg[FIELDS[id]];});}
Object.keys(FIELDS).forEach(function(id){
  $("#"+id).addEventListener("input",function(e){cfg[FIELDS[id]]=e.target.value;persist();renderStatic();});
});
$("#f_foto").addEventListener("change",function(e){
  var f=e.target.files&&e.target.files[0];if(!f)return;
  var fr=new FileReader();
  fr.onload=function(){
    var img=new Image();
    img.onload=function(){
      var max=700,r=Math.min(1,max/Math.max(img.width,img.height));
      var c=document.createElement("canvas");c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      cfg.foto=c.toDataURL("image/jpeg",.85);persist();renderStatic();toast("Fotografia atualizada");
    };
    img.src=fr.result;
  };
  fr.readAsDataURL(f);
});
var drawer=$("#drawer"),scrim=$("#scrim"),editBtn=$("#editBtn");
function openDrawer(){
  fillFields();drawer.removeAttribute("inert");drawer.setAttribute("aria-hidden","false");
  drawer.classList.add("open");scrim.classList.add("on");editBtn.setAttribute("aria-expanded","true");
  setTimeout(function(){$("#f_nome").focus();},60);
}


function closeDrawer(){
  drawer.classList.remove("open");scrim.classList.remove("on");drawer.setAttribute("inert","");drawer.setAttribute("aria-hidden","true");
  editBtn.setAttribute("aria-expanded","false");editBtn.focus();typeHero();
}
editBtn.addEventListener("click",openDrawer);
$("#closeBtn").addEventListener("click",closeDrawer);
$("#saveBtn").addEventListener("click",closeDrawer);
scrim.addEventListener("click",closeDrawer);
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&drawer.classList.contains("open"))closeDrawer();});
$("#resetBtn").addEventListener("click",function(){
  cfg=Object.assign({},DEFAULTS);persist();fillFields();renderStatic();toast("Textos de exemplo repostos");
});

/* ---------- arranque ---------- */
renderStatic();
renderQuiz();
typeHero();
})();