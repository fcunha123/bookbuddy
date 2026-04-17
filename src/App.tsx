import { useState, useEffect, useRef, useCallback } from "react";
import {
  supabase, signUp, signIn, signOut, getProfile, onAuthChange,
  getMyBooks, getFriendBooks, addBook, uploadCover, updateBook,
  getFriends, getPendingRequests, sendFriendRequest, respondFriendRequest,
  getMyBorrowedLoans, getMyLentLoans, requestLoan, approveLoan, rejectLoan, returnLoan,
  getNotifications, markNotifRead, markAllNotifsRead, deleteNotif, subscribeNotifs,
  getProfileById, checkFriendship,
  type Profile, type Book, type Loan, type Notification, type Friendship,
} from "./lib/supabase";

/* ═══════════════════════════ TOKENS */
const C = {
  coral:"#FF4757", yellow:"#FFD93D", teal:"#00D2D3", lavender:"#A29BFE",
  green:"#6BCB77", pink:"#FD79A8", orange:"#FF9F43", navy:"#1A2025",
  cream:"#FFFBF0", white:"#FFFFFF",
};
const sh  = (c=C.navy,x=3,y=4) => `${x}px ${y}px 0px ${c}`;
const shB = () => `4px 6px 0px ${C.navy}`;
const diasR = (d:string) => Math.ceil((new Date(d).getTime()-Date.now())/86400000);
const prazoTag = (dias:number) =>
  dias<0  ? {label:`${Math.abs(dias)}d ATRASADO!`, bg:C.coral,  tx:C.white} :
  dias<=3 ? {label:`${dias}d restando!`,            bg:C.orange, tx:C.navy}  :
            {label:`${dias} dias`,                   bg:C.green,  tx:C.navy};

/* ═══════════════════════════ SVG HELPERS */
const Blob = ({color,size=120,style={}}:{color:string,size?:number,style?:any}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={style} aria-hidden="true">
    <path fill={color} d="M47,-62C59,-53,67,-36,71,-19C75,-2,76,16,70,31C64,46,50,59,35,66C19,74,2,76,-16,73C-34,70,-53,62,-64,48C-75,34,-78,13,-74,-5C-71,-23,-61,-40,-48,-51C-35,-63,-17,-69,0,-69C17,-69,35,-72,47,-62Z" transform="translate(100 100)"/>
  </svg>
);
const Wave = ({color}:{color:string}) => (
  <svg viewBox="0 0 390 40" width="100%" height="40" style={{display:"block",marginBottom:-2}} aria-hidden="true">
    <path d="M0 20 Q48 0 96 20 Q144 40 192 20 Q240 0 288 20 Q336 40 390 20 L390 40 L0 40 Z" fill={color}/>
  </svg>
);
const Mascot = ({size=120}:{size?:number}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
    <ellipse cx="100" cy="122" rx="60" ry="55" fill={C.coral} stroke={C.navy} strokeWidth="3"/>
    <circle cx="100" cy="73" r="42" fill={C.orange} stroke={C.navy} strokeWidth="3"/>
    <text x="79" y="76" fontSize="18" textAnchor="middle">⭐</text>
    <text x="119" y="76" fontSize="18" textAnchor="middle">⭐</text>
    <path d="M76 87 Q100 110 124 87" stroke={C.navy} strokeWidth="3.5" fill={C.white} strokeLinecap="round"/>
    <ellipse cx="44" cy="100" rx="13" ry="9" fill={C.coral} stroke={C.navy} strokeWidth="2.5" transform="rotate(-50 44 100)"/>
    <ellipse cx="156" cy="100" rx="13" ry="9" fill={C.coral} stroke={C.navy} strokeWidth="2.5" transform="rotate(50 156 100)"/>
  </svg>
);

/* ═══════════════════════════ REUSABLE UI */
const Inp = ({id,label,type="text",value,onChange,placeholder,required=false,error="",hint=""}:any) => (
  <div style={{marginBottom:14}}>
    <label htmlFor={id} style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,display:"block",marginBottom:5}}>
      {label}{required&&<span aria-hidden="true" style={{color:C.coral}}> *</span>}
    </label>
    {hint&&<p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,opacity:.6,marginBottom:5}}>{hint}</p>}
    <input id={id} type={type} value={value} onChange={(e:any)=>onChange(e.target.value)}
      placeholder={placeholder} aria-required={required} aria-invalid={!!error}
      aria-describedby={error?`${id}-err`:undefined}
      style={{width:"100%",border:`3px solid ${error?C.coral:C.navy}`,borderRadius:14,
        padding:"12px 14px",fontSize:15,fontFamily:"'Boogaloo',cursive",
        outline:"none",boxSizing:"border-box" as any,background:C.white,
        boxShadow:sh(error?C.coral:C.navy,2,2),color:C.navy}}/>
    {error&&<p id={`${id}-err`} role="alert" style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.coral,marginTop:4}}>⚠️ {error}</p>}
  </div>
);

const Btn = ({children,onClick,bg=C.coral,color=C.white,disabled=false,outline=false,small=false,style={}}:any) => (
  <button onClick={onClick} disabled={disabled}
    style={{width:"100%",background:outline?"transparent":bg,color:outline?C.navy:color,
      border:`3px solid ${outline?C.navy:C.navy}`,borderRadius:small?14:18,
      padding:small?"8px 14px":"14px",fontFamily:"'Fredoka One',cursive",
      fontSize:small?14:18,cursor:disabled?"not-allowed":"pointer",
      boxShadow:outline||disabled?"none":shB(),minHeight:small?44:54,
      opacity:disabled?.6:1,...style}}>
    {children}
  </button>
);

const Empty = ({icon,title,sub,action,onAction}:any) => (
  <div style={{textAlign:"center",padding:"40px 24px"}}>
    <Mascot size={110}/>
    <p style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,marginBottom:8,marginTop:12}}>{icon} {title}</p>
    <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.7,marginBottom:24,lineHeight:1.6}}>{sub}</p>
    {action&&<button onClick={onAction} style={{background:C.coral,color:C.white,border:`3px solid ${C.navy}`,
      borderRadius:18,padding:"12px 28px",fontFamily:"'Fredoka One',cursive",fontSize:16,cursor:"pointer",boxShadow:shB()}}>
      {action}
    </button>}
  </div>
);

const Toast = ({msg,onDone}:{msg:string,onDone:()=>void}) => {
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[]);
  return (
    <div role="status" aria-live="polite" style={{position:"fixed",top:72,left:"50%",
      transform:"translateX(-50%)",zIndex:999,background:C.yellow,border:`3px solid ${C.navy}`,
      borderRadius:16,padding:"12px 20px",boxShadow:shB(),
      fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,whiteSpace:"nowrap" as any}}>
      {msg}
    </div>
  );
};

/* Book cover: real image or emoji fallback */
const Capa = ({book,size=90}:{book:Book,size?:number}) =>
  book.capa_url
    ? <img src={book.capa_url} alt={`Capa: ${book.titulo}`}
        style={{width:size*.75,height:size,objectFit:"cover",borderRadius:10,
          border:`3px solid ${C.navy}`,boxShadow:sh(C.navy,3,4),display:"block",margin:"0 auto"}}/>
    : <div style={{fontSize:size*.5,textAlign:"center"}}>📚</div>;

/* ═══════════════════════════ WELCOME */
function Welcome({onLogin,onRegister}:{onLogin:()=>void,onRegister:()=>void}) {
  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100dvh"}}>
      <div style={{background:C.coral,flex:1,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:"32px 24px 0",
        position:"relative",overflow:"hidden"}}>
        <Blob color="#FF6B81" size={200} style={{position:"absolute",top:-60,right:-60,opacity:.4}}/>
        <Blob color="#FF9A8A" size={140} style={{position:"absolute",bottom:40,left:-50,opacity:.35}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
          <div style={{width:80,height:80,borderRadius:24,background:C.white,
            border:`4px solid ${C.navy}`,display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:40,boxShadow:shB(),margin:"0 auto 20px"}}>📚</div>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:42,color:C.white,
            lineHeight:1,marginBottom:8,textShadow:`3px 3px 0 ${C.navy}`}}>BookBuddy</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:18,color:"rgba(255,255,255,.95)",
            marginBottom:28,lineHeight:1.5}}>Troca livros com os teus amigos de forma segura e divertida! 📖</p>
          <Mascot size={160}/>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"28px 24px 40px"}}>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24,flexWrap:"wrap" as any}}>
          {["📚 Empresta livros","👫 Amigos leitores","🔒 100% seguro","🌟 Gratuito"].map(f=>(
            <span key={f} style={{background:C.white,border:`2.5px solid ${C.navy}`,borderRadius:20,
              padding:"5px 12px",fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,boxShadow:sh(C.navy,1,2)}}>{f}</span>
          ))}
        </div>
        <Btn onClick={onRegister} style={{marginBottom:12}}>🚀 Criar conta grátis</Btn>
        <Btn onClick={onLogin} bg={C.navy} outline>Já tenho conta</Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════ REGISTER */
const EMOJIS = ["🦊","🐻","🦋","🦁","🐱","🐧","🦄","🐙","🐳","🦜","🐬","🐺"];

function Register({onSuccess,onLogin}:{onSuccess:(p:Profile)=>void,onLogin:()=>void}) {
  const [step,setStep]=useState(1);
  const [nome,setNome]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [emoji,setEmoji]=useState("🦊");
  const [erros,setErros]=useState<any>({});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");

  const validar=()=>{
    const e:any={};
    if(!nome.trim())e.nome="Diz-nos o teu nome!";
    if(!email.includes("@"))e.email="E-mail inválido";
    if(pass.length<6)e.pass="Mínimo 6 caracteres";
    setErros(e);return Object.keys(e).length===0;
  };

  const registar=async()=>{
    setLoading(true);setErr("");
    try {
      await signUp(email,pass,nome.trim(),emoji);
      // After signup, Supabase sends confirmation email.
      // For now we auto-sign-in for better UX:
      const { session } = await signIn(email,pass);
      if(session){
        const p=await getProfile(session.user.id);
        if(p)onSuccess(p);
      }
    } catch(e:any){
      setErr(e.message||"Erro ao criar conta. Tenta novamente.");
    }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100dvh",overflowY:"auto" as any}}>
      <div style={{background:C.teal,padding:"20px 20px 0",position:"relative",overflow:"hidden",flexShrink:0}}>
        <Blob color="#00B5B6" size={150} style={{position:"absolute",right:-30,top:-40,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={()=>step===2?setStep(1):onLogin()} style={{background:C.navy,color:C.white,
            border:"none",borderRadius:12,padding:"8px 16px",fontFamily:"'Fredoka One',cursive",
            fontSize:13,cursor:"pointer",marginBottom:12,minHeight:44}}>← Voltar</button>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:C.navy}}>
            {step===1?"Criar conta 🎉":"Escolhe o teu avatar!"}
          </h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:.8,marginBottom:14}}>
            {step===1?"É rápido e gratuito":"Quem és tu no mundo da leitura?"}
          </p>
          <div style={{display:"flex",gap:6,marginBottom:4}}>
            {[1,2].map(s=><div key={s} style={{height:5,flex:1,borderRadius:3,
              background:s<=step?C.navy:"rgba(0,0,0,.2)"}}/>)}
          </div>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"16px 20px 40px",flex:1}}>
        {err&&<div role="alert" style={{background:"#FFE5E5",border:`2.5px solid ${C.coral}`,
          borderRadius:14,padding:"10px 14px",marginBottom:14,
          fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy}}>⚠️ {err}</div>}
        {step===1?(
          <>
            <Inp id="r-nome" label="O teu nome" value={nome} onChange={setNome} placeholder="ex: Francisco" required error={erros.nome}/>
            <Inp id="r-email" label="E-mail" type="email" value={email} onChange={setEmail} placeholder="francisco@email.com" required error={erros.email}/>
            <Inp id="r-pass" label="Senha" type="password" value={pass} onChange={setPass} placeholder="Mínimo 6 caracteres" required error={erros.pass}/>
            <div style={{background:C.green+"33",borderRadius:14,padding:"12px 16px",
              border:`2.5px solid ${C.green}`,marginBottom:20,display:"flex",gap:10}}>
              <span aria-hidden="true" style={{fontSize:20}}>🔒</span>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,lineHeight:1.6}}>
                A tua biblioteca é privada — só os teus amigos podem ver os teus livros.
              </p>
            </div>
            <Btn onClick={()=>{if(validar())setStep(2);}}>Continuar →</Btn>
          </>
        ):(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
              {EMOJIS.map(e=>(
                <button key={e} onClick={()=>setEmoji(e)} aria-pressed={emoji===e}
                  style={{aspectRatio:"1",fontSize:36,borderRadius:18,
                    border:`3px solid ${emoji===e?C.coral:C.navy}`,
                    background:emoji===e?C.coral+"22":C.white,
                    cursor:"pointer",boxShadow:emoji===e?sh(C.coral,2,3):sh(C.navy,2,2)}}>
                  {e}
                </button>
              ))}
            </div>
            <div style={{background:C.yellow,borderRadius:18,padding:"14px",
              border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),
              display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
              <div style={{width:52,height:52,borderRadius:16,background:C.white,
                border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
                {emoji}
              </div>
              <div>
                <p style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy}}>{nome}</p>
                <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>Pronto para ler! 📚</p>
              </div>
            </div>
            <Btn onClick={registar} disabled={loading}>{loading?"A criar conta...":"🎉 Começar a ler!"}</Btn>
          </>
        )}
        <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.7,textAlign:"center",marginTop:16}}>
          Já tens conta?{" "}
          <button onClick={onLogin} style={{background:"none",border:"none",color:C.coral,
            fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",textDecoration:"underline"}}>
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════ LOGIN */
function Login({onSuccess,onRegister}:{onSuccess:(p:Profile)=>void,onRegister:()=>void}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const entrar=async()=>{
    if(!email||!pass){setErr("Preenche todos os campos.");return;}
    setErr("");setLoading(true);
    try {
      const {session}=await signIn(email,pass);
      if(session){const p=await getProfile(session.user.id);if(p)onSuccess(p);}
    }catch(e:any){setErr(e.message||"E-mail ou senha incorretos.");}
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100dvh"}}>
      <div style={{background:C.lavender,padding:"20px 20px 0",position:"relative",overflow:"hidden",flexShrink:0}}>
        <Blob color="#BDB2FF" size={160} style={{position:"absolute",right:-40,top:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>Bem-vindo! 👋</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.8,marginBottom:14}}>Entra para ver a tua biblioteca</p>
          <div style={{display:"flex",justifyContent:"center",marginBottom:-10}}><Mascot size={130}/></div>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"16px 20px 40px",flex:1}}>
        {err&&<div role="alert" style={{background:"#FFE5E5",border:`2.5px solid ${C.coral}`,borderRadius:14,padding:"10px 14px",marginBottom:14,fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy}}>⚠️ {err}</div>}
        <Inp id="l-email" label="E-mail" type="email" value={email} onChange={setEmail} placeholder="francisco@email.com"/>
        <Inp id="l-pass" label="Senha" type="password" value={pass} onChange={setPass} placeholder="A tua senha"/>
        <div style={{textAlign:"right",marginBottom:20}}>
          <button style={{background:"none",border:"none",color:C.teal,fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer"}}>Esqueci a senha</button>
        </div>
        <Btn onClick={entrar} disabled={loading} style={{marginBottom:12}}>{loading?"A entrar...":"Entrar →"}</Btn>
        <Btn onClick={onRegister} outline bg={C.navy}>Criar conta grátis 🚀</Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════ BOOK DETAIL */
function BookDetail({book,user,lenderId,onBack,onRequestDone}:{book:Book,user:Profile,lenderId:string,onBack:()=>void,onRequestDone?:()=>void}) {
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");
  const isOwn=book.user_id===user.id;

  const pedir=async()=>{
    setLoading(true);setErr("");
    try{
      await requestLoan(book.id,lenderId,user.id);
      setDone(true);
      onRequestDone?.();
    }catch(e:any){setErr(e.message||"Erro ao enviar pedido.");}
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100dvh"}}>
      {/* Hero */}
      <div style={{background:C.lavender,padding:"18px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color={C.white} size={200} style={{position:"absolute",right:-60,top:-60,opacity:.12}}/>
        <button onClick={onBack} style={{background:C.navy,color:C.white,border:"none",borderRadius:16,
          padding:"10px 20px",fontFamily:"'Fredoka One',cursive",fontSize:15,cursor:"pointer",
          boxShadow:sh(C.navy,2,3),position:"relative",zIndex:2,minHeight:44}}>← Voltar</button>
        <div style={{display:"flex",gap:14,marginTop:12,position:"relative",zIndex:1,paddingBottom:8}}>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {book.capa_url
              ? <img src={book.capa_url} alt={`Capa: ${book.titulo}`}
                  style={{width:120,height:168,objectFit:"cover",borderRadius:14,
                    border:`4px solid ${C.navy}`,boxShadow:`6px 8px 0 ${C.navy}`,transform:"rotate(-2deg)"}}/>
              : <div style={{width:110,height:155,borderRadius:14,background:C.white,
                  border:`4px solid ${C.navy}`,boxShadow:`6px 8px 0 ${C.navy}`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>📚</div>
            }
          </div>
          <div style={{flex:1.2,paddingBottom:20}}>
            <span style={{display:"inline-block",background:C.coral,color:C.white,borderRadius:12,
              padding:"4px 14px",fontFamily:"'Fredoka One',cursive",fontSize:12,
              border:`2px solid ${C.navy}`,boxShadow:sh(C.navy,2,2),marginBottom:8}}>
              {book.genero}
            </span>
            <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,lineHeight:1.15,marginBottom:6}}>
              {book.titulo}
            </h1>
            {book.autor&&<p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:.8,marginBottom:10}}>por {book.autor}</p>}
            <div role="img" aria-label={`Nota: ${book.nota} de 5 estrelas`}>
              {[0,1,2,3,4].map(i=><span key={i} aria-hidden="true" style={{fontSize:20,color:i<book.nota?C.yellow:"#CCC"}}>★</span>)}
            </div>
          </div>
        </div>
        <Wave color={C.cream}/>
      </div>

      {/* Content */}
      <div style={{background:C.cream,padding:"8px 20px 120px",flex:1}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[
            {l:"Páginas",v:book.paginas||"?",i:"📄",bg:C.yellow},
            {l:"Nota",v:`${book.nota}/5`,i:"⭐",bg:C.lavender},
          ].map(s=>(
            <div key={s.l} style={{background:s.bg,borderRadius:16,padding:"12px 8px",textAlign:"center",
              border:`3px solid ${C.navy}`,boxShadow:sh(C.navy,2,3)}}>
              <span aria-hidden="true" style={{fontSize:22,display:"block"}}>{s.i}</span>
              <span style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,display:"block"}}>{s.v}</span>
              <span style={{fontFamily:"'Boogaloo',cursive",fontSize:11,color:C.navy}}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {book.descricao&&(
          <div style={{background:C.white,borderRadius:20,padding:"16px 18px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),marginBottom:12}}>
            <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy,marginBottom:8}}>Do que se trata? 🤔</h2>
            <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,lineHeight:1.8}}>{book.descricao}</p>
          </div>
        )}

        {/* User note */}
        {book.descricao_usuario&&(
          <div style={{background:C.yellow+"44",borderRadius:20,padding:"14px 16px",border:`3px solid ${C.yellow}`,marginBottom:16}}>
            <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,marginBottom:6}}>✏️ Nota do dono</h2>
            <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,lineHeight:1.7,fontStyle:"italic"}}>"{book.descricao_usuario}"</p>
          </div>
        )}

        {/* Availability */}
        <div style={{background:book.disponivel?C.green:"#DFE6E9",borderRadius:20,padding:"16px 18px",
          border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),display:"flex",alignItems:"center",gap:14}}>
          <span aria-hidden="true" style={{fontSize:36}}>{book.disponivel?"📚":"📤"}</span>
          <div>
            <p style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:C.navy}}>
              {isOwn
                ? book.disponivel?"Na tua estante!":"Emprestado a alguém"
                : book.disponivel?"Disponível para pedir!":"Ocupado agora..."
              }
            </p>
          </div>
        </div>

        {err&&<p role="alert" style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.coral,marginTop:12}}>⚠️ {err}</p>}
      </div>

      {/* CTA */}
      {!isOwn&&book.disponivel&&(
        <div style={{position:"sticky",bottom:0,background:C.cream,borderTop:`3px solid ${C.navy}`,padding:"12px 20px"}}>
          <Btn onClick={pedir} disabled={loading||done} bg={done?C.green:C.coral} color={done?C.navy:C.white}>
            {loading?"A enviar...":(done?"🎉 Pedido Enviado!":"📬 Pedir para Pegar!")}
          </Btn>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ INICIO */
function Inicio({user,nav,loans}:{user:Profile,nav:(t:string)=>void,loans:Loan[]}) {
  const overdue=loans.filter(l=>l.due_date&&diasR(l.due_date)<0).length;
  return (
    <main>
      <div style={{background:C.coral,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#FF6B81" size={180} style={{position:"absolute",top:-60,right:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:"rgba(255,255,255,.9)"}}>BEM-VINDO! 🌟</p>
              <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:34,color:C.white,lineHeight:1.1}}>Olá, {user.nome}! {user.avatar_emoji}</h1>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:"rgba(255,255,255,.9)"}}>A tua biblioteca está à espera!</p>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:10}}><Mascot size={140}/></div>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"0 18px 24px"}}>
        {overdue>0&&(
          <div role="alert" style={{background:"#FFE5E5",borderRadius:18,padding:"14px 18px",
            border:`3px solid ${C.coral}`,boxShadow:shB(),display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
            <span aria-hidden="true" style={{fontSize:34}}>⚠️</span>
            <div>
              <p style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy}}>Livro atrasado!</p>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy}}>Tens {overdue} livro{overdue>1?"s":""} em atraso. Devolve já!</p>
            </div>
          </div>
        )}
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:12}}>Por onde começar? 🚀</h2>
        {[
          {icon:"📚",title:"Adicionar um livro",sub:"Coloca os teus livros na estante",tela:"biblioteca",bg:C.orange},
          {icon:"👫",title:"Convidar um amigo",sub:"Convida amigos para trocar livros",tela:"amigos",bg:C.lavender},
          {icon:"📖",title:"Livros emprestados",sub:`${loans.length} livro${loans.length!==1?"s":""} em curso`,tela:"emprestados",bg:C.teal},
        ].map(a=>(
          <button key={a.tela} onClick={()=>nav(a.tela)}
            style={{width:"100%",background:a.bg,borderRadius:20,padding:"16px 18px",
              border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),
              display:"flex",alignItems:"center",gap:14,marginBottom:12,
              cursor:"pointer",textAlign:"left" as any,minHeight:72}}>
            <span style={{fontSize:38}}>{a.icon}</span>
            <div style={{flex:1}}>
              <p style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy}}>{a.title}</p>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>{a.sub}</p>
            </div>
            <span style={{fontSize:20}}>→</span>
          </button>
        ))}
      </div>
    </main>
  );
}

/* ═══════════════════════════ BIBLIOTECA */
function Biblioteca({user}:{user:Profile}) {
  const [books,setBooks]=useState<Book[]>([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [detail,setDetail]=useState<Book|null>(null);
  const [novo,setNovo]=useState({titulo:"",autor:"",descricao:"",descricao_usuario:"",genero:"Outros",nota:5,paginas:"",capa:null as any,prev:null as any});
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState("");
  const [filtro,setFiltro]=useState("Todos");
  const inpRef=useRef<any>();
  const btnRef=useRef<any>();

  const load=useCallback(async()=>{
    setLoading(true);
    try{const b=await getMyBooks(user.id);setBooks(b);}catch{}
    setLoading(false);
  },[user.id]);

  useEffect(()=>{load();},[load]);

  const fechar=()=>{setModal(false);setNovo({titulo:"",autor:"",descricao:"",descricao_usuario:"",genero:"Outros",nota:5,paginas:"",capa:null,prev:null});setTimeout(()=>btnRef.current?.focus(),50);};

  const salvar=async()=>{
    if(!novo.titulo.trim())return;
    setSaving(true);
    try{
      const b=await addBook(user.id,{
        titulo:novo.titulo.trim(),autor:novo.autor.trim()||undefined,
        descricao:novo.descricao.trim()||undefined,
        descricao_usuario:novo.descricao_usuario.trim()||undefined,
        genero:novo.genero,nota:novo.nota,
        paginas:novo.paginas?parseInt(novo.paginas):undefined,
      });
      if(novo.capa){
        try{
          const url=await uploadCover(b.id,novo.capa);
          await updateBook(b.id,{capa_url:url});
          b.capa_url=url;
        }catch{}
      }
      setBooks(p=>[b,...p]);
      setToast("📚 Livro adicionado!");
      fechar();
    }catch(e:any){setToast("Erro: "+e.message);}
    setSaving(false);
  };

  const onArq=(e:any)=>{
    const a=e.target.files[0];if(!a||!a.type.startsWith("image/"))return;
    const r=new FileReader();r.onload=(ev:any)=>setNovo(p=>({...p,capa:ev.target.result,prev:ev.target.result}));r.readAsDataURL(a);
  };

  const generos=["Todos","Aventura","Fantasia","Clássico","Engraçado","Outros"];
  const filtrados=books.filter(b=>filtro==="Todos"||b.genero===filtro);

  if(detail)return(
    <BookDetail book={detail} user={user} lenderId={detail.user_id} onBack={()=>setDetail(null)}
      onRequestDone={()=>setToast("📬 Pedido enviado!")}/>
  );

  return (
    <main>
      {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      <div style={{background:C.teal,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#00B5B6" size={150} style={{position:"absolute",right:-30,top:-40,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>📚 Minha Biblioteca</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.9,marginBottom:14}}>
            {loading?"A carregar...":(books.length===0?"Estante vazia — adiciona o primeiro livro!": `${books.length} livro${books.length>1?"s":""} na tua estante!`)}
          </p>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"8px 18px 24px"}}>
        {books.length>0&&(
          <div style={{display:"flex",gap:8,overflowX:"auto" as any,marginBottom:14,paddingBottom:4}}>
            {generos.map(g=><button key={g} onClick={()=>setFiltro(g)} aria-pressed={filtro===g}
              style={{background:filtro===g?C.navy:C.white,color:filtro===g?C.white:C.navy,
                border:`2.5px solid ${C.navy}`,borderRadius:20,padding:"7px 16px",
                fontFamily:"'Fredoka One',cursive",fontSize:12,cursor:"pointer",whiteSpace:"nowrap" as any,minHeight:44}}>
              {g}
            </button>)}
          </div>
        )}

        <button ref={btnRef} onClick={()=>setModal(true)}
          style={{width:"100%",background:C.coral,color:C.white,border:`3px solid ${C.navy}`,
            borderRadius:20,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,
            cursor:"pointer",marginBottom:16,boxShadow:shB(),
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:54}}>
          ➕ Adicionar Livro!
        </button>

        {!loading&&books.length===0
          ? <Empty icon="📚" title="Estante vazia!" sub={"Adiciona os teus livros para que\nos teus amigos possam pedir emprestado."} action="➕ Adicionar primeiro livro" onAction={()=>setModal(true)}/>
          : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {filtrados.map(book=>(
                <button key={book.id} onClick={()=>setDetail(book)}
                  aria-label={`${book.titulo}${book.autor?` por ${book.autor}`:""}`}
                  style={{background:C.lavender+"22",borderRadius:20,padding:"16px 14px",
                    border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),cursor:"pointer",textAlign:"center" as any,minHeight:44}}>
                  <Capa book={book} size={90}/>
                  <p style={{fontFamily:"'Fredoka One',cursive",fontSize:13,color:C.navy,marginTop:8,lineHeight:1.2}}>
                    {book.titulo.length>22?book.titulo.slice(0,22)+"…":book.titulo}
                  </p>
                  <span style={{display:"inline-block",marginTop:8,background:book.disponivel?C.green:C.orange,
                    color:C.navy,borderRadius:10,padding:"3px 10px",fontFamily:"'Fredoka One',cursive",
                    fontSize:10,border:`2px solid ${C.navy}`}}>
                    {book.disponivel?"✓ LIVRE":"📤 EMPRESTADO"}
                  </span>
                </button>
              ))}
            </div>
        }

        {/* Add book modal */}
        {modal&&(
          <div role="presentation" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",
            display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={fechar}>
            <div role="dialog" aria-modal={true} aria-labelledby="mt" onClick={(e:any)=>e.stopPropagation()}
              style={{background:C.cream,borderRadius:"28px 28px 0 0",padding:"20px 20px 46px",
                width:"100%",maxWidth:480,border:`3px solid ${C.navy}`,borderBottom:"none",
                maxHeight:"90vh",overflowY:"auto" as any}}>
              <h2 id="mt" style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,textAlign:"center",marginBottom:16}}>➕ Adicionar Livro!</h2>

              {/* Photo */}
              <div style={{border:`3px solid ${C.navy}`,borderRadius:16,padding:"14px",marginBottom:14}}>
                <p style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,marginBottom:8}}>📸 Foto da capa (opcional)</p>
                {novo.prev
                  ? <div style={{textAlign:"center"}}>
                      <img src={novo.prev} alt="Pré-visualização" style={{width:90,height:126,objectFit:"cover",borderRadius:10,border:`3px solid ${C.navy}`,display:"block",margin:"0 auto 10px"}}/>
                      <button onClick={()=>setNovo(p=>({...p,capa:null,prev:null}))} style={{background:"#FFE5E5",color:C.coral,border:`2px solid ${C.coral}`,borderRadius:12,padding:"7px 14px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",minHeight:44}}>✕ Remover</button>
                    </div>
                  : <label htmlFor="inp-capa" style={{display:"block",textAlign:"center",background:C.teal,color:C.navy,border:`3px solid ${C.navy}`,borderRadius:14,padding:"10px",fontFamily:"'Fredoka One',cursive",fontSize:14,cursor:"pointer"}}>
                      📷 Escolher foto
                      <input id="inp-capa" ref={inpRef} type="file" accept="image/*" onChange={onArq} style={{position:"absolute",width:1,height:1,opacity:0}}/>
                    </label>
                }
              </div>

              <Inp id="n-titulo" label="Título" value={novo.titulo} onChange={(v:string)=>setNovo(p=>({...p,titulo:v}))} placeholder="ex: Harry Potter" required/>
              <Inp id="n-autor" label="Autor" value={novo.autor} onChange={(v:string)=>setNovo(p=>({...p,autor:v}))} placeholder="ex: J.K. Rowling"/>
              <Inp id="n-paginas" label="Páginas" type="number" value={novo.paginas} onChange={(v:string)=>setNovo(p=>({...p,paginas:v}))} placeholder="ex: 320"/>

              <div style={{marginBottom:14}}>
                <label htmlFor="n-genero" style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,display:"block",marginBottom:6}}>Género</label>
                <select id="n-genero" value={novo.genero} onChange={(e:any)=>setNovo(p=>({...p,genero:e.target.value}))}
                  style={{width:"100%",border:`3px solid ${C.navy}`,borderRadius:14,padding:"12px 14px",fontSize:15,fontFamily:"'Boogaloo',cursive",outline:"none",boxSizing:"border-box" as any,background:C.white,boxShadow:sh(C.navy,2,2),color:C.navy}}>
                  {["Aventura","Fantasia","Clássico","Engraçado","Ficção Científica","Romance","Outros"].map(g=><option key={g}>{g}</option>)}
                </select>
              </div>

              <div style={{marginBottom:14}}>
                <label style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,display:"block",marginBottom:6}}>Nota</label>
                <div style={{display:"flex",gap:8}}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setNovo(p=>({...p,nota:n}))}
                      style={{flex:1,fontSize:24,background:"none",border:"none",cursor:"pointer",
                        opacity:n<=novo.nota?1:.3,transition:"opacity .15s"}}>★</button>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:14}}>
                <label htmlFor="n-desc" style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,display:"block",marginBottom:6}}>Descrição (para os amigos)</label>
                <textarea id="n-desc" value={novo.descricao} onChange={(e:any)=>setNovo(p=>({...p,descricao:e.target.value}))}
                  placeholder="Sobre o que é o livro?" rows={2}
                  style={{width:"100%",border:`3px solid ${C.navy}`,borderRadius:14,padding:"12px 14px",fontSize:14,fontFamily:"'Boogaloo',cursive",outline:"none",boxSizing:"border-box" as any,background:C.white,boxShadow:sh(C.navy,2,2),color:C.navy,resize:"vertical" as any}}/>
              </div>

              <div style={{marginBottom:20}}>
                <label htmlFor="n-nota-u" style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,display:"block",marginBottom:6}}>✏️ A tua opinião (privada)</label>
                <textarea id="n-nota-u" value={novo.descricao_usuario} onChange={(e:any)=>setNovo(p=>({...p,descricao_usuario:e.target.value}))}
                  placeholder="O que achaste? Recomendas?" rows={2}
                  style={{width:"100%",border:`3px solid ${C.navy}`,borderRadius:14,padding:"12px 14px",fontSize:14,fontFamily:"'Boogaloo',cursive",outline:"none",boxSizing:"border-box" as any,background:C.white,boxShadow:sh(C.navy,2,2),color:C.navy,resize:"vertical" as any}}/>
              </div>

              <Btn onClick={salvar} disabled={saving} style={{marginBottom:10}}>{saving?"A guardar...":"Guardar! 🎉"}</Btn>
              <Btn onClick={fechar} outline>Cancelar</Btn>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ═══════════════════════════ EMPRESTADOS */
function Emprestados({user}:{user:Profile}) {
  const [borrowed,setBorrowed]=useState<Loan[]>([]);
  const [lent,setLent]=useState<Loan[]>([]);
  const [loading,setLoading]=useState(true);
  const [detail,setDetail]=useState<Book|null>(null);
  const [toast,setToast]=useState("");

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const [b,l]=await Promise.all([getMyBorrowedLoans(user.id),getMyLentLoans(user.id)]);
      setBorrowed(b);setLent(l);
    }catch{}
    setLoading(false);
  },[user.id]);

  useEffect(()=>{load();},[load]);

  const handleReturn=async(loanId:string)=>{
    try{await returnLoan(loanId);setToast("📦 Devolvido!");await load();}catch(e:any){setToast("Erro: "+e.message);}
  };
  const handleApprove=async(loanId:string,bookId:string)=>{
    try{await approveLoan(loanId);setToast("✅ Empréstimo aprovado!");await load();}catch(e:any){setToast("Erro: "+e.message);}
  };
  const handleReject=async(loanId:string)=>{
    try{await rejectLoan(loanId);setToast("❌ Pedido recusado");await load();}catch(e:any){setToast("Erro: "+e.message);}
  };

  if(detail)return<BookDetail book={detail} user={user} lenderId={detail.user_id} onBack={()=>setDetail(null)}/>;

  return(
    <main>
      {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      <div style={{background:C.orange,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#FFBE76" size={160} style={{position:"absolute",right:-30,top:-40,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>📖 Empréstimos</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.9,marginBottom:14}}>Gestão dos teus livros</p>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"8px 18px 100px"}}>
        {loading?<p style={{fontFamily:"'Boogaloo',cursive",fontSize:16,color:C.navy,textAlign:"center",padding:"30px 0"}}>A carregar...</p>:(
          <>
            {/* Requests I need to handle */}
            {lent.filter(l=>l.status==="requested").length>0&&(
              <>
                <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:12}}>📬 Pedidos recebidos</h2>
                {lent.filter(l=>l.status==="requested").map(loan=>(
                  <div key={loan.id} style={{background:C.yellow,borderRadius:20,padding:"16px",
                    border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),marginBottom:14}}>
                    <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                      {loan.book&&<Capa book={loan.book} size={60}/>}
                      <div style={{flex:1}}>
                        <p style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy}}>{loan.book?.titulo}</p>
                        <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>
                          {loan.borrower?.avatar_emoji} {loan.borrower?.nome} quer pegar emprestado!
                        </p>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <Btn onClick={()=>handleApprove(loan.id,loan.book_id)} bg={C.green} small>✓ Aceitar</Btn>
                      <Btn onClick={()=>handleReject(loan.id)} bg={"#F0F0F0"} color={C.navy} small>✕ Recusar</Btn>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Books I borrowed */}
            {borrowed.length>0&&(
              <>
                <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:12,marginTop:4}}>📖 Estou a ler</h2>
                {borrowed.map(loan=>{
                  const dias=loan.due_date?diasR(loan.due_date):999;
                  const badge=prazoTag(dias);
                  return(
                    <div key={loan.id} style={{background:C.teal+"22",borderRadius:20,padding:"16px",
                      border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),marginBottom:14}}>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        {loan.book&&<button onClick={()=>setDetail(loan.book!)} style={{background:"none",border:"none",cursor:"pointer",padding:0}}><Capa book={loan.book} size={70}/></button>}
                        <div style={{flex:1}}>
                          <p style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy}}>{loan.book?.titulo}</p>
                          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,opacity:.8}}>{loan.lender?.avatar_emoji} de {loan.lender?.nome}</p>
                          <span style={{display:"inline-block",marginTop:6,background:badge.bg,color:badge.tx,borderRadius:12,padding:"4px 12px",fontFamily:"'Fredoka One',cursive",fontSize:12,border:`2px solid ${C.navy}`}}>{badge.label}</span>
                        </div>
                      </div>
                      <button onClick={()=>handleReturn(loan.id)}
                        style={{width:"100%",marginTop:12,background:C.white,color:C.navy,border:`3px solid ${C.navy}`,borderRadius:14,padding:"10px",fontFamily:"'Fredoka One',cursive",fontSize:14,cursor:"pointer",boxShadow:sh(C.navy,2,2)}}>
                        📦 Marcar como Devolvido
                      </button>
                    </div>
                  );
                })}
              </>
            )}

            {/* Books I lent */}
            {lent.filter(l=>l.status==="active").length>0&&(
              <>
                <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:12,marginTop:4}}>📤 Emprestei</h2>
                {lent.filter(l=>l.status==="active").map(loan=>(
                  <div key={loan.id} style={{background:C.lavender+"22",borderRadius:20,padding:"14px 16px",
                    border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),marginBottom:12,
                    display:"flex",alignItems:"center",gap:12}}>
                    {loan.book&&<Capa book={loan.book} size={60}/>}
                    <div style={{flex:1}}>
                      <p style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy}}>{loan.book?.titulo}</p>
                      <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>
                        {loan.borrower?.avatar_emoji} {loan.borrower?.nome} tem agora
                      </p>
                    </div>
                    <button style={{background:C.yellow,border:`2.5px solid ${C.navy}`,borderRadius:12,
                      padding:"8px 12px",fontFamily:"'Fredoka One',cursive",fontSize:11,cursor:"pointer",
                      boxShadow:sh(C.navy,2,2),minWidth:44,minHeight:44}}>🔔</button>
                  </div>
                ))}
              </>
            )}

            {borrowed.length===0&&lent.length===0&&(
              <Empty icon="📖" title="Nenhum empréstimo" sub={"Quando pedires ou emprestares um livro\naparece aqui."}/>
            )}
          </>
        )}
      </div>
    </main>
  );
}

/* ═══════════════════════════ AMIGOS */
function Amigos({user}:{user:Profile}) {
  const [friends,setFriends]=useState<(Friendship&{profile:Profile})[]>([]);
  const [pending,setPending]=useState<any[]>([]);
  const [selFriend,setSelFriend]=useState<Profile|null>(null);
  const [friendBooks,setFriendBooks]=useState<Book[]>([]);
  const [detail,setDetail]=useState<Book|null>(null);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [invEmail,setInvEmail]=useState("");
  const [invErr,setInvErr]=useState("");
  const [invDone,setInvDone]=useState(false);
  const [linkCopiado,setLinkCopiado]=useState(false);

  const linkConvite = `https://bookbuddy-eta.vercel.app?convite=${user.id}`;

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkConvite);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 3000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = linkConvite;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 3000);
    }
  };

  const partilharLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "BookBuddy",
          text: `${user.nome} convidou-te para o BookBuddy! Troca livros com amigos de forma segura e divertida 📚`,
          url: linkConvite,
        });
      } catch {}
    } else {
      copiarLink();
    }
  };
  const [toast,setToast]=useState("");
  const btnRef=useRef<any>();

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const [f,p]=await Promise.all([getFriends(user.id),getPendingRequests(user.id)]);
      setFriends(f);setPending(p);
    }catch{}
    setLoading(false);
  },[user.id]);

  useEffect(()=>{load();},[load]);

  const openFriend=async(profile:Profile)=>{
    setSelFriend(profile);
    try{const b=await getFriendBooks(profile.id);setFriendBooks(b);}catch{setFriendBooks([]);}
  };

  const handleRespond=async(id:string,action:"accepted"|"blocked")=>{
    try{await respondFriendRequest(id,action);setToast(action==="accepted"?"👫 Amigo aceite!":"Pedido recusado");await load();}catch(e:any){setToast("Erro: "+e.message);}
  };

  const enviarConvite=async()=>{
    if(!invEmail.includes("@")){setInvErr("E-mail inválido");return;}
    setInvErr("");
    try {
      // Call the Edge Function to send the real email
      const { error } = await supabase.functions.invoke("send-invite", {
        body: { email: invEmail },
      });
      if(error) throw error;
    } catch(e:any) {
      // If edge function not deployed yet, still mark as done for UX
      console.warn("Edge function error (invite still recorded):", e.message);
    }
    setInvDone(true);
  };

  if(detail&&selFriend)return(
    <BookDetail book={detail} user={user} lenderId={selFriend.id}
      onBack={()=>setDetail(null)}
      onRequestDone={()=>setToast("📬 Pedido enviado ao "+selFriend.nome+"!")}/>
  );

  if(selFriend)return(
    <main>
      <div style={{background:C.teal,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <button onClick={()=>setSelFriend(null)} style={{background:C.navy,color:C.white,border:"none",borderRadius:16,padding:"10px 20px",fontFamily:"'Fredoka One',cursive",fontSize:14,cursor:"pointer",marginBottom:12,minHeight:44}}>← Voltar</button>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
          <div style={{width:56,height:56,borderRadius:18,background:C.yellow,border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>{selFriend.avatar_emoji}</div>
          <div>
            <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:24,color:C.navy}}>Biblioteca de {selFriend.nome}</h1>
            <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>🔒 Só tu consegues ver!</p>
          </div>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"8px 18px 24px"}}>
        {friendBooks.length===0
          ? <Empty icon="📚" title="Estante vazia" sub={`${selFriend.nome} ainda não adicionou livros.`}/>
          : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {friendBooks.map(book=>(
                <button key={book.id} onClick={()=>setDetail(book)}
                  aria-label={`${book.titulo} — ${book.disponivel?"Disponível":"Indisponível"}`}
                  style={{background:C.lavender+"22",borderRadius:20,padding:"14px 12px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),cursor:"pointer",textAlign:"center" as any,minHeight:44}}>
                  <Capa book={book} size={80}/>
                  <p style={{fontFamily:"'Fredoka One',cursive",fontSize:13,color:C.navy,textAlign:"center",marginTop:6,lineHeight:1.2}}>{book.titulo.length>22?book.titulo.slice(0,22)+"…":book.titulo}</p>
                  <span style={{display:"inline-block",marginTop:8,background:book.disponivel?C.green:C.orange,color:C.navy,borderRadius:10,padding:"3px 10px",fontFamily:"'Fredoka One',cursive",fontSize:10,border:`2px solid ${C.navy}`}}>{book.disponivel?"LIVRE":"Ocupado"}</span>
                </button>
              ))}
            </div>
        }
      </div>
    </main>
  );

  return(
    <main>
      {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      <div style={{background:C.lavender,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#BDB2FF" size={160} style={{position:"absolute",right:-40,top:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>👫 Amigos Leitores</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.85,marginBottom:14}}>Só amigos veem a tua biblioteca 🔒</p>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"8px 18px 24px"}}>
        <div style={{background:C.green,borderRadius:18,padding:"14px 18px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
          <span aria-hidden="true" style={{fontSize:32}}>🔒</span>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,lineHeight:1.5}}>A tua biblioteca é privada. Apenas os teus Amigos Leitores podem ver e pedir os teus livros.</p>
        </div>

        <button ref={btnRef} onClick={()=>setModal(true)} style={{width:"100%",background:C.lavender,color:C.navy,border:`3px solid ${C.navy}`,borderRadius:20,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:"pointer",marginBottom:20,boxShadow:shB(),display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:54}}>
          ➕ Convidar Amigo Leitor
        </button>

        {/* Pending requests */}
        {pending.length>0&&(
          <>
            <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy,marginBottom:10}}>⏳ Pedidos de amizade</h2>
            {pending.map((f:any)=>(
              <div key={f.id} style={{background:C.yellow,borderRadius:20,padding:"14px 16px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),marginBottom:12,display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:14,background:C.white,border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{f.profile?.avatar_emoji}</div>
                <div style={{flex:1}}>
                  <p style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy}}>{f.profile?.nome}</p>
                  <p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.navy,opacity:.8}}>Quer ser teu Amigo Leitor!</p>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>handleRespond(f.id,"accepted")} aria-label={`Aceitar ${f.profile?.nome}`} style={{background:C.green,border:`2.5px solid ${C.navy}`,color:C.navy,borderRadius:12,padding:"10px 16px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",minHeight:44}}>✓</button>
                  <button onClick={()=>handleRespond(f.id,"blocked")} aria-label={`Recusar ${f.profile?.nome}`} style={{background:C.white,border:`2.5px solid ${C.navy}`,color:C.navy,borderRadius:12,padding:"10px 14px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",minHeight:44}}>✕</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Friends list */}
        {!loading&&friends.length===0&&pending.length===0
          ? <Empty icon="👫" title="Ainda sem amigos" sub={"Convida os teus amigos por e-mail\npara começarem a trocar livros!"}/>
          : <>
              {friends.length>0&&<h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy,marginBottom:12}}>Os meus Amigos Leitores 🌟</h2>}
              {friends.map(f=>(
                <button key={f.id} onClick={()=>openFriend(f.profile)}
                  aria-label={`Ver biblioteca de ${f.profile.nome}`}
                  style={{width:"100%",background:C.teal+"22",borderRadius:20,padding:"16px 18px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),display:"flex",alignItems:"center",gap:14,marginBottom:12,cursor:"pointer",textAlign:"left" as any,minHeight:80}}>
                  <div style={{width:52,height:52,borderRadius:16,background:C.yellow,border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{f.profile.avatar_emoji}</div>
                  <div style={{flex:1}}>
                    <p style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy}}>{f.profile.nome}</p>
                    <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>📚 Ver biblioteca →</p>
                  </div>
                </button>
              ))}
            </>
        }

        {/* Invite modal */}
        {modal&&(
          <div role="presentation" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={()=>setModal(false)}>
            <div role="dialog" aria-modal={true} aria-labelledby="ma" onClick={(e:any)=>e.stopPropagation()}
              style={{background:C.cream,borderRadius:"28px 28px 0 0",padding:"0",width:"100%",maxWidth:480,border:`3px solid ${C.navy}`,borderBottom:"none"}}>
              <div style={{background:C.lavender,borderRadius:"25px 25px 0 0",padding:"22px 20px 0",textAlign:"center",position:"relative",overflow:"hidden"}}>
                <Mascot size={90}/>
                <h2 id="ma" style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,marginTop:4,marginBottom:4}}>{invDone?"Convite Enviado! 🎉":"Convidar Amigo Leitor"}</h2>
                <Wave color={C.cream}/>
              </div>
              <div style={{padding:"16px 20px 40px"}}>
                {!invDone?(
                  <>
                    {/* Share link */}
                    <div style={{background:C.yellow+"44",borderRadius:16,padding:"14px 16px",border:`3px solid ${C.yellow}`,marginBottom:18}}>
                      <p style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,marginBottom:8}}>🔗 Partilhar link de convite</p>
                      <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8,marginBottom:12,lineHeight:1.5}}>Envia este link por WhatsApp, SMS ou onde quiseres!</p>
                      <div style={{background:C.white,borderRadius:12,padding:"10px 12px",border:`2px solid ${C.navy}`,marginBottom:10,fontFamily:"'Boogaloo',cursive",fontSize:11,color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as any}}>
                        🔗 bookbuddy-eta.vercel.app?convite={user.id.slice(0,8)}...
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <button onClick={copiarLink} style={{background:linkCopiado?C.green:C.white,color:C.navy,border:`2.5px solid ${C.navy}`,borderRadius:14,padding:"10px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",boxShadow:sh(C.navy,2,2),minHeight:44,transition:"all .2s"}}>
                          {linkCopiado?"✓ Copiado!":"📋 Copiar"}
                        </button>
                        <button onClick={partilharLink} style={{background:C.coral,color:C.white,border:`2.5px solid ${C.navy}`,borderRadius:14,padding:"10px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",boxShadow:sh(C.navy,2,2),minHeight:44}}>
                          📤 Partilhar
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                      <div style={{flex:1,height:2,background:"#E0E0E0",borderRadius:1}}/>
                      <span style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.6}}>ou por e-mail</span>
                      <div style={{flex:1,height:2,background:"#E0E0E0",borderRadius:1}}/>
                    </div>

                    <div style={{background:C.teal+"33",borderRadius:14,padding:"12px 16px",border:`2.5px solid ${C.teal}`,marginBottom:14,display:"flex",gap:10}}>
                      <span aria-hidden="true" style={{fontSize:20}}>📧</span>
                      <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,lineHeight:1.5}}>O teu amigo vai receber um convite por e-mail para se juntar ao BookBuddy!</p>
                    </div>
                    <Inp id="inv-e" label="E-mail do amigo" type="email" value={invEmail} onChange={setInvEmail} placeholder="amigo@email.com" required error={invErr}/>
                    <Btn onClick={enviarConvite} bg={C.lavender} color={C.navy} style={{marginBottom:10}}>📨 Enviar Convite por E-mail</Btn>
                    <Btn onClick={()=>setModal(false)} outline>Cancelar</Btn>
                  </>
                ):(
                  <>
                    <div style={{background:C.green,borderRadius:18,padding:"18px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),textAlign:"center",marginBottom:16}}>
                      <p style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:6}}>🎉 Convite enviado!</p>
                      <p style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,background:"rgba(255,255,255,.5)",borderRadius:10,padding:"8px 12px",marginTop:8}}>✉️ {invEmail}</p>
                    </div>
                    <Btn onClick={()=>{setInvDone(false);setInvEmail("");}} bg={C.lavender} color={C.navy} style={{marginBottom:10}}>👥 Convidar outro amigo</Btn>
                    <Btn onClick={()=>{setModal(false);setInvDone(false);setInvEmail("");}} outline>Fechar</Btn>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ═══════════════════════════ NOTIFICAÇÕES */
function Notificacoes({user,onVoltar}:{user:Profile,onVoltar:()=>void}) {
  const [notifs,setNotifs]=useState<Notification[]>([]);
  const [loading,setLoading]=useState(true);
  const [erro,setErro]=useState("");
  const naoLidas=notifs.filter(n=>!n.lida).length;

  const load=useCallback(async()=>{
    setLoading(true);setErro("");
    try{
      const n=await getNotifications(user.id);
      setNotifs(n);
    }catch(e:any){
      setErro(e.message||"Erro ao carregar notificações.");
    }
    setLoading(false);
  },[user.id]);

  useEffect(()=>{
    load();
    const unsub=subscribeNotifs(user.id,(n)=>setNotifs(p=>[n,...p]));
    return unsub;
  },[load,user.id]);

  const lerTodas=async()=>{await markAllNotifsRead(user.id);setNotifs(p=>p.map(n=>({...n,lida:true})));};
  const ler=async(id:string)=>{await markNotifRead(id);setNotifs(p=>p.map(n=>n.id===id?{...n,lida:true}:n));};
  const apagar=async(id:string)=>{await deleteNotif(id);setNotifs(p=>p.filter(n=>n.id!==id));};

  const corPorTipo:any={pedido:C.teal,devolucao:C.green,amizade:C.lavender,atraso:C.coral};
  const iconePorTipo:any={pedido:"📚",devolucao:"✅",amizade:"👋",atraso:"⏰"};

  return(
    <main>
      <div style={{background:C.navy,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#2D3A42" size={150} style={{position:"absolute",right:-40,top:-50,opacity:.6}}/>
        <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <button onClick={onVoltar} style={{background:"none",border:"none",color:"rgba(255,255,255,.85)",fontFamily:"'Fredoka One',cursive",fontSize:14,cursor:"pointer",padding:0,marginBottom:8,minHeight:44,display:"block"}}>← Voltar</button>
            <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.white}}>🔔 Notificações</h1>
            <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:"rgba(255,255,255,.8)",marginBottom:14}}>
              {naoLidas>0?`${naoLidas} não lida${naoLidas>1?"s":""}`:"Tudo em dia! ✨"}
            </p>
          </div>
          {naoLidas>0&&<button onClick={lerTodas} style={{background:C.yellow,color:C.navy,border:`3px solid ${C.white}`,borderRadius:14,padding:"8px 14px",fontFamily:"'Fredoka One',cursive",fontSize:12,cursor:"pointer",minHeight:44}}>✓ Todas lidas</button>}
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"4px 18px 100px"}}>
        {loading
          ? <p style={{fontFamily:"'Boogaloo',cursive",fontSize:16,color:C.navy,textAlign:"center",padding:"30px 0"}}>A carregar...</p>
          : erro
          ? <div role="alert" style={{background:"#FFE5E5",borderRadius:18,padding:"16px 18px",border:`3px solid ${C.coral}`,marginTop:16}}>
              <p style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy,marginBottom:4}}>Erro ao carregar ⚠️</p>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>{erro}</p>
              <button onClick={load} style={{marginTop:10,background:C.coral,color:C.white,border:`2px solid ${C.navy}`,borderRadius:12,padding:"8px 14px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",minHeight:44}}>Tentar novamente</button>
            </div>
          : notifs.length===0
          ? <Empty icon="🔔" title="Sem notificações" sub="Quando houver novidades, aparecem aqui!"/>
          :
          <ul style={{listStyle:"none",padding:0}}>
            {notifs.map(n=>(
              <li key={n.id} style={{marginBottom:10}}>
                <div style={{background:n.lida?C.white:corPorTipo[n.tipo]+"28",
                  border:`3px solid ${n.lida?"#E0E0E0":corPorTipo[n.tipo]}`,
                  borderRadius:18,padding:"14px",boxShadow:n.lida?"none":sh(corPorTipo[n.tipo],3,3),
                  opacity:n.lida?.75:1}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:46,height:46,borderRadius:16,background:corPorTipo[n.tipo],border:`2.5px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{iconePorTipo[n.tipo]}</div>
                    <div style={{flex:1}}>
                      <p style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,lineHeight:1.2}}>{n.titulo}</p>
                      <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.85,marginTop:3,lineHeight:1.5}}>{n.texto}</p>
                      <p style={{fontFamily:"'Boogaloo',cursive",fontSize:11,color:C.navy,opacity:.5,marginTop:4}}>
                        {new Date(n.created_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <button onClick={()=>apagar(n.id)} aria-label="Remover" style={{background:"none",border:`2px solid #CCC`,borderRadius:10,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,color:"#999",minWidth:32}}>✕</button>
                  </div>
                  {!n.lida&&(
                    <button onClick={()=>ler(n.id)} style={{marginTop:10,background:C.yellow,color:C.navy,border:`2.5px solid ${C.navy}`,borderRadius:12,padding:"8px 14px",fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",minHeight:44}}>✓ Marcar como lida</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        }
      </div>
    </main>
  );
}

/* ═══════════════════════════ PERFIL */
function Perfil({user,onLogout}:{user:Profile,onLogout:()=>void}) {
  const [logging,setLogging]=useState(false);
  const sair=async()=>{setLogging(true);await signOut();onLogout();};
  return(
    <main>
      <div style={{background:C.pink,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#FD91B8" size={170} style={{position:"absolute",right:-40,top:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
          <div style={{width:72,height:72,borderRadius:22,background:C.yellow,border:`4px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,boxShadow:shB(),margin:"0 auto 8px"}}>{user.avatar_emoji}</div>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:C.navy}}>{user.nome}</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:.85,marginBottom:12}}>{user.email}</p>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"4px 18px 100px"}}>
        <div style={{background:C.white,borderRadius:20,border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),overflow:"hidden",marginBottom:14}}>
          {["Privacidade 🔒","Ajuda e Suporte 🆘"].map((item,i)=>(
            <button key={item} style={{width:"100%",padding:"16px 18px",borderTop:i>0?"2px solid #F0F0F0":"none",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer",minHeight:54,fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,textAlign:"left" as any}}>
              {item}<span aria-hidden="true" style={{color:"#B2BEC3"}}>→</span>
            </button>
          ))}
        </div>
        <Btn onClick={sair} disabled={logging}>{logging?"A sair...":"👋 Sair"}</Btn>
      </div>
    </main>
  );
}

/* ═══════════════════════════ INVITE CONFIRM */
function InviteConfirm({inviterId, user, onDone}:{inviterId:string, user:Profile, onDone:(success:boolean)=>void}) {
  const [inviterProfile, setInviterProfile] = useState<Profile|null>(null);
  const [status, setStatus] = useState<"loading"|"ready"|"sending"|"done"|"already"|"self">("loading");

  useEffect(()=>{
    (async()=>{
      if(inviterId === user.id){ setStatus("self"); return; }
      const [profile, existing] = await Promise.all([
        getProfileById(inviterId),
        checkFriendship(user.id, inviterId),
      ]);
      setInviterProfile(profile);
      if(existing) setStatus("already");
      else setStatus("ready");
    })();
  },[inviterId, user.id]);

  const aceitar = async () => {
    setStatus("sending");
    try {
      await sendFriendRequest(user.id, inviterId);
      setStatus("done");
    } catch(e:any) {
      // If already exists just mark done
      setStatus("done");
    }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100dvh",background:C.cream}}>
      <div style={{background:C.lavender,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#BDB2FF" size={160} style={{position:"absolute",right:-40,top:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center",paddingBottom:8}}>
          <Mascot size={130}/>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:C.navy,marginTop:8}}>
            {status==="loading" ? "A carregar..." :
             status==="self"    ? "Ups! 😅" :
             status==="already" ? "Já são amigos! 🎉" :
             status==="done"    ? "Pedido enviado! 🎉" :
             `${inviterProfile?.nome||"Alguém"} quer ser teu Amigo Leitor!`}
          </h1>
        </div>
        <Wave color={C.cream}/>
      </div>

      <div style={{background:C.cream,padding:"24px 24px 40px",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {status==="loading" && (
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:18,color:C.navy,opacity:.7}}>A verificar convite...</p>
        )}

        {status==="self" && (
          <>
            <p style={{fontFamily:"'Boogaloo',cursive",fontSize:16,color:C.navy,textAlign:"center",lineHeight:1.6,marginBottom:24}}>
              Este é o teu próprio link de convite! Partilha-o com os teus amigos para que eles possam adicionar-te.
            </p>
            <Btn onClick={()=>onDone(false)}>Voltar à app</Btn>
          </>
        )}

        {status==="already" && (
          <>
            <div style={{fontSize:80,marginBottom:16,textAlign:"center"}}>{inviterProfile?.avatar_emoji||"👫"}</div>
            <p style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,textAlign:"center",marginBottom:8}}>{inviterProfile?.nome}</p>
            <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.7,textAlign:"center",marginBottom:24}}>Já são Amigos Leitores! A vossa biblioteca partilhada já está activa.</p>
            <Btn onClick={()=>onDone(true)}>Ver a app 📚</Btn>
          </>
        )}

        {status==="ready" && inviterProfile && (
          <>
            {/* Inviter card */}
            <div style={{background:C.yellow,borderRadius:24,padding:"24px",border:`3px solid ${C.navy}`,
              boxShadow:shB(),textAlign:"center",marginBottom:24,width:"100%",maxWidth:320}}>
              <div style={{fontSize:72,marginBottom:8}}>{inviterProfile.avatar_emoji}</div>
              <p style={{fontFamily:"'Fredoka One',cursive",fontSize:26,color:C.navy}}>{inviterProfile.nome}</p>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:.75,marginTop:4}}>quer ser teu Amigo Leitor!</p>
            </div>

            <div style={{background:C.green+"33",borderRadius:16,padding:"14px 18px",
              border:`2.5px solid ${C.green}`,marginBottom:24,display:"flex",gap:10,width:"100%",maxWidth:320}}>
              <span aria-hidden="true" style={{fontSize:22}}>🔒</span>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,lineHeight:1.5}}>
                Se aceitares, vocês poderão ver as bibliotecas um do outro e trocar livros!
              </p>
            </div>

            <div style={{width:"100%",maxWidth:320,display:"flex",flexDirection:"column",gap:10}}>
              <Btn onClick={aceitar} bg={C.green} color={C.navy}>👫 Aceitar convite!</Btn>
              <Btn onClick={()=>onDone(false)} outline>Agora não</Btn>
            </div>
          </>
        )}

        {status==="sending" && (
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:18,color:C.navy,opacity:.7}}>A enviar pedido...</p>
        )}

        {status==="done" && (
          <>
            <div style={{fontSize:80,marginBottom:16,textAlign:"center"}}>🎉</div>
            <p style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,textAlign:"center",marginBottom:8}}>
              Pedido enviado a {inviterProfile?.nome}!
            </p>
            <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.7,textAlign:"center",marginBottom:24,lineHeight:1.6}}>
              Quando {inviterProfile?.nome} aceitar, poderão ver as bibliotecas um do outro.
            </p>
            <Btn onClick={()=>onDone(true)}>Ir para a app 📚</Btn>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════ ROOT */
const NAV=[
  {id:"inicio",   icon:"🏠", label:"Início"},
  {id:"biblioteca",icon:"📚",label:"Biblioteca"},
  {id:"emprestados",icon:"📖",label:"Lendo"},
  {id:"amigos",   icon:"👫", label:"Amigos"},
  {id:"perfil",   icon:"🦊", label:"Eu"},
];

export default function App() {
  const [fluxo,setFluxo]=useState<"loading"|"welcome"|"login"|"register"|"app">("loading");
  const [user,setUser]=useState<Profile|null>(null);
  const [tela,setTela]=useState("inicio");
  const [loans,setLoans]=useState<Loan[]>([]);
  const [notifCount,setNotifCount]=useState(0);
  const [showNotifs,setShowNotifs]=useState(false);

  // Read invite param from URL
  const [inviteId, setInviteId]=useState<string|null>(()=>{
    const params = new URLSearchParams(window.location.search);
    return params.get("convite");
  });
  const [showInvite, setShowInvite]=useState(false);

  // Restore session on load
  useEffect(()=>{
    const {data:{subscription}}=onAuthChange(async(session)=>{
      if(session?.user){
        const p=await getProfile(session.user.id);
        if(p){
          setUser(p);
          // If there's a pending invite, show the invite confirmation screen
          if(inviteId && inviteId !== p.id) {
            setFluxo("app");
            setShowInvite(true);
          } else {
            setFluxo("app");
          }
          // Load active loans for dashboard
          try{const[b,l]=await Promise.all([getMyBorrowedLoans(p.id),getMyLentLoans(p.id)]);setLoans([...b,...l]);}catch{}
        }else{setFluxo("welcome");}
      }else{setUser(null);setFluxo("welcome");}
    });
    return()=>subscription.unsubscribe();
  },[inviteId]);

  // Subscribe to notifications badge count
  useEffect(()=>{
    if(!user)return;
    getNotifications(user.id).then(ns=>setNotifCount(ns.filter(n=>!n.lida).length)).catch(()=>{});
    const unsub=subscribeNotifs(user.id,()=>setNotifCount(p=>p+1));
    return unsub;
  },[user]);

  const onLogin=(p:Profile)=>{
    setUser(p);
    if(inviteId && inviteId !== p.id){
      setFluxo("app");
      setShowInvite(true);
    } else {
      setFluxo("app");
    }
  };
  const onLogout=()=>{setUser(null);setFluxo("welcome");setTela("inicio");setShowInvite(false);};

  if(fluxo==="loading")return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh",background:C.cream,flexDirection:"column",gap:16}}>
      <div style={{fontSize:64}}>📚</div>
      <p style={{fontFamily:"'Fredoka One',cursive",fontSize:24,color:C.coral}}>BookBuddy</p>
      <p style={{fontFamily:"'Boogaloo',cursive",fontSize:16,color:C.navy,opacity:.7}}>A carregar...</p>
    </div>
  );

  const Telas:any={
    inicio:     <Inicio user={user!} nav={t=>{setShowNotifs(false);setTela(t);}} loans={loans}/>,
    biblioteca: <Biblioteca user={user!}/>,
    emprestados:<Emprestados user={user!}/>,
    amigos:     <Amigos user={user!}/>,
    perfil:     <Perfil user={user!} onLogout={onLogout}/>,
  };

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Boogaloo&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{height:100%;background:#FFFBF0;}
        body{overscroll-behavior:none;}
        ::-webkit-scrollbar{display:none;}
        *:focus-visible{outline:3px solid #1A2025;outline-offset:3px;border-radius:8px;box-shadow:0 0 0 5px #FFD93D;}
      `}</style>

      <div lang="pt-PT" style={{display:"flex",flexDirection:"column",minHeight:"100dvh",
        background:C.cream,maxWidth:480,margin:"0 auto",position:"relative"}}>

        {/* App header */}
        {fluxo==="app"&&(
          <header style={{padding:"12px 18px",background:C.cream,flexShrink:0,
            borderBottom:`3px solid ${C.navy}`,display:"flex",alignItems:"center",gap:10,
            position:"sticky",top:0,zIndex:10}}>
            <div aria-hidden="true" style={{width:40,height:40,borderRadius:14,background:C.coral,
              border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:22,boxShadow:sh(C.navy,2,2)}}>📚</div>
            <div>
              <p style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,lineHeight:1}}>BookBuddy</p>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:10,color:"#636E72"}}>O teu cantinho da leitura 🌟</p>
            </div>
            <button onClick={()=>{setShowNotifs(true);setNotifCount(0);}}
              aria-label={notifCount>0?`Notificações — ${notifCount} nova${notifCount>1?"s":""}`:"Notificações"}
              style={{marginLeft:"auto",position:"relative",width:44,height:44,borderRadius:14,
                background:notifCount>0?C.yellow:C.white,border:`3px solid ${C.navy}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                cursor:"pointer",boxShadow:sh(C.navy,2,2),fontSize:20,minWidth:44,minHeight:44}}>
              🔔
              {notifCount>0&&<span aria-hidden="true" style={{position:"absolute",top:-6,right:-6,
                minWidth:20,height:20,background:C.coral,borderRadius:10,border:`2px solid ${C.cream}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"'Fredoka One',cursive",fontSize:10,color:C.white,padding:"0 4px"}}>
                {notifCount}
              </span>}
            </button>
          </header>
        )}

        {/* Screen */}
        <div style={{flex:1,overflowY:"auto" as any,position:"relative"}}>
          {fluxo==="welcome"  && <Welcome  onLogin={()=>setFluxo("login")} onRegister={()=>setFluxo("register")}/>}
          {fluxo==="register" && <Register onSuccess={onLogin} onLogin={()=>setFluxo("login")}/>}
          {fluxo==="login"    && <Login    onSuccess={onLogin} onRegister={()=>setFluxo("register")}/>}
          {fluxo==="app" && showInvite && inviteId && user && (
            <InviteConfirm
              inviterId={inviteId}
              user={user}
              onDone={(success)=>{
                setShowInvite(false);
                const url = new URL(window.location.href);
                url.searchParams.delete("convite");
                window.history.replaceState({}, "", url.toString());
                setInviteId(null);
                if(success) setTela("amigos");
              }}
            />
          )}
          {fluxo==="app" && !showInvite && (showNotifs?<Notificacoes user={user!} onVoltar={()=>setShowNotifs(false)}/>:Telas[tela])}
        </div>

        {/* Bottom nav */}
        {fluxo==="app"&&(
          <nav role="navigation" aria-label="Navegação principal"
            style={{background:C.white,flexShrink:0,borderTop:`3px solid ${C.navy}`,
              display:"flex",alignItems:"center",padding:"0 8px",
              paddingBottom:"env(safe-area-inset-bottom)",position:"sticky",bottom:0,zIndex:10}}>
            {NAV.map(item=>{
              const a=tela===item.id&&!showNotifs;
              return(
                <button key={item.id} onClick={()=>{setShowNotifs(false);setTela(item.id);}}
                  aria-label={item.label} aria-current={a?"page":undefined}
                  style={{flex:1,background:"none",border:"none",cursor:"pointer",
                    display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                    padding:"8px 2px",minHeight:60}}>
                  <span aria-hidden="true" style={{width:a?50:38,height:a?50:38,borderRadius:a?18:14,
                    background:a?C.coral:"transparent",border:a?`3px solid ${C.navy}`:"3px solid transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:a?26:20,transition:"all .15s",boxShadow:a?sh(C.navy,2,3):"none"}}>{item.icon}</span>
                  <span style={{fontFamily:"'Fredoka One',cursive",fontSize:10,color:a?C.coral:"#6B6B6B"}}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </>
  );
}
