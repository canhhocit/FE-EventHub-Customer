import { useState } from "react";
import { KeyRound, Eye, EyeOff, Loader2, X } from "lucide-react";

export default function ForceChangePasswordModal({ onSuccess }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("Mat khau phai co it nhat 6 ky tu."); return; }
    if (newPassword !== confirmPassword) { setError("Mat khau xac nhan khong khop."); return; }
    if (newPassword === "123456") { setError("Vui long chon mat khau moi khac mat khau tam thoi."); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch((import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/users/change-password-after-reset", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ newPassword })
      }).then(r => r.json()).then(d => { if (d.code !== 1000) throw new Error(d.message); });
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Doi mat khau that bai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)"}}>
      <div style={{width:"100%",maxWidth:440,background:"#fff",borderRadius:20,boxShadow:"0 25px 50px rgba(0,0,0,0.25)",padding:"2rem",margin:"0 1rem"}}>
        <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:56,height:56,borderRadius:16,background:"#fef3c7",color:"#d97706",marginBottom:"1rem"}}>
            <KeyRound size={28} />
          </div>
          <h2 style={{fontWeight:700,fontSize:"1.2rem",color:"#1e293b",margin:0}}>Doi mat khau bat buoc</h2>
          <p style={{color:"#64748b",fontSize:"0.875rem",marginTop:"0.5rem",lineHeight:1.6}}>
            Tai khoan cua ban vua duoc quan tri vien dat lai mat khau. Vui long dat mat khau moi de tiep tuc.
          </p>
        </div>
        {error && (
          <div style={{background:"#fff1f2",border:"1px solid #fecdd3",borderRadius:12,padding:"0.75rem",color:"#e11d48",fontSize:"0.875rem",display:"flex",gap:"0.5rem",marginBottom:"1rem"}}>
            <X size={16} style={{flexShrink:0,marginTop:2}} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          <div>
            <label style={{display:"block",fontSize:"0.75rem",fontWeight:600,color:"#475569",marginBottom:"0.375rem"}}>MAT KHAU MOI</label>
            <div style={{position:"relative"}}>
              <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Toi thieu 6 ky tu" style={{width:"100%",padding:"0.625rem 2.5rem 0.625rem 1rem",border:"1px solid #e2e8f0",borderRadius:12,fontSize:"0.875rem",outline:"none",boxSizing:"border-box"}} required autoFocus />
              <button type="button" onClick={() => setShowNew(v => !v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94a3b8"}} tabIndex={-1}>{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <div>
            <label style={{display:"block",fontSize:"0.75rem",fontWeight:600,color:"#475569",marginBottom:"0.375rem"}}>XAC NHAN MAT KHAU MOI</label>
            <div style={{position:"relative"}}>
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhap lai mat khau moi" style={{width:"100%",padding:"0.625rem 2.5rem 0.625rem 1rem",border:"1px solid #e2e8f0",borderRadius:12,fontSize:"0.875rem",outline:"none",boxSizing:"border-box"}} required />
              <button type="button" onClick={() => setShowConfirm(v => !v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94a3b8"}} tabIndex={-1}>{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <button type="submit" disabled={loading || !newPassword || !confirmPassword} style={{padding:"0.75rem",borderRadius:12,background:"#f59e0b",color:"#fff",fontWeight:600,fontSize:"0.875rem",border:"none",cursor:"pointer",opacity:(loading || !newPassword || !confirmPassword) ? 0.6 : 1,display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}>
            {loading ? <><Loader2 size={16} className="spin" /> Dang cap nhat...</> : "Dat mat khau moi"}
          </button>
        </form>
      </div>
    </div>
  );
}