import { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════ TOKENS */
const C = {
  coral:   "#FF4757", yellow: "#FFD93D", teal: "#00D2D3",
  lavender:"#A29BFE", green:  "#6BCB77", pink: "#FD79A8",
  orange:  "#FF9F43", navy:   "#1A2025", cream:"#FFFBF0", white:"#FFFFFF",
};
const sh  = (c=C.navy,x=3,y=4) => `${x}px ${y}px 0px ${c}`;
const shB = () => `4px 6px 0px ${C.navy}`;

/* ═══════════════════════════════════════════════════════════ SVGs */
const Blob = ({color,size=120,style={}}:{color:string,size?:number,style?:any}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={style} aria-hidden="true">
    <path fill={color} d="M47,-62C59,-53,67,-36,71,-19C75,-2,76,16,70,31C64,46,50,59,35,66C19,74,2,76,-16,73C-34,70,-53,62,-64,48C-75,34,-78,13,-74,-5C-71,-23,-61,-40,-48,-51C-35,-63,-17,-69,0,-69C17,-69,35,-72,47,-62Z" transform="translate(100 100)"/>
  </svg>
);

const Wave = ({color}:{color:string}) => (
  <svg viewBox="0 0 390 40" width="390" height="40" style={{display:"block",marginBottom:-2}} aria-hidden="true">
    <path d="M0 20 Q48 0 96 20 Q144 40 192 20 Q240 0 288 20 Q336 40 390 20 L390 40 L0 40 Z" fill={color}/>
  </svg>
);

/* Friendly mascot character */
const Mascot = ({size=120,tipo="animado"}:{size?:number,tipo?:string}) => {
  const chars:any = {
    animado: (
      <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
        <ellipse cx="100" cy="122" rx="60" ry="55" fill={C.coral} stroke={C.navy} strokeWidth="3"/>
        <circle cx="100" cy="73" r="42" fill={C.orange} stroke={C.navy} strokeWidth="3"/>
        <text x="79" y="76" fontSize="18" textAnchor="middle" aria-hidden="true">⭐</text>
        <text x="119" y="76" fontSize="18" textAnchor="middle" aria-hidden="true">⭐</text>
        <path d="M76 87 Q100 110 124 87" stroke={C.navy} strokeWidth="3.5" fill={C.white} strokeLinecap="round"/>
        <ellipse cx="44" cy="100" rx="13" ry="9" fill={C.coral} stroke={C.navy} strokeWidth="2.5" transform="rotate(-50 44 100)"/>
        <ellipse cx="156" cy="100" rx="13" ry="9" fill={C.coral} stroke={C.navy} strokeWidth="2.5" transform="rotate(50 156 100)"/>
        <circle cx="32" cy="78" r="5" fill={C.yellow}/><circle cx="168" cy="75" r="4" fill={C.teal}/>
        <rect x="20" y="90" width="8" height="8" rx="2" fill={C.pink} transform="rotate(20 20 90)"/>
        <rect x="165" y="88" width="8" height="8" rx="2" fill={C.green} transform="rotate(-20 165 88)"/>
      </svg>
    ),
    triste: (
      <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
        <ellipse cx="100" cy="125" rx="58" ry="52" fill={C.lavender} stroke={C.navy} strokeWidth="3"/>
        <circle cx="100" cy="76" r="40" fill="#DFE6E9" stroke={C.navy} strokeWidth="3"/>
        <circle cx="85" cy="71" r="7" fill={C.white} stroke={C.navy} strokeWidth="2"/>
        <circle cx="115" cy="71" r="7" fill={C.white} stroke={C.navy} strokeWidth="2"/>
        <circle cx="86" cy="73" r="4" fill={C.navy}/><circle cx="116" cy="73" r="4" fill={C.navy}/>
        <path d="M88 88 Q100 80 112 88" stroke={C.navy} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <ellipse cx="48" cy="118" rx="15" ry="10" fill={C.lavender} stroke={C.navy} strokeWidth="2.5" transform="rotate(-10 48 118)"/>
        <ellipse cx="152" cy="118" rx="15" ry="10" fill={C.lavender} stroke={C.navy} strokeWidth="2.5" transform="rotate(10 152 118)"/>
      </svg>
    ),
  };
  return chars[tipo] || chars.animado;
};

/* ═══════════════════════════════════════════════════════════ INPUT */
const Input = ({id,label,type="text",value,onChange,placeholder,required=false,error=""}:any) => (
  <div style={{marginBottom:14}}>
    <label htmlFor={id} style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,display:"block",marginBottom:6}}>
      {label}{required&&<span aria-hidden="true" style={{color:C.coral}}> *</span>}
    </label>
    <input id={id} type={type} value={value} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} aria-required={required} aria-invalid={!!error}
      aria-describedby={error?`${id}-err`:undefined}
      style={{width:"100%",border:`3px solid ${error?C.coral:C.navy}`,borderRadius:14,
        padding:"12px 14px",fontSize:15,fontFamily:"'Boogaloo',cursive",
        outline:"none",boxSizing:"border-box" as any,background:C.white,
        boxShadow:sh(error?C.coral:C.navy,2,2),color:C.navy}}/>
    {error&&<p id={`${id}-err`} role="alert" style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:C.coral,marginTop:4}}>⚠️ {error}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════ BTN */
const Btn = ({children,onClick,bg=C.coral,color=C.white,outline=false,disabled=false,style={}}:any) => (
  <button onClick={onClick} disabled={disabled}
    style={{width:"100%",background:outline?"transparent":bg,color:outline?C.navy:color,
      border:`3px solid ${outline?C.navy:C.navy}`,borderRadius:18,padding:"14px",
      fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:disabled?"not-allowed":"pointer",
      boxShadow:outline?"none":shB(),minHeight:54,opacity:disabled?.6:1,...style}}>
    {children}
  </button>
);

/* ═══════════════════════════════════════════════════════════ EMPTY STATE */
const EmptyState = ({icon,title,subtitle,action,onAction}:any) => (
  <div style={{textAlign:"center",padding:"40px 24px"}}>
    <div style={{marginBottom:16}}><Mascot tipo="triste" size={120}/></div>
    <p style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,marginBottom:8}}>{icon} {title}</p>
    <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.7,marginBottom:24,lineHeight:1.6}}>{subtitle}</p>
    {action&&<button onClick={onAction}
      style={{background:C.coral,color:C.white,border:`3px solid ${C.navy}`,borderRadius:18,
        padding:"12px 28px",fontFamily:"'Fredoka One',cursive",fontSize:16,cursor:"pointer",
        boxShadow:shB()}}>
      {action}
    </button>}
  </div>
);

/* ═══════════════════════════════════════════════════════════ AUTH TYPES */
type User = { nome: string; email: string; emoji: string };

/* ═══════════════════════════════════════════════════════════ WELCOME */
function Boas_Vindas({onLogin,onRegister}:{onLogin:()=>void,onRegister:()=>void}) {
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Hero */}
      <div style={{background:C.coral,flex:1,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:"32px 24px 0",
        position:"relative",overflow:"hidden"}}>
        <Blob color="#FF6B81" size={200} style={{position:"absolute",top:-60,right:-60,opacity:.4}}/>
        <Blob color="#FF9A8A" size={140} style={{position:"absolute",bottom:40,left:-50,opacity:.35}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
          {/* Logo */}
          <div style={{width:80,height:80,borderRadius:24,background:C.white,
            border:`4px solid ${C.navy}`,display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:40,boxShadow:shB(),margin:"0 auto 20px"}}>
            📚
          </div>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:42,color:C.white,
            lineHeight:1,marginBottom:8,textShadow:`3px 3px 0 ${C.navy}`}}>
            BookBuddy
          </h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:18,color:"rgba(255,255,255,.95)",
            marginBottom:28,lineHeight:1.5}}>
            Troca livros com os teus amigos{"\n"}de forma segura e divertida! 📖
          </p>
          <Mascot size={160} tipo="animado"/>
        </div>
        <Wave color={C.cream}/>
      </div>

      {/* Actions */}
      <div style={{background:C.cream,padding:"28px 24px 32px"}}>
        {/* Feature pills */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24,flexWrap:"wrap" as any}}>
          {["📚 Empresta livros","👫 Amigos leitores","🔒 100% seguro","🌟 Gratuito"].map(f=>(
            <span key={f} style={{background:C.white,border:`2.5px solid ${C.navy}`,
              borderRadius:20,padding:"5px 12px",fontFamily:"'Boogaloo',cursive",
              fontSize:12,color:C.navy,boxShadow:sh(C.navy,1,2)}}>{f}</span>
          ))}
        </div>
        <Btn onClick={onRegister} style={{marginBottom:12}}>🚀 Criar conta grátis</Btn>
        <Btn onClick={onLogin} bg={C.navy} outline={false}>Já tenho conta</Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ REGISTER */
const EMOJIS = ["🦊","🐻","🦋","🦁","🐱","🐧","🦄","🐙","🐳","🦜","🐬","🐺"];

function Registo({onSuccess,onLogin}:{onSuccess:(u:User)=>void,onLogin:()=>void}) {
  const [nome,setNome]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [emoji,setEmoji]=useState("🦊");
  const [erros,setErros]=useState<any>({});
  const [loading,setLoading]=useState(false);
  const [step,setStep]=useState(1); // 1=info, 2=avatar

  const validar = () => {
    const e:any={};
    if(!nome.trim()) e.nome="Diz-nos o teu nome!";
    if(!email.includes("@")) e.email="E-mail inválido";
    if(pass.length<6) e.pass="A senha deve ter pelo menos 6 caracteres";
    setErros(e);
    return Object.keys(e).length===0;
  };

  const avancar = () => { if(validar()) setStep(2); };

  const registar = async () => {
    setLoading(true);
    // Simulate registration — replace with real Supabase call later
    await new Promise(r=>setTimeout(r,1000));
    setLoading(false);
    onSuccess({nome:nome.trim(),email,emoji});
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflowY:"auto" as any}}>
      {/* Header */}
      <div style={{background:C.teal,padding:"20px 20px 0",position:"relative",overflow:"hidden",flexShrink:0}}>
        <Blob color="#00B5B6" size={150} style={{position:"absolute",right:-30,top:-40,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={()=>step===2?setStep(1):onLogin()}
            style={{background:C.navy,color:C.white,border:"none",borderRadius:12,
              padding:"8px 16px",fontFamily:"'Fredoka One',cursive",fontSize:13,
              cursor:"pointer",marginBottom:12,minHeight:44}}>
            ← Voltar
          </button>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:C.navy}}>
            {step===1?"Criar conta 🎉":"Escolhe o teu avatar!"}
          </h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:.8,marginBottom:14}}>
            {step===1?"É rápido e gratuito":"Quem és tu no mundo da leitura?"}
          </p>
          {/* Step indicator */}
          <div style={{display:"flex",gap:6,marginBottom:4}}>
            {[1,2].map(s=>(
              <div key={s} style={{height:5,flex:1,borderRadius:3,
                background:s<=step?C.navy:"rgba(0,0,0,.2)"}}/>
            ))}
          </div>
        </div>
        <Wave color={C.cream}/>
      </div>

      <div style={{background:C.cream,padding:"16px 20px 40px",flex:1}}>
        {step===1 ? (
          <>
            <Input id="nome" label="O teu nome" value={nome} onChange={setNome}
              placeholder="ex: Francisco" required error={erros.nome}/>
            <Input id="email" label="E-mail" type="email" value={email} onChange={setEmail}
              placeholder="francisco@email.com" required error={erros.email}/>
            <Input id="pass" label="Senha" type="password" value={pass} onChange={setPass}
              placeholder="Mínimo 6 caracteres" required error={erros.pass}/>

            <div style={{background:C.green+"33",borderRadius:14,padding:"12px 16px",
              border:`2.5px solid ${C.green}`,marginBottom:20,display:"flex",gap:10}}>
              <span aria-hidden="true" style={{fontSize:20}}>🔒</span>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,lineHeight:1.6}}>
                A tua biblioteca é privada — só os teus amigos podem ver os teus livros.
              </p>
            </div>
            <Btn onClick={avancar}>Continuar →</Btn>
          </>
        ) : (
          <>
            <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,marginBottom:16,lineHeight:1.5}}>
              Escolhe o emoji que te representa! Será o teu avatar no BookBuddy. 👇
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
              {EMOJIS.map(e=>(
                <button key={e} onClick={()=>setEmoji(e)}
                  aria-label={`Escolher ${e}`} aria-pressed={emoji===e}
                  style={{aspectRatio:"1",fontSize:36,borderRadius:18,
                    border:`3px solid ${emoji===e?C.coral:C.navy}`,
                    background:emoji===e?C.coral+"22":C.white,
                    cursor:"pointer",
                    boxShadow:emoji===e?sh(C.coral,2,3):sh(C.navy,2,2),
                    transition:"all .15s"}}>
                  {e}
                </button>
              ))}
            </div>
            {/* Preview */}
            <div style={{background:C.yellow,borderRadius:18,padding:"14px",
              border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),
              display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
              <div style={{width:52,height:52,borderRadius:16,background:C.white,
                border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:28}}>
                {emoji}
              </div>
              <div>
                <p style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.navy}}>{nome}</p>
                <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>Pronto para ler! 📚</p>
              </div>
            </div>
            <Btn onClick={registar} disabled={loading}>
              {loading?"A criar conta...":"🎉 Começar a ler!"}
            </Btn>
          </>
        )}
        <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,
          opacity:.7,textAlign:"center",marginTop:16}}>
          Já tens conta?{" "}
          <button onClick={onLogin} style={{background:"none",border:"none",
            color:C.coral,fontFamily:"'Fredoka One',cursive",fontSize:13,
            cursor:"pointer",textDecoration:"underline"}}>
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ LOGIN */
function Login({onSuccess,onRegister}:{onSuccess:(u:User)=>void,onRegister:()=>void}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [erro,setErro]=useState("");
  const [loading,setLoading]=useState(false);

  const entrar = async () => {
    if(!email.includes("@")||!pass){setErro("Por favor preenche todos os campos.");return;}
    setErro("");setLoading(true);
    // Simulate login — replace with Supabase later
    await new Promise(r=>setTimeout(r,900));
    setLoading(false);
    // For now accept any login — replace with real auth
    onSuccess({nome:email.split("@")[0],email,emoji:"🦊"});
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{background:C.lavender,padding:"20px 20px 0",position:"relative",overflow:"hidden",flexShrink:0}}>
        <Blob color="#BDB2FF" size={160} style={{position:"absolute",right:-40,top:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>Bem-vindo! 👋</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.8,marginBottom:14}}>
            Entra para ver a tua biblioteca
          </p>
          <div style={{display:"flex",justifyContent:"center",marginBottom:-10}}>
            <Mascot size={130} tipo="animado"/>
          </div>
        </div>
        <Wave color={C.cream}/>
      </div>

      <div style={{background:C.cream,padding:"16px 20px 40px",flex:1}}>
        {erro&&<div role="alert" style={{background:"#FFE5E5",border:`2.5px solid ${C.coral}`,
          borderRadius:14,padding:"10px 14px",marginBottom:14,
          fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy}}>⚠️ {erro}</div>}
        <Input id="email-l" label="E-mail" type="email" value={email} onChange={setEmail}
          placeholder="francisco@email.com"/>
        <Input id="pass-l" label="Senha" type="password" value={pass} onChange={setPass}
          placeholder="A tua senha"/>

        <div style={{textAlign:"right",marginBottom:20}}>
          <button style={{background:"none",border:"none",color:C.teal,
            fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer"}}>
            Esqueci a senha
          </button>
        </div>

        <Btn onClick={entrar} disabled={loading} style={{marginBottom:12}}>
          {loading?"A entrar...":"Entrar →"}
        </Btn>
        <Btn onClick={onRegister} outline bg={C.navy}>Criar conta grátis 🚀</Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ MAIN APP */

/* ── DASHBOARD ── */
function Inicio({user,nav}:{user:User,nav:(t:string)=>void}) {
  return (
    <main id="cp" tabIndex={-1}>
      <div style={{background:C.coral,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#FF6B81" size={180} style={{position:"absolute",top:-60,right:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:"rgba(255,255,255,.9)"}}>BEM-VINDO! 🌟</p>
              <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:34,color:C.white,lineHeight:1.1}}>
                Olá, {user.nome}! {user.emoji}
              </h1>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:"rgba(255,255,255,.9)"}}>
                A tua biblioteca está à espera!
              </p>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:10}}>
            <Mascot size={140} tipo="animado"/>
          </div>
        </div>
        <Wave color={C.cream}/>
      </div>

      <div style={{background:C.cream,padding:"0 18px 24px"}}>
        {/* Stats — all zero */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:22}}>
          {[
            {n:0,l:"Meus Livros",bg:C.yellow,i:"📚"},
            {n:0,l:"Emprestados",bg:C.teal,i:"📖"},
            {n:0,l:"Amigos",bg:C.lavender,i:"👫"},
          ].map(s=>(
            <div key={s.l} style={{background:s.bg,borderRadius:18,padding:"14px 10px",
              textAlign:"center",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy)}}>
              <span aria-hidden="true" style={{fontSize:26,display:"block"}}>{s.i}</span>
              <span style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:C.navy,display:"block"}}>{s.n}</span>
              <span style={{fontFamily:"'Boogaloo',cursive",fontSize:11,color:C.navy}}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:12}}>
          Por onde começar? 🚀
        </h2>
        {[
          {icon:"📚",title:"Adicionar o primeiro livro",sub:"Coloca os teus livros na estante",tela:"biblioteca",bg:C.orange},
          {icon:"👫",title:"Convidar um amigo",sub:"Convida amigos para trocar livros",tela:"amigos",bg:C.lavender},
        ].map(a=>(
          <button key={a.tela} onClick={()=>nav(a.tela)}
            style={{width:"100%",background:a.bg,borderRadius:20,padding:"16px 18px",
              border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),
              display:"flex",alignItems:"center",gap:14,marginBottom:12,
              cursor:"pointer",textAlign:"left" as any,minHeight:72}}>
            <span style={{fontSize:38}}>{a.icon}</span>
            <div>
              <p style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:C.navy}}>{a.title}</p>
              <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,opacity:.8}}>{a.sub}</p>
            </div>
            <span style={{marginLeft:"auto",fontSize:20,color:C.navy}}>→</span>
          </button>
        ))}
      </div>
    </main>
  );
}

/* ── BIBLIOTECA ── */
function Biblioteca() {
  const [livros,setLivros]=useState<any[]>([]);
  const [modal,setModal]=useState(false);
  const [novo,setNovo]=useState({titulo:"",autor:"",descricaoUsuario:"",capa:null as any,prev:null as any});
  const [filtro,setFiltro]=useState("Todos");
  const ref=useRef<any>();
  const inpRef=useRef<any>();
  const btnRef=useRef<any>();

  useEffect(()=>{if(modal)setTimeout(()=>ref.current?.focus(),60);},[modal]);
  const fechar=()=>{setModal(false);setNovo({titulo:"",autor:"",descricaoUsuario:"",capa:null,prev:null});setTimeout(()=>btnRef.current?.focus(),50);};

  const onArq=(e:any)=>{
    const a=e.target.files[0];if(!a||!a.type.startsWith("image/"))return;
    const r=new FileReader();r.onload=(ev:any)=>setNovo(p=>({...p,capa:ev.target.result,prev:ev.target.result}));r.readAsDataURL(a);
  };

  const TIPOS=["av","fa","cl","en","an","tr"];
  const BGS=[C.orange,C.teal,C.yellow,C.green,C.lavender,C.pink];
  const generos=["Todos","Aventura","Fantasia","Clássico","Engraçado","Outros"];
  const filtrados=livros.filter(l=>filtro==="Todos"||l.genero===filtro);

  return (
    <main id="cp" tabIndex={-1}>
      <div style={{background:C.teal,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#00B5B6" size={150} style={{position:"absolute",right:-30,top:-40,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>📚 Minha Biblioteca</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.9,marginBottom:16}}>
            {livros.length===0?"A tua estante está vazia — adiciona o primeiro livro!": `${livros.length} livro${livros.length>1?"s":""} na tua estante!`}
          </p>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"8px 18px 24px"}}>
        {livros.length>0&&(
          <div style={{display:"flex",gap:8,overflowX:"auto" as any,marginBottom:14,paddingBottom:4}}>
            {generos.map(g=><button key={g} onClick={()=>setFiltro(g)} aria-pressed={filtro===g}
              style={{background:filtro===g?C.navy:C.white,color:filtro===g?C.white:C.navy,
                border:`2.5px solid ${C.navy}`,borderRadius:20,padding:"7px 16px",
                fontFamily:"'Fredoka One',cursive",fontSize:12,cursor:"pointer",
                whiteSpace:"nowrap" as any,minHeight:44}}>{g}</button>)}
          </div>
        )}

        <button ref={btnRef} onClick={()=>setModal(true)}
          style={{width:"100%",background:C.coral,color:C.white,border:`3px solid ${C.navy}`,
            borderRadius:20,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,
            cursor:"pointer",marginBottom:16,boxShadow:shB(),
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:54}}>
          ➕ Adicionar Livro!
        </button>

        {livros.length===0
          ? <EmptyState icon="📚" title="Estante vazia!"
              subtitle={"Adiciona os teus livros para que os\nteus amigos possam pedir emprestado."}
              action="➕ Adicionar primeiro livro" onAction={()=>setModal(true)}/>
          : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {filtrados.map((livro,i)=>(
                <div key={livro.id} style={{background:livro.bgColor,borderRadius:20,
                  padding:"16px 14px",border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),textAlign:"center"}}>
                  {livro.capa
                    ? <img src={livro.capa} alt={`Capa: ${livro.titulo}`}
                        style={{width:70,height:98,objectFit:"cover",borderRadius:10,
                          border:`3px solid ${C.navy}`,margin:"0 auto 8px",display:"block"}}/>
                    : <div style={{fontSize:48,marginBottom:8}}>📚</div>
                  }
                  <p style={{fontFamily:"'Fredoka One',cursive",fontSize:13,color:C.navy,lineHeight:1.2}}>
                    {livro.titulo.length>22?livro.titulo.slice(0,22)+"…":livro.titulo}
                  </p>
                  <span style={{display:"inline-block",marginTop:8,background:C.green,color:C.navy,
                    borderRadius:10,padding:"3px 10px",fontFamily:"'Fredoka One',cursive",
                    fontSize:10,border:`2px solid ${C.navy}`}}>✓ LIVRE</span>
                </div>
              ))}
            </div>
        }

        {/* Modal */}
        {modal&&(
          <div role="presentation" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",
            display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={fechar}>
            <div ref={ref} role="dialog" aria-modal={true} aria-labelledby="mt" tabIndex={-1}
              onClick={(e:any)=>e.stopPropagation()}
              style={{background:C.cream,borderRadius:"28px 28px 0 0",padding:"20px 20px 46px",
                width:"100%",maxWidth:480,border:`3px solid ${C.navy}`,borderBottom:"none",
                maxHeight:"90vh",overflowY:"auto" as any}}>
              <h2 id="mt" style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,textAlign:"center",marginBottom:16}}>
                ➕ Adicionar Livro!
              </h2>

              {/* Photo upload */}
              <div style={{border:`3px solid ${C.navy}`,borderRadius:16,padding:"14px",marginBottom:14}}>
                <p style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,marginBottom:8}}>📸 Foto da capa (opcional)</p>
                {novo.prev
                  ? <div style={{textAlign:"center"}}>
                      <img src={novo.prev} alt="Pré-visualização" style={{width:90,height:126,objectFit:"cover",
                        borderRadius:10,border:`3px solid ${C.navy}`,display:"block",margin:"0 auto 10px"}}/>
                      <button onClick={()=>setNovo(p=>({...p,capa:null,prev:null}))} style={{background:"#FFE5E5",color:C.coral,
                        border:`2px solid ${C.coral}`,borderRadius:12,padding:"7px 14px",
                        fontFamily:"'Fredoka One',cursive",fontSize:13,cursor:"pointer",minHeight:44}}>
                        ✕ Remover
                      </button>
                    </div>
                  : <label htmlFor="inp-capa" style={{display:"block",textAlign:"center",background:C.teal,color:C.navy,
                      border:`3px solid ${C.navy}`,borderRadius:14,padding:"10px",
                      fontFamily:"'Fredoka One',cursive",fontSize:14,cursor:"pointer",boxShadow:sh(C.navy,2,2)}}>
                      📷 Escolher foto
                      <input id="inp-capa" ref={inpRef} type="file" accept="image/*" onChange={onArq}
                        style={{position:"absolute",width:1,height:1,opacity:0}}/>
                    </label>
                }
              </div>

              <Input id="titulo" label="Título" value={novo.titulo} onChange={(v:string)=>setNovo(p=>({...p,titulo:v}))}
                placeholder="ex: Harry Potter" required/>
              <Input id="autor" label="Autor" value={novo.autor} onChange={(v:string)=>setNovo(p=>({...p,autor:v}))}
                placeholder="ex: J.K. Rowling"/>
              <div style={{marginBottom:16}}>
                <label htmlFor="desc" style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:C.navy,display:"block",marginBottom:6}}>
                  ✏️ A tua opinião
                </label>
                <textarea id="desc" value={novo.descricaoUsuario}
                  onChange={(e:any)=>setNovo(p=>({...p,descricaoUsuario:e.target.value}))}
                  placeholder="O que achaste deste livro? Recomendas?" rows={3}
                  style={{width:"100%",border:`3px solid ${C.navy}`,borderRadius:14,padding:"12px 14px",
                    fontSize:14,fontFamily:"'Boogaloo',cursive",outline:"none",
                    boxSizing:"border-box" as any,background:C.white,boxShadow:sh(C.navy,2,2),
                    color:C.navy,resize:"vertical" as any}}/>
              </div>
              <button onClick={()=>{
                if(!novo.titulo.trim())return;
                const idx=livros.length%6;
                setLivros(p=>[...p,{id:"l"+Date.now(),titulo:novo.titulo,autor:novo.autor,
                  descricaoUsuario:novo.descricaoUsuario,capa:novo.capa,
                  bgColor:BGS[idx],genero:"Outros",disponivel:true}]);
                fechar();
              }} style={{width:"100%",background:C.coral,color:C.white,border:`3px solid ${C.navy}`,
                borderRadius:18,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,
                cursor:"pointer",boxShadow:shB(),minHeight:54,marginBottom:10}}>
                Guardar! 🎉
              </button>
              <button onClick={fechar} style={{width:"100%",background:"transparent",color:C.navy,
                border:`2px solid ${C.navy}`,borderRadius:18,padding:"10px",
                fontFamily:"'Fredoka One',cursive",fontSize:15,cursor:"pointer",minHeight:44}}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ── EMPRESTADOS ── */
function Emprestados() {
  return (
    <main id="cp" tabIndex={-1}>
      <div style={{background:C.orange,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#FFBE76" size={160} style={{position:"absolute",right:-30,top:-40,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>📖 Lendo Agora</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.9,marginBottom:14}}>
            Livros que tens emprestados
          </p>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"8px 18px 100px"}}>
        <EmptyState icon="📖" title="Nenhum livro emprestado"
          subtitle={"Quando pedires um livro emprestado\na um amigo, aparece aqui."}/>
      </div>
    </main>
  );
}

/* ── AMIGOS ── */
function Amigos() {
  const [modal,setModal]=useState(false);
  const [email,setEmail]=useState("");
  const [erro,setErro]=useState("");
  const [enviado,setEnviado]=useState(false);
  const ref=useRef<any>();
  const btnRef=useRef<any>();

  useEffect(()=>{if(modal)setTimeout(()=>ref.current?.focus(),60);},[modal]);
  const fechar=()=>{setModal(false);setEmail("");setErro("");setEnviado(false);setTimeout(()=>btnRef.current?.focus(),50);};

  const enviar=()=>{
    if(!email.includes("@")){setErro("E-mail inválido. Tenta novamente!");return;}
    setErro("");setEnviado(true);
  };

  return (
    <main id="cp" tabIndex={-1}>
      <div style={{background:C.lavender,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#BDB2FF" size={160} style={{position:"absolute",right:-40,top:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1}}>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.navy}}>👫 Amigos Leitores</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:15,color:C.navy,opacity:.85,marginBottom:14}}>
            Só amigos veem a tua biblioteca 🔒
          </p>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"8px 18px 24px"}}>
        <div style={{background:C.green,borderRadius:18,padding:"14px 18px",border:`3px solid ${C.navy}`,
          boxShadow:sh(C.navy),display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
          <span aria-hidden="true" style={{fontSize:32}}>🔒</span>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,lineHeight:1.5}}>
            A tua biblioteca é privada. Apenas os teus Amigos Leitores podem ver e pedir os teus livros.
          </p>
        </div>
        <button ref={btnRef} onClick={()=>setModal(true)}
          style={{width:"100%",background:C.lavender,color:C.navy,border:`3px solid ${C.navy}`,
            borderRadius:20,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,
            cursor:"pointer",marginBottom:20,boxShadow:shB(),
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:54}}>
          ➕ Convidar Amigo Leitor
        </button>
        <EmptyState icon="👫" title="Ainda sem amigos"
          subtitle={"Convida os teus amigos por e-mail\npara começarem a trocar livros!"}/>

        {/* Modal convite */}
        {modal&&(
          <div role="presentation" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",
            display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={fechar}>
            <div ref={ref} role="dialog" aria-modal={true} aria-labelledby="ma" tabIndex={-1}
              onClick={(e:any)=>e.stopPropagation()}
              style={{background:C.cream,borderRadius:"28px 28px 0 0",padding:"0",
                width:"100%",maxWidth:480,border:`3px solid ${C.navy}`,borderBottom:"none"}}>
              <div style={{background:C.lavender,borderRadius:"25px 25px 0 0",padding:"22px 20px 0",textAlign:"center",position:"relative",overflow:"hidden"}}>
                <Blob color={C.white} size={140} style={{position:"absolute",right:-30,top:-40,opacity:.15}}/>
                <Mascot size={90} tipo="animado"/>
                <h2 id="ma" style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.navy,marginTop:4,marginBottom:4}}>
                  {enviado?"Convite Enviado! 🎉":"Convidar Amigo Leitor"}
                </h2>
                <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:.8,marginBottom:16}}>
                  {enviado?"O teu amigo vai receber um e-mail!":"Envia um convite por e-mail"}
                </p>
                <Wave color={C.cream}/>
              </div>
              <div style={{padding:"16px 20px 40px"}}>
                {!enviado ? (
                  <>
                    <div style={{background:C.teal+"33",borderRadius:14,padding:"12px 16px",
                      border:`2.5px solid ${C.teal}`,marginBottom:18,display:"flex",gap:10}}>
                      <span aria-hidden="true" style={{fontSize:20}}>📧</span>
                      <p style={{fontFamily:"'Boogaloo',cursive",fontSize:13,color:C.navy,lineHeight:1.5}}>
                        O teu amigo vai receber um convite para se juntar ao BookBuddy. Depois de aceitar, podem partilhar livros!
                      </p>
                    </div>
                    <Input id="inv-email" label="E-mail do amigo" type="email" value={email}
                      onChange={setEmail} placeholder="amigo@email.com" required error={erro}/>
                    <button onClick={enviar} style={{width:"100%",background:C.lavender,color:C.navy,
                      border:`3px solid ${C.navy}`,borderRadius:18,padding:"14px",
                      fontFamily:"'Fredoka One',cursive",fontSize:18,cursor:"pointer",
                      boxShadow:shB(),minHeight:54,marginBottom:10}}>
                      📨 Enviar Convite!
                    </button>
                    <button onClick={fechar} style={{width:"100%",background:"transparent",color:C.navy,
                      border:`2px solid ${C.navy}`,borderRadius:18,padding:"10px",
                      fontFamily:"'Fredoka One',cursive",fontSize:15,cursor:"pointer",minHeight:44}}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{background:C.green,borderRadius:18,padding:"18px",
                      border:`3px solid ${C.navy}`,boxShadow:sh(C.navy),textAlign:"center",marginBottom:16}}>
                      <p style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:6}}>🎉 Convite enviado!</p>
                      <p style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,
                        background:"rgba(255,255,255,.5)",borderRadius:10,padding:"8px 12px",marginTop:8}}>
                        ✉️ {email}
                      </p>
                    </div>
                    <button onClick={()=>{setEnviado(false);setEmail("");}} style={{width:"100%",background:C.lavender,color:C.navy,
                      border:`3px solid ${C.navy}`,borderRadius:18,padding:"14px",
                      fontFamily:"'Fredoka One',cursive",fontSize:16,cursor:"pointer",boxShadow:shB(),minHeight:54,marginBottom:10}}>
                      👥 Convidar outro amigo
                    </button>
                    <button onClick={fechar} style={{width:"100%",background:"transparent",color:C.navy,
                      border:`2px solid ${C.navy}`,borderRadius:18,padding:"10px",
                      fontFamily:"'Fredoka One',cursive",fontSize:15,cursor:"pointer",minHeight:44}}>
                      Fechar
                    </button>
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

/* ── PERFIL ── */
function Perfil({user,onLogout}:{user:User,onLogout:()=>void}) {
  const [notifs,setNotifs]=useState(true);
  const [pais,setPais]=useState(false);
  const Tog=({v,onChange,id,rot}:any)=>(
    <button id={id} role="switch" aria-checked={v} onClick={()=>onChange(!v)} aria-label={rot}
      style={{width:50,height:28,borderRadius:14,background:v?C.teal:"#999",position:"relative",
        cursor:"pointer",border:`2.5px solid ${C.navy}`,transition:"background .2s",
        boxShadow:sh(C.navy,1,2),flexShrink:0,minWidth:44,minHeight:44,display:"flex",alignItems:"center"}}>
      <span style={{width:20,height:20,borderRadius:10,background:C.white,position:"absolute",
        top:2,left:v?24:2,transition:"left .2s",border:`1.5px solid ${C.navy}`}}/>
    </button>
  );
  return (
    <main id="cp" tabIndex={-1}>
      <div style={{background:C.pink,padding:"20px 20px 0",position:"relative",overflow:"hidden"}}>
        <Blob color="#FD91B8" size={170} style={{position:"absolute",right:-40,top:-50,opacity:.45}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
          <div style={{width:72,height:72,borderRadius:22,background:C.yellow,
            border:`4px solid ${C.navy}`,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:38,boxShadow:shB(),margin:"0 auto 8px"}}>{user.emoji}</div>
          <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:C.navy}}>{user.nome}</h1>
          <p style={{fontFamily:"'Boogaloo',cursive",fontSize:14,color:C.navy,opacity:.85,marginBottom:12}}>
            {user.email}
          </p>
        </div>
        <Wave color={C.cream}/>
      </div>
      <div style={{background:C.cream,padding:"4px 18px 100px"}}>
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,marginBottom:12}}>⚙️ Definições</h2>
        <div style={{background:C.white,borderRadius:20,border:`3px solid ${C.navy}`,
          boxShadow:sh(C.navy),overflow:"hidden",marginBottom:14}}>
          {[
            {id:"tn",l:"Notificações",s:"Actualizações sobre os teus livros",v:notifs,fn:setNotifs},
            {id:"tp",l:"Modo Pais 👨‍👩‍👧",s:"Pais aprovam pedidos de amizade",v:pais,fn:setPais},
          ].map((item,i)=>(
            <div key={item.id} style={{padding:"16px 18px",borderTop:i>0?"2px solid #F0F0F0":"none",
              display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <label htmlFor={item.id} style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,display:"block"}}>{item.l}</label>
                <p style={{fontFamily:"'Boogaloo',cursive",fontSize:12,color:"#636E72",marginTop:2}}>{item.s}</p>
              </div>
              <Tog id={item.id} v={item.v} onChange={item.fn} rot={item.l}/>
            </div>
          ))}
        </div>
        <div style={{background:C.white,borderRadius:20,border:`3px solid ${C.navy}`,
          boxShadow:sh(C.navy),overflow:"hidden",marginBottom:16}}>
          {["Privacidade 🔒","Ajuda e Suporte 🆘"].map((item,i)=>(
            <button key={item} style={{width:"100%",padding:"16px 18px",borderTop:i>0?"2px solid #F0F0F0":"none",
              display:"flex",alignItems:"center",justifyContent:"space-between",
              background:"none",border:"none",cursor:"pointer",minHeight:54,
              fontFamily:"'Fredoka One',cursive",fontSize:15,color:C.navy,textAlign:"left" as any}}>
              {item}<span aria-hidden="true" style={{color:"#B2BEC3"}}>→</span>
            </button>
          ))}
        </div>
        <button onClick={onLogout}
          style={{width:"100%",background:C.coral,color:C.white,border:`3px solid ${C.navy}`,
            borderRadius:20,padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:18,
            cursor:"pointer",boxShadow:shB(),minHeight:54}}>
          👋 Sair
        </button>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════ ROOT */
const NAV=[
  {id:"inicio",icon:"🏠",label:"Início"},
  {id:"biblioteca",icon:"📚",label:"Biblioteca"},
  {id:"emprestados",icon:"📖",label:"Lendo"},
  {id:"amigos",icon:"👫",label:"Amigos"},
  {id:"perfil",icon:"🦊",label:"Eu"},
];

export default function App() {
  // "welcome" | "login" | "register" | "app"
  const [fluxo,setFluxo]=useState<string>("welcome");
  const [user,setUser]=useState<User|null>(null);
  const [tela,setTela]=useState("inicio");

  const onLogin=(u:User)=>{setUser(u);setFluxo("app");};
  const onLogout=()=>{setUser(null);setFluxo("welcome");setTela("inicio");};

  const Telas:any={
    inicio:     <Inicio user={user!} nav={setTela}/>,
    biblioteca: <Biblioteca/>,
    emprestados:<Emprestados/>,
    amigos:     <Amigos/>,
    perfil:     <Perfil user={user!} onLogout={onLogout}/>,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Boogaloo&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{display:none;}
        *:focus-visible{outline:3px solid #1A2025;outline-offset:3px;border-radius:8px;box-shadow:0 0 0 5px #FFD93D;}
      `}</style>

      <div lang="pt-PT" style={{display:"flex",alignItems:"center",justifyContent:"center",
        minHeight:"100vh",background:"#1A2025",padding:16}}>
        {/* BG blobs */}
        {[{c:C.coral,t:"5%",l:"-3%"},{c:C.yellow,t:"40%",l:"-2%"},{c:C.teal,t:"75%",l:"-3%"},
          {c:C.lavender,t:"10%",r:"-3%"},{c:C.green,t:"50%",r:"-2%"},{c:C.pink,t:"80%",r:"-3%"}].map((b,i)=>(
          <div key={i} aria-hidden="true" style={{position:"fixed",width:120,height:120,borderRadius:"50%",
            background:b.c,opacity:.15,top:b.t,left:(b as any).l||"auto",right:(b as any).r||"auto",pointerEvents:"none"}}/>
        ))}

        {/* Phone shell */}
        <div style={{width:390,height:844,background:C.cream,borderRadius:50,
          boxShadow:"0 0 0 10px #111,0 0 0 12px #333,0 50px 120px rgba(0,0,0,.8)",
          overflow:"hidden",position:"relative",display:"flex",flexDirection:"column"}}>

          {/* Status bar */}
          <div style={{height:48,background:C.cream,display:"flex",alignItems:"center",
            justifyContent:"space-between",padding:"0 24px",flexShrink:0,position:"relative"}} aria-hidden="true">
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:13,color:C.navy}}>9:41</span>
            <div style={{width:110,height:26,background:C.navy,borderRadius:20,
              position:"absolute",left:"50%",transform:"translateX(-50%)"}}/>
            <span style={{fontSize:13}}>📶🔋</span>
          </div>

          {/* App header — only shown in main app */}
          {fluxo==="app"&&(
            <div style={{padding:"8px 18px 10px",background:C.cream,flexShrink:0,
              borderBottom:`3px solid ${C.navy}`,display:"flex",alignItems:"center",gap:10}}>
              <div aria-hidden="true" style={{width:40,height:40,borderRadius:14,background:C.coral,
                border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:22,boxShadow:sh(C.navy,2,2)}}>📚</div>
              <div>
                <p style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:C.navy,lineHeight:1}}>BookBuddy</p>
                <p style={{fontFamily:"'Boogaloo',cursive",fontSize:10,color:"#636E72"}}>O teu cantinho da leitura 🌟</p>
              </div>
              <div style={{marginLeft:"auto"}}>
                <button aria-label="Notificações" style={{width:44,height:44,borderRadius:14,
                  background:C.white,border:`3px solid ${C.navy}`,display:"flex",alignItems:"center",
                  justifyContent:"center",cursor:"pointer",boxShadow:sh(C.navy,2,2),fontSize:20}}>
                  🔔
                </button>
              </div>
            </div>
          )}

          {/* Screen content */}
          <div style={{flex:1,overflowY:"auto",position:"relative"}}>
            {fluxo==="welcome" && <Boas_Vindas onLogin={()=>setFluxo("login")} onRegister={()=>setFluxo("register")}/>}
            {fluxo==="register" && <Registo onSuccess={onLogin} onLogin={()=>setFluxo("login")}/>}
            {fluxo==="login" && <Login onSuccess={onLogin} onRegister={()=>setFluxo("register")}/>}
            {fluxo==="app" && Telas[tela]}
          </div>

          {/* Bottom nav — only in main app */}
          {fluxo==="app"&&(
            <nav role="navigation" aria-label="Navegação principal"
              style={{height:76,background:C.white,flexShrink:0,
                borderTop:`3px solid ${C.navy}`,display:"flex",alignItems:"center",padding:"0 8px 6px"}}>
              {NAV.map(item=>{
                const a=tela===item.id;
                return (
                  <button key={item.id} onClick={()=>setTela(item.id)}
                    aria-label={item.label} aria-current={a?"page":undefined}
                    style={{flex:1,background:"none",border:"none",cursor:"pointer",
                      display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                      padding:"4px 2px",minHeight:44}}>
                    <span aria-hidden="true" style={{width:a?50:38,height:a?50:38,
                      borderRadius:a?18:14,background:a?C.coral:"transparent",
                      border:a?`3px solid ${C.navy}`:"3px solid transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:a?26:20,transition:"all .15s",
                      boxShadow:a?sh(C.navy,2,3):"none"}}>{item.icon}</span>
                    <span style={{fontFamily:"'Fredoka One',cursive",fontSize:10,
                      color:a?C.coral:"#6B6B6B"}}>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
