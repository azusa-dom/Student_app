import{r as l,u as d,a as p,j as e}from"./index-CTZ80Z2g.js";const g=()=>{const[t,n]=l.useState(null),{login:r}=d(),o=p(),a=i=>{n(i)},s=()=>{if(!t)return;const i={id:Date.now(),name:t==="student"?"张伟":"家长用户",role:t};r(i,t),o(t==="student"?"/student":"/parent")};return e.jsxs("div",{style:{margin:0,padding:0,boxSizing:"border-box",fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",background:"linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"},children:[e.jsxs("div",{style:{position:"absolute",width:"100%",height:"100%",overflow:"hidden",zIndex:1},children:[e.jsx("div",{className:"floating-shape shape1",style:{position:"absolute",background:"rgba(255, 255, 255, 0.1)",borderRadius:"50%",width:"80px",height:"80px",top:"20%",left:"10%",animation:"float 6s ease-in-out infinite"}}),e.jsx("div",{className:"floating-shape shape2",style:{position:"absolute",background:"rgba(255, 255, 255, 0.1)",borderRadius:"50%",width:"120px",height:"120px",top:"60%",right:"15%",animation:"float 6s ease-in-out infinite 2s"}}),e.jsx("div",{className:"floating-shape shape3",style:{position:"absolute",background:"rgba(255, 255, 255, 0.1)",borderRadius:"50%",width:"60px",height:"60px",bottom:"20%",left:"20%",animation:"float 6s ease-in-out infinite 4s"}}),e.jsx("div",{className:"floating-shape shape4",style:{position:"absolute",background:"rgba(255, 255, 255, 0.1)",borderRadius:"50%",width:"100px",height:"100px",top:"10%",right:"30%",animation:"float 6s ease-in-out infinite 1s"}})]}),e.jsxs("div",{style:{position:"relative",zIndex:10,background:"rgba(255, 255, 255, 0.95)",backdropFilter:"blur(20px)",borderRadius:"24px",padding:"48px 40px",width:"100%",maxWidth:"420px",boxShadow:"0 20px 40px rgba(0, 0, 0, 0.1), 0 0 20px rgba(255, 255, 255, 0.1)",border:"1px solid rgba(255, 255, 255, 0.2)",animation:"slideUp 0.8s ease-out"},children:[e.jsxs("div",{style:{background:"linear-gradient(90deg, #10b981, #059669)",color:"white",padding:"12px 20px",borderRadius:"16px",fontSize:"14px",textAlign:"center",marginBottom:"32px",boxShadow:"0 4px 12px rgba(16, 185, 129, 0.3)",animation:"slideDown 0.8s ease-out 0.2s both"},children:[e.jsx("svg",{style:{display:"inline-block",width:"16px",height:"16px",marginRight:"8px",verticalAlign:"middle"},viewBox:"0 0 20 20",fill:"currentColor",children:e.jsx("path",{fillRule:"evenodd",d:"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",clipRule:"evenodd"})}),"身份验证已通过 · 请选择您的身份继续"]}),e.jsxs("div",{style:{textAlign:"center",marginBottom:"40px",animation:"fadeIn 0.8s ease-out 0.4s both"},children:[e.jsx("div",{style:{width:"72px",height:"72px",background:"linear-gradient(135deg, #667eea, #764ba2)",borderRadius:"20px",margin:"0 auto 24px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px",color:"white",fontWeight:"bold",boxShadow:"0 8px 24px rgba(102, 126, 234, 0.3)",animation:"logoSpin 0.8s ease-out 0.6s both"},children:"智"}),e.jsx("h1",{style:{fontSize:"32px",fontWeight:"700",color:"#1f2937",marginBottom:"8px",background:"linear-gradient(135deg, #667eea, #764ba2)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"},children:"欢迎使用"}),e.jsx("p",{style:{fontSize:"16px",color:"#6b7280",fontWeight:"400"},children:"智能校园生活助手"})]}),e.jsxs("div",{style:{marginBottom:"32px",animation:"slideUp 0.8s ease-out 0.8s both"},children:[e.jsx("h2",{style:{fontSize:"18px",fontWeight:"600",color:"#374151",marginBottom:"20px",textAlign:"center"},children:"请选择您的身份"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsxs("div",{onClick:()=>a("student"),style:{position:"relative",padding:"20px 24px",border:t==="student"?"2px solid #667eea":"2px solid #e5e7eb",borderRadius:"16px",cursor:"pointer",transition:"all 0.3s ease",background:t==="student"?"linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))":"white",display:"flex",alignItems:"center",gap:"16px",boxShadow:t==="student"?"0 8px 25px rgba(102, 126, 234, 0.15)":"none"},children:[e.jsx("div",{style:{width:"48px",height:"48px",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",flexShrink:0,background:"linear-gradient(135deg, #3b82f6, #1d4ed8)",color:"white"},children:"🎓"}),e.jsxs("div",{style:{flexGrow:1},children:[e.jsx("div",{style:{fontSize:"18px",fontWeight:"600",color:"#1f2937",marginBottom:"4px"},children:"学生"}),e.jsx("div",{style:{fontSize:"14px",color:"#6b7280",lineHeight:"1.4"},children:"管理课程、作业和校园生活，获得AI学习辅导"})]}),t==="student"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{position:"absolute",right:"16px",top:"50%",transform:"translateY(-50%)",width:"24px",height:"24px",background:"linear-gradient(135deg, #667eea, #764ba2)",borderRadius:"50%",boxShadow:"inset 0 2px 4px rgba(0, 0, 0, 0.1)"}}),e.jsx("div",{style:{position:"absolute",right:"22px",top:"50%",transform:"translateY(-50%)",color:"white",fontSize:"14px",fontWeight:"bold"},children:"✓"})]})]}),e.jsxs("div",{onClick:()=>a("parent"),style:{position:"relative",padding:"20px 24px",border:t==="parent"?"2px solid #667eea":"2px solid #e5e7eb",borderRadius:"16px",cursor:"pointer",transition:"all 0.3s ease",background:t==="parent"?"linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))":"white",display:"flex",alignItems:"center",gap:"16px",boxShadow:t==="parent"?"0 8px 25px rgba(102, 126, 234, 0.15)":"none"},children:[e.jsx("div",{style:{width:"48px",height:"48px",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",flexShrink:0,background:"linear-gradient(135deg, #f59e0b, #d97706)",color:"white"},children:"👥"}),e.jsxs("div",{style:{flexGrow:1},children:[e.jsx("div",{style:{fontSize:"18px",fontWeight:"600",color:"#1f2937",marginBottom:"4px"},children:"家长"}),e.jsx("div",{style:{fontSize:"14px",color:"#6b7280",lineHeight:"1.4"},children:"关注孩子学习动态，接收学校重要通知"})]}),t==="parent"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{position:"absolute",right:"16px",top:"50%",transform:"translateY(-50%)",width:"24px",height:"24px",background:"linear-gradient(135deg, #667eea, #764ba2)",borderRadius:"50%",boxShadow:"inset 0 2px 4px rgba(0, 0, 0, 0.1)"}}),e.jsx("div",{style:{position:"absolute",right:"22px",top:"50%",transform:"translateY(-50%)",color:"white",fontSize:"14px",fontWeight:"bold"},children:"✓"})]})]})]})]}),e.jsx("button",{onClick:s,disabled:!t,style:{width:"100%",padding:"16px 24px",background:t?"linear-gradient(135deg, #667eea, #764ba2)":"#d1d5db",color:"white",border:"none",borderRadius:"16px",fontSize:"18px",fontWeight:"600",cursor:t?"pointer":"not-allowed",transition:"all 0.3s ease",boxShadow:t?"0 4px 15px rgba(102, 126, 234, 0.4)":"none",animation:"slideUp 0.8s ease-out 1s both",opacity:t?1:.6},children:"开始使用"})]}),e.jsx("style",{children:`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes logoSpin {
            from {
              opacity: 0;
              transform: scale(0.5) rotate(-180deg);
            }
            to {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }
        `})]})};export{g as default};
