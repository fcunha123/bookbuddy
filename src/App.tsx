import { useState, useRef, useEffect } from "react";

const C = { coral:"#FF4757", yellow:"#FFD93D", teal:"#00D2D3", lavender:"#A29BFE", green:"#6BCB77", pink:"#FD79A8", orange:"#FF9F43", navy:"#1A2025", cream:"#FFFBF0", white:"#FFFFFF" };
const sh = (c=C.navy,x=3,y=4) => `${x}px ${y}px 0px ${c}`;
const shB = () => `4px 6px 0px ${C.navy}`;

/* ── SVG helpers ── */
const Blob = ({color,size=120,style={}}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={style} aria-hidden="true">
    <path fill={color} d="M47,-62C59,-53,67,-36,71,-19C75,-2,76,16,70,31C64,46,50,59,35,66C19,74,2,76,-16,73C-34,70,-53,62,-64,48C-75,34,-78,13,-74,-5C-71,-23,-61,-40,-48,-51C-35,-63,-17,-69,0,-69C17,-69,35,-72,47,-62Z" transform="translate(100 100)"/>
  </svg>
);

const Wave = ({color}) => (
  <svg viewBox="0 0 390 40" width="390" height="40" style={{display:"block",marginBottom:-2}} aria-hidden="true">
    <path d="M0 20 Q48 0 96 20 Q144 40 192 20 Q240 0 288 20 Q336 40 390 20 L390 40 L0 40 Z" fill={color}/>
  </svg>
);

const Char = ({tipo="av",size=100,label}) => {
  const a = label ? {role:"img","aria-label":label} : {"aria-hidden":"true"};
  const chars = {
    av: <svg width={size} height={size} viewBox="0 0 200 200" {...a}><ellipse cx="100" cy="120" rx="58" ry="53" fill={C.orange} stroke={C.navy} strokeWidth="3"/><circle cx="100" cy="73" r="40" fill={C.yellow} stroke={C.navy} strokeWidth="3"/><rect x="72" y="34" width="56" height="11" rx="5" fill={C.coral} stroke={C.navy} strokeWidth="2.5"/><rect x="82" y="14" width="36" height="22" rx="7" fill={C.coral} stroke={C.navy} strokeWidth="2.5"/><circle cx="87" cy="69" r="8" fill={C.white} stroke={C.navy} strokeWidth="2"/><circle cx="113" cy="69" r="8" fill={C.white} stroke={C.navy} strokeWidth="2"/><circle cx="89" cy="71" r="4" fill={C.navy}/><circle cx="115" cy="71" r="4" fill={C.navy}/><circle cx="91" cy="69" r="1.5" fill={C.white}/><circle cx="117" cy="69" r="1.5" fill={C.white}/><path d="M88 83 Q100 93 112 83" stroke={C.navy} strokeWidth="3" fill="none" strokeLinecap="round"/><circle cx="80" cy="123" r="13" fill={C.teal} stroke={C.navy} strokeWidth="2.5"/><circle cx="120" cy="123" r="13" fill={C.teal} stroke={C.navy} strokeWidth="2.5"/><rect x="92" y="119" width="16" height="8" fill={C.navy}/><ellipse cx="50" cy="114" rx="13" ry="9" fill={C.orange} stroke={C.navy} strokeWidth="2.5" transform="rotate(-20 50 114)"/><ellipse cx="150" cy="114" rx="13" ry="9" fill={C.orange} stroke={C.navy} strokeWidth="2.5" transform="rotate(20 150 114)"/></svg>,
    fa: <svg width={size} height={size} viewBox="0 0 200 200" {...a}><ellipse cx="100" cy="124" rx="56" ry="51" fill={C.lavender} stroke={C.navy} strokeWidth="3"/><circle cx="100" cy="76" r="39" fill={C.pink} stroke={C.navy} strokeWidth="3"/><polygon points="100,9 76,54 124,54" fill={C.lavender} stroke={C.navy} strokeWidth="3"/><rect x="69" y="51" width="62" height="11" rx="5" fill={C.teal} stroke={C.navy} strokeWidth="2.5"/><circle cx="87" cy="73" r="9" fill={C.white} stroke={C.navy} strokeWidth="2"/><circle cx="113" cy="73" r="9" fill={C.white} stroke={C.navy} strokeWidth="2"/><circle cx="89" cy="75" r="5" fill={C.coral}/><circle cx="115" cy="75" r="5" fill={C.coral}/><circle cx="91" cy="73" r="2" fill={C.white}/><circle cx="117" cy="73" r="2" fill={C.white}/><path d="M87 86 Q100 98 113 86" stroke={C.navy} strokeWidth="3" fill="none" strokeLinecap="round"/><line x1="138" y1="100" x2="158" y2="71" stroke={C.navy} strokeWidth="4" strokeLinecap="round"/><circle cx="158" cy="69" r="7" fill={C.yellow} stroke={C.navy} strokeWidth="2"/><ellipse cx="50" cy="117" rx="14" ry="9" fill={C.lavender} stroke={C.navy} strokeWidth="2.5" transform="rotate(-15 50 117)"/><ellipse cx="150" cy="117" rx="14" ry="9" fill={C.lavender} stroke={C.navy} strokeWidth="2.5" transform="rotate(15 150 117)"/></svg>,
    cl: <svg width={size} height={size} viewBox="0 0 200 200" {...a}><ellipse cx="100" cy="124" rx="56" ry="51" fill={C.teal} stroke={C.navy} strokeWidth="3"/><circle cx="100" cy="76" r="39" fill={C.cream} stroke={C.navy} strokeWidth="3"/><circle cx="87" cy="74" r="11" fill="none" stroke={C.navy} strokeWidth="3"/><circle cx="113" cy="74" r="11" fill="none" stroke={C.navy} strokeWidth="3"/><line x1="98" y1="74" x2="102" y2="74" stroke={C.navy} strokeWidth="2.5"/><line x1="76" y1="71" x2="68" y2="68" stroke={C.navy} strokeWidth="2.5"/><line x1="124" y1="71" x2="132" y2="68" stroke={C.navy} strokeWidth="2.5"/><circle cx="87" cy="74" r="5" fill={C.navy}/><circle cx="113" cy="74" r="5" fill={C.navy}/><circle cx="89" cy="72" r="2" fill={C.white}/><circle cx="115" cy="72" r="2" fill={C.white}/><polygon points="92,92 100,97 108,92 100,87" fill={C.coral} stroke={C.navy} strokeWidth="2"/><path d="M90 85 Q100 91 110 85" stroke={C.navy} strokeWidth="2.5" fill="none" strokeLinecap="round"/><rect x="31" y="110" width="27" height="34" rx="4" fill={C.yellow} stroke={C.navy} strokeWidth="2.5"/><line x1="44" y1="110" x2="44" y2="144" stroke={C.navy} strokeWidth="1.5"/><ellipse cx="151" cy="117" rx="13" ry="9" fill={C.teal} stroke={C.navy} strokeWidth="2.5" transform="rotate(15 151 117)"/></svg>,
    en: <svg width={size} height={size} viewBox="0 0 200 200" {...a}><ellipse cx="100" cy="121" rx="60" ry="54" fill={C.green} stroke={C.navy} strokeWidth="3"/><circle cx="100" cy="73" r="42" fill={C.yellow} stroke={C.navy} strokeWidth="3"/><ellipse cx="78" cy="34" rx="7" ry="13" fill={C.coral} stroke={C.navy} strokeWidth="2.5" transform="rotate(-15 78 34)"/><ellipse cx="100" cy="30" rx="7" ry="15" fill={C.coral} stroke={C.navy} strokeWidth="2.5"/><ellipse cx="122" cy="34" rx="7" ry="13" fill={C.coral} stroke={C.navy} strokeWidth="2.5" transform="rotate(15 122 34)"/><circle cx="85" cy="70" r="10" fill={C.white} stroke={C.navy} strokeWidth="2.5"/><circle cx="115" cy="70" r="10" fill={C.white} stroke={C.navy} strokeWidth="2.5"/><circle cx="87" cy="72" r="6" fill={C.navy}/><circle cx="117" cy="72" r="6" fill={C.navy}/><circle cx="89" cy="70" r="2" fill={C.white}/><circle cx="119" cy="70" r="2" fill={C.white}/><path d="M81 87 Q100 107 119 87" stroke={C.navy} strokeWidth="3.5" fill={C.coral} strokeLinecap="round"/><ellipse cx="100" cy="97" rx="9" ry="7" fill={C.pink} stroke={C.navy} strokeWidth="2"/><ellipse cx="46" cy="106" rx="13" ry="9" fill={C.green} stroke={C.navy} strokeWidth="2.5" transform="rotate(-40 46 106)"/><ellipse cx="154" cy="106" rx="13" ry="9" fill={C.green} stroke={C.navy} strokeWidth="2.5" transform="rotate(40 154 106)"/></svg>,
    tr: <svg width={size} height={size} viewBox="0 0 200 200" {...a}><ellipse cx="100" cy="124" rx="56" ry="51" fill={C.lavender} stroke={C.navy} strokeWidth="3"/><circle cx="100" cy="76" r="39" fill="#DFE6E9" stroke={C.navy} strokeWidth="3"/><circle cx="85" cy="71" r="7" fill={C.white} stroke={C.navy} strokeWidth="2"/><circle cx="115" cy="71" r="7" fill={C.white} stroke={C.navy} strokeWidth="2"/><circle cx="86" cy="73" r="4" fill={C.navy}/><circle cx="116" cy="73" r="4" fill={C.navy}/><path d="M88 88 Q100 80 112 88" stroke={C.navy} strokeWidth="3" fill="none" strokeLinecap="round"/><ellipse cx="83" cy="82" rx="3" ry="6" fill={C.teal} stroke={C.navy} strokeWidth="1.5"/><ellipse cx="48" cy="117" rx="14" ry="9" fill={C.lavender} stroke={C.navy} strokeWidth="2.5" transform="rotate(-10 48 117)"/><ellipse cx="152" cy="117" rx="14" ry="9" fill={C.lavender} stroke={C.navy} strokeWidth="2.5" transform="rotate(10 152 117)"/></svg>,
    an: <svg width={size} height={size} viewBox="0 0 200 200" {...a}><ellipse cx="100" cy="121" rx="58" ry="53" fill={C.coral} stroke={C.navy} strokeWidth="3"/><circle cx="100" cy="73" r="40" fill={C.orange} stroke={C.navy} strokeWidth="3"/><text x="79" y="76" fontSize="17" textAnchor="middle" aria-hidden="true">⭐</text><text x="119" y="76" fontSize="17" textAnchor="middle" aria-hidden="true">⭐</text><path d="M76 87 Q100 110 124 87" stroke={C.navy} strokeWidth="3.5" fill={C.white} strokeLinecap="round"/><ellipse cx="44" cy="100" rx="13" ry="9" fill={C.coral} stroke={C.navy} strokeWidth="2.5" transform="rotate(-50 44 100)"/><ellipse cx="156" cy="100" rx="13" ry="9" fill={C.coral} stroke={C.navy} strokeWidth="2.5" transform="rotate(50 156 100)"/><circle cx="32" cy="78" r="5" fill={C.yellow}/><circle cx="168" cy="75" r="4" fill={C.teal}/><rect x="20" y="90" width="8" height="8" rx="2" fill={C.pink} transform="rotate(20 20 90)"/><rect x="165" y="88" width="8" height="8" rx="2" fill={C.green} transform="rotate(-20 165 88)"/></svg>,
  };
  return chars[tipo] || chars.av;
};

/* ── Capa: foto real ou personagem ── */
const Capa = ({livro, size=90}) => {
  if (livro.capa) return <img src={livro.capa} alt={`Capa: ${livro.titulo}`} style={{width:size*0.72,height:size,objectFit:"cover",borderRadius:10,border:`3px solid ${C.navy}`,boxShadow:sh(C.navy,3,4),display:"block",margin:"0 auto"}}/>;
  return <Char tipo={livro.tipo} size={size}/>;
};

/* ── DADOS ── */
const LIVROS_BASE = [
  {id:"l1",titulo:"A Casa da Árvore Mágica",autor:"Mary Pope Osborne",tipo:"av",bgColor:C.orange,tagColor:C.coral,disponivel:true,genero:"Aventura",paginas:96,nota:5,descricao:"Jack e Annie viajam pelo tempo e espaço! Cada capítulo é uma nova surpresa.",descricaoUsuario:"",capa:null,amigosLendo:2},
  {id:"l2",titulo:"A Teia de Charlotte",autor:"E.B. White",tipo:"tr",bgColor:"#DFE6E9",tagColor:C.lavender,disponivel:false,emprestadoPara:"a1",genero:"Clássico",paginas:184,nota:5,descricao:"Uma aranha, um porco e a amizade mais linda que você vai ler!",descricaoUsuario:"Meu livro favorito! Li 3 vezes 💙",capa:null,amigosLendo:1},
  {id:"l3",titulo:"Diário de um Banana",autor:"Jeff Kinney",tipo:"en",bgColor:C.yellow,tagColor:C.green,disponivel:true,genero:"Engraçado",paginas:217,nota:4,descricao:"A vida de Greg Heffley é hilariantemente familiar. Cuidado: causa risadas em público!",descricaoUsuario:"",capa:null,amigosLendo:3},
  {id:"l4",titulo:"Percy Jackson",autor:"Rick Riordan",tipo:"av",bgColor:C.teal,tagColor:C.navy,disponivel:true,genero:"Fantasia",paginas:377,nota:5,descricao:"Deuses gregos são REAIS e Percy é filho de um deles! Monstros e missões épicas.",descricaoUsuario:"",capa:null,amigosLendo:4},
  {id:"l5",titulo:"Matilda",autor:"Roald Dahl",tipo:"cl",bgColor:C.pink,tagColor:C.lavender,disponivel:true,genero:"Clássico",paginas:240,nota:5,descricao:"Uma garota genial com poderes mágicos contra os piores adultos do mundo!",descricaoUsuario:"",capa:null,amigosLendo:2},
  {id:"l6",titulo:"Harry Potter",autor:"J.K. Rowling",tipo:"fa",bgColor:C.lavender,tagColor:C.coral,disponivel:false,emprestadoPara:"a2",genero:"Fantasia",paginas:332,nota:5,descricao:"Você é um bruxo! Hogwarts, Quadribol, magia pura em cada página.",descricaoUsuario:"",capa:null,amigosLendo:5},
];
const AMIGOS = [
  {id:"a1",nome:"Leo",emoji:"🐻",cor:C.teal,qtd:8,tipo:"cl",pendente:false},
  {id:"a2",nome:"Zara",emoji:"🦋",cor:C.yellow,qtd:15,tipo:"en",pendente:false},
  {id:"a3",nome:"Max",emoji:"🦁",cor:C.green,qtd:6,tipo:"av",pendente:true},
  {id:"a4",nome:"Lily",emoji:"🐱",cor:C.pink,qtd:11,tipo:"fa",pendente:false},
];
const LIV_AMIGOS = {
  a1:[{id:"a1l1",titulo:"Onde Vivem os Monstros",autor:"Maurice Sendak",tipo:"en",bgColor:C.yellow,tagColor:C.orange,disponivel:true,genero:"Clássico",paginas:48,nota:5,descricao:"Max viaja para onde os monstros selvagens vivem!",descricaoUsuario:"",capa:null,amigosLendo:1},{id:"a1l2",titulo:"A Lagarta Comilona",autor:"Eric Carle",tipo:"av",bgColor:C.green,tagColor:C.teal,disponivel:true,genero:"Clássico",paginas:26,nota:5,descricao:"Cheio de cores e contagem para leitores pequenos!",descricaoUsuario:"",capa:null,amigosLendo:2},{id:"a1l3",titulo:"A Teia de Charlotte",tipo:"tr",bgColor:"#DFE6E9",tagColor:C.lavender,disponivel:false,genero:"Clássico",paginas:184,nota:5,descricao:"Já emprestado — vale a espera!",descricaoUsuario:"",capa:null,amigosLendo:1}],
  a2:[{id:"a2l1",titulo:"Extraordinário",autor:"R.J. Palacio",tipo:"an",bgColor:C.teal,tagColor:C.coral,disponivel:true,genero:"Aventura",paginas:315,nota:5,descricao:"Um livro que vai mudar como você vê o mundo.",descricaoUsuario:"",capa:null,amigosLendo:3},{id:"a2l2",titulo:"O GGG",autor:"Roald Dahl",tipo:"en",bgColor:C.lavender,tagColor:C.green,disponivel:true,genero:"Fantasia",paginas:208,nota:5,descricao:"Sophie e o Grande Gigante Gentil numa aventura mágica!",descricaoUsuario:"",capa:null,amigosLendo:2}],
  a4:[{id:"a4l1",titulo:"Capitão Cueca",autor:"Dav Pilkey",tipo:"en",bgColor:C.pink,tagColor:C.coral,disponivel:true,genero:"Engraçado",paginas:176,nota:4,descricao:"O super-herói mais ridículo e divertido do mundo!",descricaoUsuario:"",capa:null,amigosLendo:4},{id:"a4l2",titulo:"Dog Man",autor:"Dav Pilkey",tipo:"av",bgColor:C.orange,tagColor:C.yellow,disponivel:true,genero:"Engraçado",paginas:224,nota:4,descricao:"Parte cão, parte homem, todo herói!",descricaoUsuario:"",capa:null,amigosLendo:3}],
};
const EMPR_BASE = [
  {id:"e1",titulo:"O Leão, a Feiticeira e o Guarda-Roupa",tipo:"fa",bgColor:C.lavender,tagColor:C.teal,deAmigo:"a1",venc:new Date(Date.now()+3*86400000),genero:"Fantasia",paginas:208,nota:5,descricao:"Quatro crianças entram num guarda-roupa e chegam a um mundo mágico!",descricaoUsuario:"",capa:null,amigosLendo:3},
  {id:"e2",titulo:"A Ilha do Tesouro",tipo:"av",bgColor:C.orange,tagColor:C.coral,deAmigo:"a2",venc:new Date(Date.now()+12*86400000),genero:"Aventura",paginas:292,nota:5,descricao:"Piratas, mapas do tesouro e aventuras no mar!",descricaoUsuario:"",capa:null,amigosLendo:2},
  {id:"e3",titulo:"Alice no País das Maravilhas",tipo:"fa",bgColor:C.pink,tagColor:C.lavender,deAmigo:"a4",venc:new Date(Date.now()-86400000),genero:"Fantasia",paginas:180,nota:5,descricao:"Alice cai numa toca de coelho e entra no mundo mais estranho e maravilhoso!",descricaoUsuario:"",capa:null,amigosLendo:4},
];
const NOTIF_BASE = [
  {id:"n1",tipo:"pedido",icone:"📚",titulo:"Pedido de empréstimo",texto:"Leo quer pegar A Casa da Árvore Mágica emprestada!",tempo:"2 min",lida:false,cor:C.teal},
  {id:"n2",tipo:"devolucao",icone:"✅",titulo:"Livro devolvido!",texto:"Zara devolveu Harry Potter. Ele voltou para a sua estante.",tempo:"1 hora",lida:false,cor:C.green},
  {id:"n3",tipo:"amizade",icone:"👋",titulo:"Novo Amigo Leitor",texto:"Max quer ser seu Amigo Leitor!",tempo:"3 horas",lida:false,cor:C.lavender},
  {id:"n4",tipo:"atraso",icone:"⏰",titulo:"Livro em atraso!",texto:"Alice no País das Maravilhas venceu ontem. Devolva logo!",tempo:"1 dia",lida:true,cor:C.coral},
  {id:"n5",tipo:"pedido",icone:"📚",titulo:"Pedido de empréstimo",texto:"Lily quer pegar Matilda emprestada!",tempo:"2 dias",lida:true,cor:C.pink},
];

const amId = id => AMIGOS.find(a=>a.id===id);
const diasR = d => Math.ceil((d-Date.now())/86400000);
const pTag = d => d<0?{label:`${Math.abs(d)}d ATRASADO!`,bg:C.coral,tx:C.white}:d<=3?{label:`${d}d restando!`,bg:C.orange,tx:C.navy}:{label:`${d} dias`,bg:C.green,tx:C.navy};

/* ── DETALHE ── */
function Detalhe({livro,onVoltar,eMeu,doEmp}) {
  const [enviado,setEnviado]=useState(false);
  return (
    <div>
      {enviado&&<div role="status" aria-live="polite" style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:200,background:C.yellow,border:`4px solid ${C.navy}`,borderRadius:20,padding:"14px 24px",boxShadow:shB(),fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy,pointerEvents:"none"}}>🎉 Pedido Enviado!</div>}
      <div style={{background:livro.bgColor,padding:"18px 20px 0",position:"relative",overflow:"hidden",minHeight:270}}>
        <Blob color={C.white} size={200} style={{position:"absolute",right:-60,top:-60,opacity:0.12}}/>
        <button onClick={onVoltar} aria-label="Voltar" style={{background:C.navy,color:C.white,border:"none",borderRadius:16,padding:"10px 20px",fontFamily:"'Fredoka One',cursive",fontSize:15,cursor:"pointer",boxShadow:sh(C.navy,2,3),position:"relative",zIndex:2,minHeight:44}}>← Voltar</button>
        <div style={{display:"flex",alignItems:"flex-end",gap:14,marginTop:12,position:"relative",zIndex:1}}>
          <div style={{flex:1,display:"flex",justifyContent:"center"}}>
            {livro.capa
              ? <div style={{position:"relative",display:"inline-block"}}><img src={livro.capa} alt={`Capa: ${livro.titulo}`} style={{width:115,height:165,objectFit:"cover",borderRadius:14,border:`4px solid ${C.navy}`,boxShadow:`6px 8px 0 ${C.navy}`,transform:"rotate(-2deg)",display:"block"}}/><div style={{position:"absolute",bottom:-14,right:-18}}><Char tipo={livro.tipo} size={68}/></div></div>
              : <div style={{background:C.white,borderRadius:22,padding:"5px 5px 0 5px",border:`4px solid ${C.navy}`,boxShadow:`5px 7px 0 ${C.navy}`,display:"inline-block"}}><Char tipo={livro.tipo} size={150} label={livro.titulo}/></div>
            }
          </div>
          <div style={{flex:1.2,paddingBottom:20}}>
            <span style={{display:"inline-block",background:livro.tagColor||C.coral,color:C.navy,borderRadius:12,padding:"4px 14px",fontFamily:"'Fredoka One',cursive",fontSize:12,border:`2px solid ${C.navy}`,boxShadow:sh(C.navy,2,2),marginBottom:8}}>{livro.genero}</span>
            <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:21,color:C.navy,lineHeight:1.15,marginBottom:6}}>{livro.titulo}</h1>
            {livro.autor&&<p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:0.8,marginBottom:10}}>por {livro.autor}</p>}
            <div role="img" aria-label={`Nota: ${livro.nota} de 5`}>{[0,1,2,3,4].map(i=><span key={i} aria-hidden="true" style={{fontSize:20,color:i<livro.nota?C.yellow:"#CCC"}}>★</span>)}</div>
          </div>
        </div>
        <Wave color={C.cream}/>
      </div>

      <div style={{background:C.cream,padding:"4px 20px 150px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {[{l:"Páginas",v:livro.paginas,i:"📄",bg:C.yellow},{l:"Amigos Lendo",v:livro.amigosLendo,i:"👫",bg:C.teal},{l:"Nota",v:`${livro.nota}/5`,i:"⭐",bg:C.lavender}].map(s=>(
            <div key={s.l} style={{background:s.bg,borderRadius:16,padding:"12px 6px",textAlign:"center",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy,2,3)}}>
              <span aria-hidden="true" style={{fontSize:22,display:"block"}}>{s.i}</span>
              <span style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy,display:"block"}}>{s.v}</span>
              <span style={{fontFamily:"'Boogaloo',cursive",fontSize:10,color:C.navy}}>{s.l}</span>
            </div>
          ))}
        </div>

        <div style={{background:C.white,borderRadius:20,padding:"16px 18px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),marginBottom:12}}>
          <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy,marginBottom:8}}>Do que se trata? 🤔</h2>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,lineHeight:1.8}}>{livro.descricao}</p>
        </div>

        {livro.descricaoUsuario&&(
          <div style={{background:C.yellow+"44",borderRadius:20,padding:"14px 16px",border:`3px solid ${C.yellow}`,boxShadow:sh(C.yellow,3,3),marginBottom:14}}>
            <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,marginBottom:6}}>✏️ Minha anotação</h2>
            <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,lineHeight:1.7,fontStyle:"italic"}}>"{livro.descricaoUsuario}"</p>
          </div>
        )}

        {eMeu
          ? <div style={{background:livro.disponivel?C.green:"#DFE6E9",borderRadius:20,padding:"16px 18px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),display:"flex",alignItems:"center",gap:14}}><span aria-hidden="true" style={{fontSize:36}}>{livro.disponivel?"📚":"📤"}</span><div><p style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:C.navy}}>{livro.disponivel?"Está na sua estante!": `Emprestado para ${amId(livro.emprestadoPara)?.nome} ${amId(livro.emprestadoPara)?.emoji}`}</p></div></div>
          : doEmp
            ? (()=>{const e=EMPR_BASE.find(x=>x.titulo===livro.titulo)||EMPR_BASE[0];const d=diasR(e.venc);const b=pTag(d);const am=amId(e.deAmigo);return(<div style={{background:b.bg,borderRadius:20,padding:"16px 18px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy)}}><p style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:b.tx}}>⏰ {b.label}</p><p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:b.tx,opacity:.9,marginTop:4}}>Emprestado de {am?.nome} {am?.emoji}</p></div>);})()
            : <div style={{background:livro.disponivel?C.green:"#E0E0E0",borderRadius:20,padding:"16px 18px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),display:"flex",alignItems:"center",gap:14}}><span aria-hidden="true" style={{fontSize:36}}>{livro.disponivel?"🎉":"😔"}</span><div><p style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:C.navy}}>{livro.disponivel?"Disponível para pegar!":"Ocupado agora..."}</p></div></div>
        }
      </div>

      {!eMeu&&!doEmp&&livro.disponivel&&(
        <div style={{position:"fixed",bottom:76,left:"50%",transform:"translateX(-50%)",width:390,padding:"12px 20px",background:C.cream,borderTop:`3px solid ${C.navy}`}}>
          <button onClick={()=>setEnviado(true)} disabled={enviado} aria-pressed={enviado} style={{width:"100%",background:enviado?C.green:C.coral,color:enviado?C.navy:C.white,border:`3px solid ${C.navy}`,borderRadius:20,padding:"16px",fontFamily:"'Fredoka One',cursive",fontSize:20,cursor:enviado?"default":"pointer",boxShadow:enviado?"none":shB(),minHeight:56}}>
            {enviado?"🎉 Pedido Enviado!":"📬 Pedir para Pegar!"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── MODAL ADICIONAR LIVRO ── */
function ModalLivro({aoSalvar,aoFechar,totalLivros}) {
  const [f,setF]=useState({titulo:"",autor:"",descricaoUsuario:"",capa:null,prev:null});
  const [err,setErr]=useState("");
  const ref=useRef();
  const inpRef=useRef();
  useEffect(()=>{setTimeout(()=>ref.current?.focus(),60);},[]);
  const onArq=e=>{
    const a=e.target.files[0];
    if(!a)return;
    if(!a.type.startsWith("image/")){setErr("Escolha uma imagem (JPG, PNG...)");return;}
    if(a.size>5*1024*1024){setErr("Imagem deve ter menos de 5MB");return;}
    setErr("");
    const r=new FileReader();
    r.onload=ev=>setF(p=>({...p,capa:ev.target.result,prev:ev.target.result}));
    r.readAsDataURL(a);
  };
  const tipos=["av","fa","cl","en","an","tr"];
  const bgs=[C.orange,C.teal,C.yellow,C.green,C.lavender,C.pink];
  return (
    <div role="presentation" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={aoFechar}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="mt" tabIndex="-1" onClick={e=>e.stopPropagation()}
        style={{background:C.cream,borderRadius:"28px 28px 0 0",padding:"22px 20px 46px",width:"100%",maxWidth:480,border:`3px solid ${C.navy}`,borderBottom:"none",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{textAlign:"center",marginBottom:6}}><Char tipo="an" size={80} label="Personagem animado"/></div>
        <h2 id="mt" style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,textAlign:"center",marginBottom:18}}>Adicionar um Livro!</h2>

        {/* Foto da capa */}
        <fieldset style={{border:`3px solid ${C.navy}`,borderRadius:18,padding:"14px",marginBottom:14}}>
          <legend style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,padding:"0 8px"}}>📸 Foto da Capa</legend>
          {f.prev
            ? <div style={{textAlign:"center"}}><img src={f.prev} alt="Pré-visualização da capa" style={{width:100,height:140,objectFit:"cover",borderRadius:10,border:`3px solid ${C.navy}`,boxShadow:sh(C.navy,3,4),display:"block",margin:"0 auto 10px"}}/><button onClick={()=>{setF(p=>({...p,capa:null,prev:null}));if(inpRef.current)inpRef.current.value="";}} aria-label="Remover foto" style={{background:"#FFE5E5",color:C.coral,border:`2px solid ${C.coral}`,borderRadius:12,padding:"8px 16px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",minHeight:44}}>✕ Remover</button></div>
            : <div><p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.7,marginBottom:8,textAlign:"center"}}>Adicione uma foto da capa (opcional)</p><label htmlFor="inp-capa"><span style={{display:"block",textAlign:"center",background:C.teal,color:C.navy,border:`3px solid ${C.navy}`,borderRadius:14,padding:"11px",fontFamily:"'Fredoka One',cursive",fontSize:15,cursor:"pointer",boxShadow:sh(C.navy,2,2)}}>📷 Escolher foto</span><input id="inp-capa" ref={inpRef} type="file" accept="image/*" onChange={onArq} style={{position:"absolute",width:1,height:1,opacity:0,overflow:"hidden"}}/></label>{err&&<p role="alert" style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.coral,textAlign:"center",marginTop:6}}>⚠️ {err}</p>}</div>
          }
        </fieldset>

        {/* Título */}
        <div style={{marginBottom:12}}>
          <label htmlFor="inp-titulo" style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,display:"block",marginBottom:5}}>Título do Livro <span aria-hidden="true" style={{color:C.coral}}>*</span></label>
          <input id="inp-titulo" type="text" value={f.titulo} onChange={e=>setF(p=>({...p,titulo:e.target.value}))} placeholder="ex: Harry Potter" aria-required="true" style={{width:"100%",border:`3px solid ${C.navy}`,borderRadius:14,padding:"12px 14px",fontSize:15,fontFamily:"'Boogaloo',cursive",outline:"none",boxSizing:"border-box",background:C.white,boxShadow:sh(C.navy,2,2),color:C.navy}}/>
        </div>
        {/* Autor */}
        <div style={{marginBottom:12}}>
          <label htmlFor="inp-autor" style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,display:"block",marginBottom:5}}>Autor</label>
          <input id="inp-autor" type="text" value={f.autor} onChange={e=>setF(p=>({...p,autor:e.target.value}))} placeholder="ex: J.K. Rowling" style={{width:"100%",border:`3px solid ${C.navy}`,borderRadius:14,padding:"12px 14px",fontSize:15,fontFamily:"'Boogaloo',cursive",outline:"none",boxSizing:"border-box",background:C.white,boxShadow:sh(C.navy,2,2),color:C.navy}}/>
        </div>
        {/* Anotação */}
        <div style={{marginBottom:18}}>
          <label htmlFor="inp-desc" style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,display:"block",marginBottom:4}}>✏️ Minha anotação</label>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,opacity:.6,marginBottom:5}}>O que você achou? Recomendaria?</p>
          <textarea id="inp-desc" value={f.descricaoUsuario} onChange={e=>setF(p=>({...p,descricaoUsuario:e.target.value}))} placeholder="ex: Adorei! Ri muito do começo ao fim 😂" rows={3} style={{width:"100%",border:`3px solid ${C.navy}`,borderRadius:14,padding:"12px 14px",fontSize:14,fontFamily:"'Boogaloo',cursive",outline:"none",boxSizing:"border-box",background:C.white,boxShadow:sh(C.navy,2,2),color:C.navy,resize:"vertical",lineHeight:1.6}}/>
          <p aria-live="polite" style={{fontFamily:"'Boogaloo',cursive",fontSize:11,color:C.navy,opacity:.5,textAlign:"right",marginTop:3}}>{f.descricaoUsuario.length} caracteres</p>
        </div>
        <button onClick={()=>{if(!f.titulo.trim())return;const idx=totalLivros%6;aoSalvar({id:"n"+Date.now(),titulo:f.titulo.trim(),autor:f.autor.trim(),tipo:tipos[idx],bgColor:bgs[idx],tagColor:C.coral,disponivel:true,genero:"Outros",paginas:"?",nota:5,descricao:"Um novo livro na sua estante!",descricaoUsuario:f.descricaoUsuario.trim(),capa:f.capa,amigosLendo:0});aoFechar();}} aria-label="Salvar livro" style={{width:"100%",background:C.coral,color:C.white,border:`3px solid ${C.navy}`,borderRadius:18,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:"pointer",boxShadow:shB(),minHeight:56,marginBottom:10}}>Salvar! 🎉</button>
        <button onClick={aoFechar} style={{width:"100%",background:"transparent",color:C.navy,border:`2px solid ${C.navy}`,borderRadius:18,padding:"10px",fontFamily:"'Fredoka One',cursive",fontSize:15,cursor:"pointer",minHeight:44}}>Cancelar</button>
      </div>
    </div>
  );
}

/* ── NOTIFICAÇÕES ── */
function Notifs({notifs,setNotifs}) {
  const naoLidas=notifs.filter(n=>!n.lida).length;
  const marcarTodas=()=>setNotifs(notifs.map(n=>({...n,lida:true})));
  const marcarUma=id=>setNotifs(notifs.map(n=>n.id===id?{...n,lida:true}:n));
  const excluir=id=>setNotifs(notifs.filter(n=>n.id!==id));
  return (
    <main id="cp" tabIndex="-1">
      <div style={{background:C.navy,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#2D3A42" size={150} style={{position:"absolute",right:-40,top:-50,opacity:.6}}/>
        <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.white}}>🔔 Notificações</h1><p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:"rgba(255,255,255,.8)",marginBottom:14}}>{naoLidas>0?`${naoLidas} não lida${naoLidas>1?"s":""}`:"Tudo em dia! ✨"}</p></div>
          {naoLidas>0&&<button onClick={marcarTodas} aria-label="Marcar todas como lidas" style={{background:C.yellow,color:C.navy,border:`3px solid ${C.white}`,borderRadius:14,padding:"8px 14px",fontFamily:"'Fredoka One',cursive",fontSize:12,cursor:"pointer",minHeight:44}}>✓ Todas lidas</button>}
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"4px 18px 100px"}}>
        {naoLidas>0&&<div role="status" aria-live="polite" style={{background:C.yellow,borderRadius:18,padding:"12px 16px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),display:"flex",alignItems:"center",gap:10,marginBottom:16}}><span aria-hidden="true" style={{fontSize:24}}>📬</span><p style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy}}>Você tem {naoLidas} notificação{naoLidas>1?"ões":""} nova{naoLidas>1?"s":""}!</p></div>}
        {["Não lidas","Lidas"].map(grupo=>{
          const lista=grupo==="Não lidas"?notifs.filter(n=>!n.lida):notifs.filter(n=>n.lida);
          if(!lista.length)return null;
          return(
            <section key={grupo} aria-label={`Notificações ${grupo.toLowerCase()}`}>
              <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy,marginBottom:10,marginTop:grupo==="Lidas"?18:0,opacity:grupo==="Lidas"?.6:1}}>{grupo==="Não lidas"?"📬 Novas":"📭 Antigas"}</h2>
              <ul style={{listStyle:"none",padding:0}}>
                {lista.map(n=>(
                  <li key={n.id} style={{marginBottom:10}}>
                    <div style={{background:n.lida?C.white:n.cor+"28",border:`3px solid ${n.lida?"#E0E0E0":n.cor}`,borderRadius:18,padding:"14px",boxShadow:n.lida?"none":sh(n.cor,3,3),opacity:n.lida?.75:1}}>
                      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div aria-hidden="true" style={{width:46,height:46,borderRadius:16,background:n.cor,border:`2.5px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:sh(C.navy,2,2)}}>{n.icone}</div>
                        <div style={{flex:1}}>
                          <p style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,lineHeight:1.2}}>{n.titulo}</p>
                          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.85,marginTop:3,lineHeight:1.5}}>{n.texto}</p>
                          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:11,color:C.navy,opacity:.5,marginTop:4}}>{n.tempo} atrás</p>
                        </div>
                        <button onClick={()=>excluir(n.id)} aria-label={`Remover: ${n.titulo}`} style={{background:"none",border:`2px solid #CCC`,borderRadius:10,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,color:"#999",minWidth:32}}>✕</button>
                      </div>
                      {!n.lida&&(
                        <div style={{display:"flex",gap:8,marginTop:12}}>
                          {(n.tipo==="pedido"||n.tipo==="amizade")&&<button onClick={()=>marcarUma(n.id)} aria-label="Aceitar" style={{flex:1,background:n.tipo==="pedido"?C.green:C.lavender,color:C.navy,border:`2.5px solid ${C.navy}`,borderRadius:12,padding:"9px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",boxShadow:sh(C.navy,2,2),minHeight:44}}>✓ {n.tipo==="pedido"?"Aceitar":"Aceitar amizade"}</button>}
                          {(n.tipo==="pedido"||n.tipo==="amizade")&&<button onClick={()=>marcarUma(n.id)} aria-label="Recusar" style={{flex:1,background:"#F0F0F0",color:C.navy,border:`2.5px solid ${C.navy}`,borderRadius:12,padding:"9px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",minHeight:44}}>✕ Recusar</button>}
                          {(n.tipo==="devolucao"||n.tipo==="atraso")&&<button onClick={()=>marcarUma(n.id)} aria-label="Entendido" style={{flex:1,background:C.yellow,color:C.navy,border:`2.5px solid ${C.navy}`,borderRadius:12,padding:"9px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",boxShadow:sh(C.navy,2,2),minHeight:44}}>✓ Entendido!</button>}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {!notifs.length&&<div style={{textAlign:"center",padding:"40px 20px"}}><Char tipo="an" size={120} label="Sem notificações"/><p style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,marginTop:16}}>Tudo limpo! 🎉</p></div>}
      </div>
    </main>
  );
}

/* ── INÍCIO ── */
function Inicio({nav,abrirLivro,emprestados}) {
  const atrasados=emprestados.filter(e=>diasR(e.venc)<0).length;
  return (
    <main id="cp" tabIndex="-1">
      <div style={{background:C.coral,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#FF6B81" size={180} style={{position:"absolute",top:-60,right:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:"rgba(255,255,255,.9)"}}>MANHÃ DE SÁBADO ☀️</p><h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:36,color:C.white,lineHeight:1.1}}>Olá, Mia! 👋</h1><p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:"rgba(255,255,255,.9)"}}>Pronta para ler algo incrível?</p></div>
            <div aria-hidden="true" style={{width:54,height:54,borderRadius:27,background:C.yellow,border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:sh(C.navy)}}>🦊</div>
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:10}}><Char tipo="an" size={140} label="Mascote BookBuddy comemorando"/></div>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"0 18px 24px"}}>
        {atrasados>0&&<div role="alert" style={{background:"#FFE5E5",borderRadius:18,padding:"14px 18px",border:`3px solid ${C.coral}`,boxShadow:shB(),display:"flex",alignItems:"center",gap:12,marginBottom:18}}><span aria-hidden="true" style={{fontSize:34}}>⚠️</span><div><p style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy}}>Livro em atraso!</p><p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy}}>Alice no País das Maravilhas venceu ontem!</p></div></div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:22}}>
          {[{n:LIVROS_BASE.length,l:"Meus Livros",bg:C.yellow,i:"📚"},{n:emprestados.length,l:"Emprestados",bg:C.teal,i:"📖"},{n:LIVROS_BASE.filter(l=>!l.disponivel).length,l:"Emprestei",bg:C.lavender,i:"🤝"}].map(s=>(
            <div key={s.l} style={{background:s.bg,borderRadius:18,padding:"14px 10px",textAlign:"center",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy)}}>
              <span aria-hidden="true" style={{fontSize:28,display:"block"}}>{s.i}</span>
              <span style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:C.navy,display:"block"}} aria-label={`${s.n} ${s.l}`}>{s.n}</span>
              <span style={{fontFamily:"'Boogaloo',cursive",fontSize:11,color:C.navy}} aria-hidden="true">{s.l}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy}}>📖 Lendo Agora</h2>
          <button onClick={()=>nav("emp")} style={{background:C.navy,color:C.white,border:"none",borderRadius:14,padding:"8px 16px",fontFamily:"'Fredoka One',cursive",fontSize:12,cursor:"pointer",minHeight:44}}>Ver tudo →</button>
        </div>
        {emprestados.map(e=>{const am=amId(e.deAmigo);const b=pTag(diasR(e.venc));return(
          <button key={e.id} onClick={()=>abrirLivro(e,false,true)} aria-label={`${e.titulo} de ${am?.nome} — ${b.label}`} style={{width:"100%",background:e.bgColor,borderRadius:20,padding:"14px 16px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),display:"flex",alignItems:"center",gap:12,marginBottom:10,cursor:"pointer",textAlign:"left",minHeight:80}}>
            <Capa livro={e} size={70}/><div style={{flex:1}}><p style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,lineHeight:1.2}}>{e.titulo}</p><p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,opacity:.75}}>de {am?.nome} {am?.emoji}</p></div>
            <span style={{background:b.bg,color:b.tx,borderRadius:12,padding:"5px 10px",fontFamily:"'Fredoka One',cursive",fontSize:11,border:`2px solid ${C.navy}`,flexShrink:0}} aria-hidden="true">{b.label}</span>
          </button>
        );})}
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,marginBottom:12,marginTop:8}}>👫 Amigos Leitores</h2>
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}}>
          {AMIGOS.filter(a=>!a.pendente).map(a=>(
            <button key={a.id} onClick={()=>nav("amigos")} aria-label={`${a.nome}, ${a.qtd} livros`} style={{background:a.cor,borderRadius:18,padding:"14px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),textAlign:"center",cursor:"pointer",minWidth:80,flexShrink:0,minHeight:44}}>
              <span aria-hidden="true" style={{fontSize:34,display:"block",marginBottom:4}}>{a.emoji}</span>
              <span style={{fontFamily:"'Fredoka One',cursive",fontSize:13,color:C.navy,display:"block"}}>{a.nome}</span>
              <span style={{fontFamily:"'Boogaloo',cursive",fontSize:10,color:C.navy,display:"block",opacity:.85}} aria-hidden="true">📚{a.qtd}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

/* ── MINHA BIBLIOTECA ── */
function Biblioteca({abrirLivro}) {
  const [livros,setLivros]=useState(LIVROS_BASE);
  const [busca,setBusca]=useState("");
  const [filtro,setFiltro]=useState("Todos");
  const [modal,setModal]=useState(false);
  const btnRef=useRef();
  const fechar=()=>{setModal(false);setTimeout(()=>btnRef.current?.focus(),50);};
  const generos=["Todos","Aventura","Fantasia","Clássico","Engraçado"];
  const filtrados=livros.filter(l=>(filtro==="Todos"||l.genero===filtro)&&(l.titulo.toLowerCase().includes(busca.toLowerCase())||(l.autor||"").toLowerCase().includes(busca.toLowerCase())));
  return (
    <main id="cp" tabIndex="-1">
      <div style={{background:C.teal,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#00B5B6" size={150} style={{position:"absolute",right:-30,top:-40,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}><h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>📚 Minha Biblioteca</h1><p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.9,marginBottom:16}}>{livros.length} livros na sua estante!</p></div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"4px 18px 24px"}}>
        <div style={{background:C.white,borderRadius:16,display:"flex",alignItems:"center",gap:10,padding:"10px 14px",marginBottom:12,border:`3px solid ${C.navy}`,boxShadow:sh(C.navy)}}>
          <label htmlFor="busca"><span aria-hidden="true" style={{fontSize:20}}>🔍</span><span style={{position:"absolute",left:"-9999px"}}>Buscar livros</span></label>
          <input id="busca" type="search" value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar meus livros..." style={{border:"none",background:"none",outline:"none",flex:1,fontSize:15,fontFamily:"'Boogaloo',cursive",color:C.navy}}/>
        </div>
        <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:14,paddingBottom:4}} role="group" aria-label="Filtrar por gênero">
          {generos.map(g=><button key={g} onClick={()=>setFiltro(g)} aria-pressed={filtro===g} style={{background:filtro===g?C.navy:C.white,color:filtro===g?C.white:C.navy,border:`2.5px solid ${C.navy}`,borderRadius:20,padding:"8px 16px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",whiteSpace:"nowrap",boxShadow:filtro===g?sh(C.navy,2,2):"none",minHeight:44}}>{g}</button>)}
        </div>
        <p role="status" aria-live="polite" style={{position:"absolute",left:"-9999px"}}>{filtrados.length} livros</p>
        <button ref={btnRef} onClick={()=>setModal(true)} aria-haspopup="dialog" style={{width:"100%",background:C.coral,color:C.white,border:`3px solid ${C.navy}`,borderRadius:20,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:"pointer",marginBottom:16,boxShadow:shB(),display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:56}}>➕ Adicionar Livro!</button>
        {modal&&<ModalLivro aoSalvar={l=>setLivros(p=>[...p,l])} aoFechar={fechar} totalLivros={livros.length}/>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}} role="list">
          {filtrados.map(livro=>(
            <button key={livro.id} role="listitem" onClick={()=>abrirLivro(livro,true,false)} aria-label={`${livro.titulo}${livro.autor?` por ${livro.autor}`:""} — ${livro.disponivel?"Disponível":"Emprestado"}`} style={{background:livro.bgColor,borderRadius:20,padding:"16px 14px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),cursor:"pointer",textAlign:"center",minHeight:44}}>
              <Capa livro={livro} size={90}/>
              <p style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,textAlign:"center",lineHeight:1.2,marginTop:8}}>{livro.titulo.length>22?livro.titulo.slice(0,22)+"…":livro.titulo}</p>
              <span style={{display:"inline-block",marginTop:8,background:livro.disponivel?C.green:C.orange,color:C.navy,borderRadius:10,padding:"3px 10px",fontFamily:"'Fredoka One',cursive",fontSize:10,border:`2px solid ${C.navy}`}} aria-hidden="true">{livro.disponivel?"✓ LIVRE":"📤 EMPRESTADO"}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

/* ── EMPRESTADOS ── */
function Emprestados({abrirLivro,emprestados}) {
  return (
    <main id="cp" tabIndex="-1">
      <div style={{background:C.orange,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#FFBE76" size={160} style={{position:"absolute",right:-30,top:-40,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}><h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>📖 Lendo Agora</h1><p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.9,marginBottom:16}}>Não esqueça de devolver 😅</p></div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"4px 18px 100px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          {[{n:emprestados.length,l:"Lendo",bg:C.orange,i:"📖"},{n:emprestados.filter(e=>diasR(e.venc)<0).length,l:"Atrasado",bg:C.coral,i:"⏰"},{n:emprestados.filter(e=>{const d=diasR(e.venc);return d>=0&&d<=3}).length,l:"Vence Breve",bg:C.yellow,i:"⚡"}].map(s=>(
            <div key={s.l} style={{background:s.bg,borderRadius:18,padding:"12px 8px",textAlign:"center",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy)}}>
              <span aria-hidden="true" style={{fontSize:22,display:"block"}}>{s.i}</span>
              <span style={{fontFamily:"'Fredoka One',cursive",fontSize:26,color:C.navy,display:"block"}} aria-label={`${s.n} ${s.l}`}>{s.n}</span>
              <span style={{fontFamily:"'Boogaloo',cursive",fontSize:10,color:C.navy}} aria-hidden="true">{s.l}</span>
            </div>
          ))}
        </div>
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:12}}>Livros que Peguei</h2>
        {emprestados.map(e=>{const am=amId(e.deAmigo);const b=pTag(diasR(e.venc));return(
          <button key={e.id} onClick={()=>abrirLivro(e,false,true)} aria-label={`${e.titulo} de ${am?.nome} — ${b.label}`} style={{width:"100%",background:e.bgColor,borderRadius:20,padding:"16px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),marginBottom:14,cursor:"pointer",textAlign:"left",minHeight:80}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}><Capa livro={e} size={72}/><div style={{flex:1}}><p style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy,lineHeight:1.2}}>{e.titulo}</p><p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,opacity:.8,marginTop:4}}>{am?.emoji} de {am?.nome}</p><span style={{display:"inline-block",marginTop:8,background:b.bg,color:b.tx,borderRadius:12,padding:"4px 12px",fontFamily:"'Fredoka One',cursive",fontSize:12,border:`2px solid ${C.navy}`}} aria-hidden="true">{b.label}</span></div></div>
          </button>
        );})}
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:12,marginTop:4}}>Livros que Emprestei</h2>
        {LIVROS_BASE.filter(l=>!l.disponivel).map(livro=>{const am=amId(livro.emprestadoPara);return(
          <button key={livro.id} onClick={()=>abrirLivro(livro,true,false)} aria-label={`${livro.titulo} com ${am?.nome}`} style={{width:"100%",background:livro.bgColor,borderRadius:20,padding:"14px 16px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),marginBottom:12,display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left",minHeight:80}}>
            <Capa livro={livro} size={60}/><div style={{flex:1}}><p style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy}}>{livro.titulo}</p><p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>{am?.emoji} {am?.nome} tem agora</p></div>
            <button onClick={e=>e.stopPropagation()} aria-label={`Lembrar ${am?.nome}`} style={{background:C.yellow,border:`2.5px solid ${C.navy}`,borderRadius:12,padding:"10px 14px",fontFamily:"'Fredoka One',cursive",fontSize:12,cursor:"pointer",boxShadow:sh(C.navy,2,2),minWidth:44,minHeight:44}}>🔔 Lembrar</button>
          </button>
        );})}
      </div>
    </main>
  );
}

/* ── MODAL ADICIONAR AMIGO POR EMAIL ── */
function ModalAdicionarAmigo({aoFechar}) {
  const [email,setEmail]=useState("");
  const [erro,setErro]=useState("");
  const [etapa,setEtapa]=useState("form"); // "form" | "enviado"
  const [emailsEnviados,setEmailsEnviados]=useState([]);
  const ref=useRef();
  const inputRef=useRef();
  useEffect(()=>{setTimeout(()=>{ref.current?.focus();},60);},[]);

  const emailValido=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const enviar=()=>{
    const e=email.trim();
    if(!e){setErro("Por favor, digite um e-mail.");return;}
    if(!emailValido(e)){setErro("Esse e-mail não parece válido. Tente novamente!");return;}
    setErro("");
    setEmailsEnviados(prev=>[...prev,e]);
    setEtapa("enviado");
  };

  const enviarOutro=()=>{
    setEmail("");
    setErro("");
    setEtapa("form");
    setTimeout(()=>inputRef.current?.focus(),60);
  };

  return(
    <div role="presentation" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={aoFechar}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="ma-titulo" tabIndex="-1"
        onClick={e=>e.stopPropagation()}
        style={{background:C.cream,borderRadius:"28px 28px 0 0",padding:"0",width:"100%",maxWidth:480,border:`3px solid ${C.navy}`,borderBottom:"none"}}>

        {/* Héro colorido do modal */}
        <div style={{background:C.lavender,borderRadius:"25px 25px 0 0",padding:"24px 20px 0",position:"relative",overflow:"hidden",textAlign:"center"}}>
          <Blob color={C.white} size={160} style={{position:"absolute",right:-40,top:-50,opacity:0.15}}/>
          <div style={{position:"relative",zIndex:1}}>
            <Char tipo="an" size={100} label="Personagem animado convidando amigo"/>
            <h2 id="ma-titulo" style={{fontFamily:"'Fredoka One',cursive",fontSize:24,color:C.navy,marginTop:4,marginBottom:4}}>
              {etapa==="enviado" ? "Convite Enviado! 🎉" : "Convidar Amigo Leitor"}
            </h2>
            <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:0.8,marginBottom:18}}>
              {etapa==="enviado" ? "Aguardando o amigo aceitar..." : "Digite o e-mail do seu amigo para convidá-lo"}
            </p>
          </div>
          <Wave color={C.cream}/>
        </div>

        <div style={{padding:"16px 20px 40px"}}>
          {etapa==="form" ? (
            <>
              {/* Explicação */}
              <div style={{background:C.teal+"33",borderRadius:16,padding:"12px 16px",border:`3px solid ${C.teal}`,marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span aria-hidden="true" style={{fontSize:22,flexShrink:0}}>📧</span>
                <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,lineHeight:1.6}}>
                  Vamos mandar um e-mail para o seu amigo com um convite para entrar no BookBuddy. Quando ele aceitar, vocês serão Amigos Leitores!
                </p>
              </div>

              {/* Campo de e-mail */}
              <div style={{marginBottom:6}}>
                <label htmlFor="inp-email" style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,display:"block",marginBottom:8}}>
                  E-mail do amigo <span aria-hidden="true" style={{color:C.coral}}>*</span>
                </label>
                <div style={{background:C.white,borderRadius:16,display:"flex",alignItems:"center",gap:10,padding:"4px 4px 4px 14px",border:`3px solid ${erro?C.coral:C.navy}`,boxShadow:sh(erro?C.coral:C.navy),transition:"all 0.2s"}}>
                  <span aria-hidden="true" style={{fontSize:20,flexShrink:0}}>✉️</span>
                  <input ref={inputRef} id="inp-email" type="email" value={email}
                    onChange={e=>{setEmail(e.target.value);if(erro)setErro("");}}
                    onKeyDown={e=>{if(e.key==="Enter")enviar();}}
                    placeholder="amigo@email.com"
                    aria-required="true"
                    aria-invalid={!!erro}
                    aria-describedby={erro?"erro-email":"dica-email"}
                    autoComplete="email"
                    style={{border:"none",background:"none",outline:"none",flex:1,fontSize:16,fontFamily:"'Boogaloo',cursive",color:C.navy,padding:"10px 0"}}/>
                  {email&&(
                    <button onClick={()=>{setEmail("");setErro("");inputRef.current?.focus();}}
                      aria-label="Limpar e-mail"
                      style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#999",padding:"8px",minWidth:40,minHeight:40}}>✕</button>
                  )}
                </div>
                {/* Erro ou dica */}
                {erro
                  ? <p id="erro-email" role="alert" style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.coral,marginTop:6,display:"flex",alignItems:"center",gap:4}}>
                      <span aria-hidden="true">⚠️</span> {erro}
                    </p>
                  : <p id="dica-email" style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,opacity:0.55,marginTop:5}}>
                      Seu amigo receberá um convite por e-mail para instalar o BookBuddy.
                    </p>
                }
              </div>

              {/* Histórico de convites já enviados nessa sessão */}
              {emailsEnviados.length>0&&(
                <div style={{background:"#F0F0F0",borderRadius:14,padding:"12px 14px",marginTop:14,marginBottom:4}}>
                  <p style={{fontFamily:"'Fredoka One',cursive",fontSize:13,color:C.navy,marginBottom:8}}>✅ Convites enviados nessa sessão:</p>
                  <ul style={{listStyle:"none",padding:0}}>
                    {emailsEnviados.map((e,i)=>(
                      <li key={i} style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,padding:"4px 0",borderTop:i>0?"1px solid #DDD":"none",display:"flex",alignItems:"center",gap:6}}>
                        <span aria-hidden="true" style={{color:C.green}}>✓</span> {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botões */}
              <button onClick={enviar}
                aria-label="Enviar convite por e-mail"
                style={{width:"100%",background:C.lavender,color:C.navy,border:`3px solid ${C.navy}`,borderRadius:18,padding:"16px",fontFamily:"'Fredoka One',cursive",fontSize:20,cursor:"pointer",boxShadow:shB(),minHeight:56,marginTop:18}}>
                📨 Enviar Convite!
              </button>
              <button onClick={aoFechar}
                style={{width:"100%",background:"transparent",color:C.navy,border:`2px solid ${C.navy}`,borderRadius:18,padding:"10px",fontFamily:"'Fredoka One',cursive",fontSize:15,cursor:"pointer",minHeight:44,marginTop:10}}>
                Cancelar
              </button>
            </>
          ) : (
            /* ─ Estado de sucesso ─ */
            <>
              {/* Card de confirmação */}
              <div role="status" aria-live="polite" style={{background:C.green,borderRadius:20,padding:"20px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),textAlign:"center",marginBottom:16}}>
                <p style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,marginBottom:6}}>🎉 Convite enviado!</p>
                <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:0.85,lineHeight:1.5}}>
                  Mandamos um convite para
                </p>
                <p style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy,background:"rgba(255,255,255,0.5)",borderRadius:10,padding:"8px 12px",marginTop:8,wordBreak:"break-all"}}>
                  ✉️ {emailsEnviados[emailsEnviados.length-1]}
                </p>
              </div>

              {/* Próximos passos */}
              <div style={{background:C.white,borderRadius:18,padding:"16px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),marginBottom:16}}>
                <p style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,marginBottom:10}}>O que acontece agora? 🤔</p>
                {[
                  {n:"1", t:"Seu amigo recebe o e-mail", d:"com um link para instalar o BookBuddy", bg:C.yellow},
                  {n:"2", t:"Ele cria uma conta", d:"com o mesmo e-mail que você usou aqui", bg:C.teal},
                  {n:"3", t:"Vocês se tornam Amigos Leitores!", d:"e podem ver e trocar livros 📚", bg:C.green},
                ].map(p=>(
                  <div key={p.n} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:10}}>
                    <div style={{width:32,height:32,borderRadius:10,background:p.bg,border:`2.5px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy,flexShrink:0,boxShadow:sh(C.navy,2,2)}}>
                      {p.n}
                    </div>
                    <div>
                      <p style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy}}>{p.t}</p>
                      <p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,opacity:0.7}}>{p.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ações */}
              <button onClick={enviarOutro}
                aria-label="Convidar outro amigo"
                style={{width:"100%",background:C.lavender,color:C.navy,border:`3px solid ${C.navy}`,borderRadius:18,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:"pointer",boxShadow:shB(),minHeight:56,marginBottom:10}}>
                👥 Convidar outro amigo
              </button>
              <button onClick={aoFechar}
                style={{width:"100%",background:"transparent",color:C.navy,border:`2px solid ${C.navy}`,borderRadius:18,padding:"10px",fontFamily:"'Fredoka One',cursive",fontSize:15,cursor:"pointer",minHeight:44}}>
                Fechar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── AMIGOS ── */
function Amigos({abrirLivro}) {
  const [sel,setSel]=useState(null);
  const [modalAmigo,setModalAmigo]=useState(false);
  const btnAddRef=useRef();
  if(sel){const la=LIV_AMIGOS[sel.id]||[];return(
    <main id="cp" tabIndex="-1">
      <div style={{background:sel.cor,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <button onClick={()=>setSel(null)} aria-label="Voltar" style={{background:C.navy,color:C.white,border:"none",borderRadius:16,padding:"10px 20px",fontFamily:"'Fredoka One',cursive",fontSize:14,cursor:"pointer",marginBottom:12,minHeight:44}}>← Voltar</button>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}><span aria-hidden="true" style={{fontSize:54}}>{sel.emoji}</span><div><h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:26,color:C.navy}}>Biblioteca de {sel.nome}</h1><p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>🔒 Só você consegue ver!</p></div></div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"8px 18px 24px"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {la.map(livro=><button key={livro.id} onClick={()=>abrirLivro(livro,false,false)} aria-label={`${livro.titulo} — ${livro.disponivel?"Disponível":"Indisponível"}`} style={{background:livro.bgColor,borderRadius:20,padding:"14px 12px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),cursor:"pointer",textAlign:"center",minHeight:44}}><Capa livro={livro} size={80}/><p style={{fontFamily:"'Fredoka One',cursive",fontSize:13,color:C.navy,textAlign:"center",marginTop:6,lineHeight:1.2}}>{livro.titulo.length>22?livro.titulo.slice(0,22)+"…":livro.titulo}</p><span style={{display:"inline-block",marginTop:8,background:livro.disponivel?C.green:C.orange,color:C.navy,borderRadius:10,padding:"3px 10px",fontFamily:"'Fredoka One',cursive",fontSize:10,border:`2px solid ${C.navy}`}} aria-hidden="true">{livro.disponivel?"LIVRE":"Ocupado"}</span></button>)}
      </div></div>
    </main>
  );}
  return (
    <main id="cp" tabIndex="-1">
      <div style={{background:C.lavender,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#BDB2FF" size={160} style={{position:"absolute",right:-40,top:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}><h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>👫 Amigos Leitores</h1><p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.85,marginBottom:16}}>Só amigos veem sua biblioteca 🔒</p></div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"4px 18px 24px"}}>
        <div style={{background:C.green,borderRadius:18,padding:"14px 18px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),display:"flex",alignItems:"center",gap:12,marginBottom:18}}><span aria-hidden="true" style={{fontSize:34}}>🔒</span><div><p style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy}}>Sua biblioteca está segura!</p><p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,opacity:.85}}>Somente seus Amigos Leitores podem ver e pegar seus livros.</p></div></div>
        <button ref={btnAddRef} onClick={()=>setModalAmigo(true)} aria-haspopup="dialog" style={{width:"100%",background:C.lavender,color:C.navy,border:`3px solid ${C.navy}`,borderRadius:20,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:"pointer",marginBottom:20,boxShadow:shB(),display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:56}}>➕ Adicionar Amigo Leitor!</button>
        {modalAmigo&&<ModalAdicionarAmigo aoFechar={()=>{setModalAmigo(false);setTimeout(()=>btnAddRef.current?.focus(),50);}}/>}
        {AMIGOS.filter(a=>a.pendente).length>0&&(<section aria-label="Pedidos pendentes"><h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy,marginBottom:10}}>⏳ Esperando por você!</h2>{AMIGOS.filter(a=>a.pendente).map(a=><div key={a.id} style={{background:a.cor,borderRadius:20,padding:"14px 16px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),marginBottom:12,display:"flex",alignItems:"center",gap:14}}><span aria-hidden="true" style={{fontSize:48}}>{a.emoji}</span><div style={{flex:1}}><p style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy}}>{a.nome}</p><p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,opacity:.8}}>Quer ser seu Amigo Leitor!</p></div><div style={{display:"flex",gap:8}}><button aria-label={`Aceitar ${a.nome}`} style={{background:C.green,border:`2.5px solid ${C.navy}`,color:C.navy,borderRadius:12,padding:"10px 16px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",minWidth:44,minHeight:44}}>✓</button><button aria-label={`Recusar ${a.nome}`} style={{background:C.white,border:`2.5px solid ${C.navy}`,color:C.navy,borderRadius:12,padding:"10px 14px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",minWidth:44,minHeight:44}}>✕</button></div></div>)}</section>)}
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy,marginBottom:12}}>Meus Amigos Leitores 🌟</h2>
        {AMIGOS.filter(a=>!a.pendente).map(a=><button key={a.id} onClick={()=>setSel(a)} aria-label={`Ver biblioteca de ${a.nome}, ${a.qtd} livros`} style={{width:"100%",background:a.cor,borderRadius:20,padding:"16px 18px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),display:"flex",alignItems:"center",gap:14,marginBottom:12,cursor:"pointer",textAlign:"left",minHeight:80}}><span aria-hidden="true" style={{fontSize:50}}>{a.emoji}</span><div style={{flex:1}}><p style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy}}>{a.nome}</p><p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>📚 {a.qtd} livros para explorar!</p></div><span style={{background:C.navy,color:C.white,borderRadius:14,padding:"10px 16px",fontFamily:"'Fredoka One',cursive",fontSize:13}} aria-hidden="true">Ver →</span></button>)}
      </div>
    </main>
  );
}

/* ── PERFIL ── */
function Perfil() {
  const [n,setN]=useState(true);const[p,setP]=useState(true);
  const Tog=({v,onChange,id,rot})=><button id={id} role="switch" aria-checked={v} onClick={()=>onChange(!v)} aria-label={rot} style={{width:50,height:28,borderRadius:14,background:v?C.teal:"#999",position:"relative",cursor:"pointer",border:`2.5px solid ${C.navy}`,transition:"background .2s",boxShadow:sh(C.navy,1,2),flexShrink:0,minWidth:44,minHeight:44,display:"flex",alignItems:"center"}}><span style={{width:20,height:20,borderRadius:10,background:C.white,position:"absolute",top:2,left:v?24:2,transition:"left .2s",border:`1.5px solid ${C.navy}`}}/></button>;
  return (
    <main id="cp" tabIndex="-1">
      <div style={{background:C.pink,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#FD91B8" size={170} style={{position:"absolute",right:-40,top:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center"}}><span aria-hidden="true" style={{fontSize:68,display:"block"}}>🦊</span><h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>Mia</h1><p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:.85,marginBottom:12}}>📚 {LIVROS_BASE.length} livros · 👫 {AMIGOS.filter(a=>!a.pendente).length} amigos</p></div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"4px 18px 100px"}}>
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:12}}>📊 Minhas Estatísticas</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22}}>
          {[{l:"Livros Lidos",v:"7",i:"📖",bg:C.yellow},{l:"Compartilhados",v:"12",i:"🤝",bg:C.teal},{l:"Gênero Favorito",v:"Fantasia",i:"⚡",bg:C.lavender},{l:"Nível",v:"⭐ Estrela",i:"🏆",bg:C.orange}].map(s=><div key={s.l} style={{background:s.bg,borderRadius:18,padding:"14px",textAlign:"center",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy)}}><span aria-hidden="true" style={{fontSize:28,display:"block"}}>{s.i}</span><span style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,display:"block"}} aria-label={`${s.l}: ${s.v}`}>{s.v}</span><span style={{fontFamily:"'Boogaloo',cursive",fontSize:11,color:C.navy}} aria-hidden="true">{s.l}</span></div>)}
        </div>
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:12}}>⚙️ Configurações</h2>
        <div style={{background:C.white,borderRadius:20,border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),overflow:"hidden",marginBottom:14}}>
          {[{id:"tn",l:"Notificações",s:"Atualizações sobre seus livros",v:n,fn:setN},{id:"tp",l:"Modo Pais 👨‍👩‍👧",s:"Pais revisam pedidos de amizade",v:p,fn:setP}].map((it,i)=><div key={it.id} style={{padding:"16px 18px",borderTop:i>0?"2px solid #F0F0F0":"none",display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><label htmlFor={it.id} style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,display:"block"}}>{it.l}</label><p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:"#636E72",marginTop:2}}>{it.s}</p></div><Tog id={it.id} v={it.v} onChange={it.fn} rot={it.l}/></div>)}
        </div>
        <div style={{background:C.white,borderRadius:20,border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),overflow:"hidden"}}>
          {["Configurações de Privacidade 🔒","Bloquear um Amigo Leitor","Ajuda e Suporte 🆘"].map((it,i)=><button key={it} style={{width:"100%",padding:"16px 18px",borderTop:i>0?"2px solid #F0F0F0":"none",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer",minHeight:56,fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,textAlign:"left"}}>{it}<span aria-hidden="true" style={{color:"#B2BEC3"}}>→</span></button>)}
        </div>
        <div style={{height:16}}/>
        <button style={{width:"100%",background:C.coral,color:C.white,border:`3px solid ${C.navy}`,borderRadius:20,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:"pointer",boxShadow:shB(),minHeight:56}}>👋 Sair</button>
      </div>
    </main>
  );
}

/* ── ROOT ── */
const NAV=[{id:"inicio",icon:"🏠",label:"Início"},{id:"bib",icon:"📚",label:"Meus Livros"},{id:"emp",icon:"📖",label:"Lendo"},{id:"amigos",icon:"👫",label:"Amigos"},{id:"perfil",icon:"🦊",label:"Eu"}];

export default function App() {
  const [tela,setTela]=useState("inicio");
  const [det,setDet]=useState(null);
  const [notifs,setNotifs]=useState(NOTIF_BASE);
  const emprestados=EMPR_BASE;
  const naoLidas=notifs.filter(n=>!n.lida).length;
  const nav=t=>{setDet(null);setTela(t);};
  const abrirLivro=(l,eMeu,doEmp)=>setDet({l,eMeu,doEmp});
  const fecharDet=()=>setDet(null);

  const telas={inicio:<Inicio nav={nav} abrirLivro={abrirLivro} emprestados={emprestados}/>,bib:<Biblioteca abrirLivro={abrirLivro}/>,emp:<Emprestados abrirLivro={abrirLivro} emprestados={emprestados}/>,amigos:<Amigos abrirLivro={abrirLivro}/>,perfil:<Perfil/>,notif:<Notifs notifs={notifs} setNotifs={setNotifs}/>};

  return(
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Boogaloo&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{display:none;}*:focus-visible{outline:3px solid #1A2025;outline-offset:3px;border-radius:8px;box-shadow:0 0 0 5px #FFD93D;}.skip{position:absolute;top:-100px;left:16px;background:#1A2025;color:#FFD93D;padding:10px 20px;border-radius:0 0 14px 14px;font-family:'Fredoka One',cursive;font-size:15px;z-index:9999;text-decoration:none;transition:top .15s;}.skip:focus{top:0;}`}</style>
      <div lang="pt-BR" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#1A2025",padding:16}}>
        {[{c:C.coral,t:"5%",l:"-3%"},{c:C.yellow,t:"40%",l:"-2%"},{c:C.teal,t:"75%",l:"-3%"},{c:C.lavender,t:"10%",r:"-3%"},{c:C.green,t:"50%",r:"-2%"},{c:C.pink,t:"80%",r:"-3%"}].map((b,i)=><div key={i} aria-hidden="true" style={{position:"fixed",width:120,height:120,borderRadius:"50%",background:b.c,opacity:.15,top:b.t,left:b.l||"auto",right:b.r||"auto",pointerEvents:"none"}}/>)}
        <div style={{width:390,height:844,background:C.cream,borderRadius:50,boxShadow:"0 0 0 10px #111,0 0 0 12px #333,0 50px 120px rgba(0,0,0,.8)",overflow:"hidden",position:"relative",display:"flex",flexDirection:"column"}}>
          <a href="#cp" className="skip">Pular para o conteúdo principal</a>
          {/* Status bar */}
          <div style={{height:48,background:C.cream,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",flexShrink:0,position:"relative"}} aria-hidden="true">
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:13,color:C.navy}}>9:41</span>
            <div style={{width:110,height:26,background:C.navy,borderRadius:20,position:"absolute",left:"50%",transform:"translateX(-50%)"}}/>
            <span style={{fontSize:13}}>📶🔋</span>
          </div>
          {/* App header */}
          {!det&&(
            <div style={{padding:"8px 18px 10px",background:C.cream,flexShrink:0,borderBottom:`3px solid ${C.navy}`,display:"flex",alignItems:"center",gap:10}}>
              <div aria-hidden="true" style={{width:40,height:40,borderRadius:14,background:C.coral,border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:sh(C.navy,2,2)}}>📚</div>
              <div><p style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,lineHeight:1}}>BookBuddy</p><p style={{fontFamily:"'Boogaloo',cursive",fontSize:10,color:"#636E72"}}>Seu cantinho da leitura 🌟</p></div>
              <button onClick={()=>nav("notif")} aria-label={naoLidas>0?`Notificações — ${naoLidas} nova${naoLidas>1?"s":""}`:"Notificações"} style={{marginLeft:"auto",position:"relative",width:44,height:44,borderRadius:14,background:naoLidas>0?C.yellow:C.white,border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:sh(C.navy,2,2),fontSize:20,minWidth:44,minHeight:44}}>
                🔔{naoLidas>0&&<span aria-hidden="true" style={{position:"absolute",top:-6,right:-6,minWidth:20,height:20,background:C.coral,borderRadius:10,border:`2px solid ${C.cream}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fredoka One',cursive",fontSize:10,color:C.white,padding:"0 4px"}}>{naoLidas}</span>}
              </button>
            </div>
          )}
          {/* Screen */}
          <div style={{flex:1,overflowY:"auto",position:"relative"}}>
            {det?<Detalhe livro={det.l} eMeu={det.eMeu} doEmp={det.doEmp} onVoltar={fecharDet}/>:telas[tela]}
          </div>
          {/* Bottom nav */}
          <nav role="navigation" aria-label="Navegação principal" style={{height:76,background:C.white,flexShrink:0,borderTop:`3px solid ${C.navy}`,display:"flex",alignItems:"center",padding:"0 8px 6px"}}>
            {NAV.map(item=>{const a=tela===item.id&&!det;return(
              <button key={item.id} onClick={()=>{setDet(null);setTela(item.id);}} aria-label={item.label} aria-current={a?"page":undefined} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 2px",minHeight:44}}>
                <span aria-hidden="true" style={{width:a?50:38,height:a?50:38,borderRadius:a?18:14,background:a?C.coral:"transparent",border:a?`3px solid ${C.navy}`:"3px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:a?26:20,transition:"all .15s",boxShadow:a?sh(C.navy,2,3):"none"}}>{item.icon}</span>
                <span style={{fontFamily:"'Fredoka One',cursive",fontSize:10,color:a?C.coral:"#6B6B6B"}}>{item.label}</span>
              </button>
            );})}
          </nav>
        </div>
      </div>
    </>
  );
}
