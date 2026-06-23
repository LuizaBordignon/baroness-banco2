import { useState, useCallback, useEffect } from "react";


// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#F0EFEC",
  surface: "#FFFFFF",
  sidebar: "#111111",
  sidebarText: "#777777",
  accent: "#CC2222",
  accentHover: "#AA1A1A",
  text: "#111111",
  muted: "#888888",
  border: "#E3E3E0",
  tableHead: "#F7F7F5",
  rowHover: "#FAFAFA",
  danger: "#CC2222",
  success: "#16A34A",
  warning: "#D97706",
  tagBlue: "#2563EB",
};

// ─── SCHEMA DEFINITIONS ───────────────────────────────────────────────────────
const SCHEMA = {
  Guest: {
    label: "Hóspedes",
    icon: "👤",
    color: C.tagBlue,
    fields: [
      { key: "id", label: "ID", type: "uuid", auto: true },
      { key: "national_id", label: "CPF / Doc", type: "text", required: true },
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "age", label: "Idade", type: "number", required: true },
      { key: "sex", label: "Sexo", type: "enum", options: ["M", "F"], required: true },
    ],
  },
  Employee: {
    label: "Funcionários",
    icon: "👥",
    color: "#7C3AED",
    fields: [
      { key: "id", label: "ID", type: "uuid", auto: true },
      { key: "national_id", label: "CPF / Doc", type: "text", required: true },
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "email", label: "E-mail", type: "text", required: true },
      { key: "function", label: "Cargo", type: "text", required: true },
      { key: "age", label: "Idade", type: "number", required: true },
      { key: "sex", label: "Sexo", type: "enum", options: ["M", "F"], required: true },
    ],
  },
  Bed: {
    label: "Camas",
    icon: "🛏",
    color: "#0891B2",
    fields: [
      { key: "id", label: "ID", type: "uuid", auto: true },
      { key: "bed_type", label: "Tipo", type: "enum", options: ["solteiro", "casal", "queen", "king"], required: true },
    ],
  },
  Room: {
    label: "Quartos",
    icon: "🚪",
    color: C.success,
    fields: [
      { key: "id", label: "ID", type: "uuid", auto: true },
      { key: "room_number", label: "Número", type: "text", required: true },
      { key: "status", label: "Disponível", type: "boolean", required: true },
      { key: "capacity", label: "Capacidade", type: "number", required: true },
    ],
  },
  Room_Bed: {
    label: "Quartos × Camas",
    icon: "🔗",
    color: "#64748B",
    fields: [
      { key: "id", label: "ID", type: "uuid", auto: true },
      { key: "id_bed", label: "Cama", type: "uuid-ref", ref: "Bed", required: true },
      { key: "id_room", label: "Quarto", type: "uuid-ref", ref: "Room", required: true },
    ],
  },
  Booking: {
    label: "Reservas",
    icon: "📋",
    color: C.accent,
    fields: [
      { key: "id", label: "ID", type: "uuid", auto: true },
      { key: "id_holder", label: "Hóspede", type: "uuid-ref", ref: "Guest", required: true },
      { key: "id_room", label: "Quarto", type: "uuid-ref", ref: "Room", required: true },
      { key: "id_employee", label: "Funcionário", type: "uuid-ref", ref: "Employee", required: true },
      { key: "check_in", label: "Check-in real", type: "date" },
      { key: "scheduled_check_in", label: "Check-in agendado", type: "date" },
      { key: "check_out", label: "Check-out real", type: "date" },
      { key: "scheduled_check_out", label: "Check-out agendado", type: "date" },
      { key: "price", label: "Preço (R$)", type: "float" },
      { key: "status", label: "Status", type: "enum", options: ["active", "finished", "cancelled"] },
    ],
  },
  Guest_Booking: {
    label: "Hóspedes × Reservas",
    icon: "🔗",
    color: "#B45309",
    fields: [
      { key: "id", label: "ID", type: "uuid", auto: true },
      { key: "id_guest", label: "Hóspede", type: "uuid-ref", ref: "Guest", required: true },
      { key: "id_booking", label: "Reserva", type: "uuid-ref", ref: "Booking", required: true },
    ],
  },
  Payment: {
    label: "Pagamentos",
    icon: "💳",
    color: C.success,
    fields: [
      { key: "id", label: "ID", type: "uuid", auto: true },
      { key: "id_booking", label: "ID Reserva", type: "uuid-ref", ref: "Booking", required: true },
      { key: "payment_date", label: "Data do pagamento", type: "date", required: true },
      { key: "payment_type", label: "Tipo", type: "enum", options: ["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia"], required: true },
      { key: "status", label: "Status", type: "enum", options: ["pendente", "aprovado", "recusado", "estornado"], required: true },
    ],
  },
  Products: {
    label: "Produtos",
    icon: "📦",
    color: "#D97706",
    fields: [
      { key: "id", label: "ID", type: "uuid", auto: true },
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "storage", label: "Estoque", type: "number", required: true },
      { key: "price", label: "Preço (R$)", type: "float", required: true },
    ],
  },
  Booking_Charges: {
    label: "Cobranças",
    icon: "🧾",
    color: "#0F766E",
    fields: [
      { key: "id", label: "ID", type: "uuid", auto: true },
      { key: "id_product", label: "Produto", type: "uuid-ref", ref: "Products", required: true },
      { key: "id_booking", label: "ID Reserva", type: "uuid-ref", ref: "Booking", required: true },
      { key: "quantity", label: "Quantidade", type: "number", required: true },
    ],
  },
};

const urlMap = {
  Guest: "guests",
  Employee: "employees",
  Bed: "beds",
  Room: "rooms",
  Room_Bed: "room-beds",
  Booking: "bookings",
  Guest_Booking: "guest-bookings",
  Payment: "payments",
  Products: "products",
  Booking_Charges: "booking-charges",
};


// ─── HELPERS ──────────────────────────────────────────────────────────────────

const emptyRow = (fields) =>
  Object.fromEntries(
    fields.filter(f => !f.formOnly).map((f) => [
      f.key,
      f.key === "id"
        ? null
        : f.type === "boolean"
          ? true
          : ""
    ])
  );

const formatCell = (value, field, data) => {
  if (value === "" || value === null || value === undefined) return <span style={{ color: C.muted }}>—</span>;
  if (field.type === "boolean") return value ? <Tag color={C.success}>Sim</Tag> : <Tag color={C.muted}>Não</Tag>;

  if (field.type === "uuid-ref") {
    let refRows = data[field.ref] || [];

    if (refRows.length === 0 && field.key) {
      const alternativa = field.key.replace("id_", "").toLowerCase();
      const chaveTabela = Object.keys(data).find(k => k.toLowerCase() === alternativa)
        // fallback para plurais: "product" → "Products"
        ?? Object.keys(data).find(k => k.toLowerCase().startsWith(alternativa));
      if (chaveTabela) refRows = data[chaveTabela];
    }

    const found = refRows.find((r) => r.id === value);

    if (found) {
      // Booking: exibe "Hóspede - Quarto X" em vez do UUID cru
      if (field.ref === "Booking") {
        return <span style={{ fontFamily: "monospace", fontSize: 11, color: C.muted }}>{value}</span>;
      }

      const label = found.name || found.room_number || found.bed_type || found.id;
      return <span>{label}</span>;
    }

    return <span style={{ fontFamily: "monospace", fontSize: 11, background: "#F0F0EE", padding: "2px 6px", borderRadius: 4 }}>{value}</span>;
  }

  if (field.type === "date") {
    if (!value) return <span style={{ color: C.muted }}>—</span>;
    const d = new Date(value);
    if (isNaN(d.getTime())) return <span style={{ color: C.muted }}>{value}</span>;
    return (
      <span style={{ fontSize: 12, color: C.text, whiteSpace: "nowrap" }}>
        {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}
      </span>
    );
  }

  if (field.type === "uuid" || field.key === "id") return <span style={{ fontFamily: "monospace", fontSize: 11, color: C.muted }}>{value}</span>;
  if (field.type === "float") return `R$ ${Number(value).toFixed(2)}`;
  if (field.type === "enum") return <Tag color={enumColor(field.key, value)}>{value}</Tag>;
  return String(value);
};

const enumColor = (key, val) => {
  if (key === "status") {
    if (["aprovado", "confirmada", "concluida"].includes(val)) return C.success;
    if (["pendente"].includes(val)) return C.warning;
    if (["cancelada", "recusado", "estornado"].includes(val)) return C.danger;
    return C.muted;
  }
  if (key === "sex") return "#6366F1";
  if (key === "bed_type" || key === "payment_type") return "#0891B2";
  return C.muted;
};

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Tag = ({ color, children }) => (
  <span style={{
    display: "inline-block", padding: "2px 8px", borderRadius: 12,
    fontSize: 11, fontWeight: 600, color: "#fff",
    background: color, whiteSpace: "nowrap",
  }}>{children}</span>
);

const Btn = ({ onClick, variant = "default", children, small }) => {
  const styles = {
    default: { background: "#fff", color: C.text, border: `1px solid ${C.border}` },
    primary: { background: C.accent, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: C.muted, border: "none" },
    danger: { background: "#FEF2F2", color: C.danger, border: `1px solid #FECACA` },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} style={{
      ...s, padding: small ? "4px 10px" : "7px 14px",
      borderRadius: 7, fontSize: small ? 11 : 13, fontWeight: 500,
      cursor: "pointer", fontFamily: "inherit", display: "inline-flex",
      alignItems: "center", gap: 5, whiteSpace: "nowrap",
      transition: "opacity 0.1s",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >{children}</button>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  }} onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} style={{
      background: "#fff", borderRadius: 14, width: 520, maxWidth: "95vw",
      maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </div>
  </div>
);

// ─── FORM ────────────────────────────────────────────────────────────────────
const RowForm = ({ fields, initial, data, onSave, onClose }) => {
  const [form, setForm] = useState({ ...initial });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const inputStyle = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: `1px solid ${C.border}`, fontSize: 13,
    fontFamily: "inherit", color: C.text, background: "#FAFAFA",
    boxSizing: "border-box", outline: "none",
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
        {fields.filter(f => !f.formOnly).map((f) => (
          <div key={f.key} style={{ gridColumn: ["text", "uuid"].includes(f.type) && f.key !== "id" ? "auto" : "auto" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {f.label}{f.required && <span style={{ color: C.accent }}> *</span>}
            </label>
            {f.key === 'id' ? (
              <div style={{ ...inputStyle, color: C.muted, background: "#F5F5F3", fontFamily: "monospace", fontSize: 11 }}> {form.id || "Será gerado automaticamente"}</div>
            ) : f.type === "enum" ? (
              <select value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} style={inputStyle}>
                <option value="">Selecione...</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.type === "boolean" ? (
              <select value={String(form[f.key])} onChange={(e) => set(f.key, e.target.value === "true")} style={inputStyle}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            ) : f.type === "uuid-ref" ? (
              <select value={form[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} style={inputStyle}>
                <option value="">Selecione...</option>
                {(data[f.ref] || []).map((r) => {
                  // Define o texto amigável que vai aparecer dentro do select
                  let label = r.name || r.room_number || r.bed_type || r.id;

                  // Customização caso o select seja de uma Reserva técnica externa
                  if (f.ref === "Booking") {
                    const hospede = data.Guest?.find(g => g.id === r.id_holder)?.name || "Hóspede";
                    const quarto = data.Room?.find(rm => rm.id === r.id_room)?.room_number || "Quarto";
                    label = `Reserva: ${hospede} - Quarto ${quarto}`;
                  }

                  return (
                    <option key={r.id} value={r.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            ) : f.type === "date" ? (
              <input type="date" value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} style={inputStyle} />
            ) : f.type === "number" || f.type === "float" ? (
              <input type="number" step={f.type === "float" ? "0.01" : "1"} value={form[f.key]} onChange={(e) => set(f.key, f.type === "float" ? parseFloat(e.target.value) : parseInt(e.target.value))} style={inputStyle} />
            ) : (
              <input type="text" value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} style={inputStyle} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
        <Btn onClick={onClose}>Cancelar</Btn>
        <Btn variant="primary" onClick={() => onSave(form)}>Salvar</Btn>
      </div>
    </div>
  );
};

// ─── TABLE VIEW ───────────────────────────────────────────────────────────────
const TableView = ({ tableKey, schema, rows, data, onAdd, onEdit, onDelete }) => {
  const { fields, label, icon, color } = schema;
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const visible = rows.filter((r) =>
    Object.values(r).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 28px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>{label}</h2>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{rows.length} {rows.length === 1 ? "registro" : "registros"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: C.bg, color: C.text, outline: "none", width: 200 }}
          />
          <Btn variant="primary" onClick={onAdd}>+ Novo</Btn>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 28px 28px" }}>
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, overflowX: "auto" }}>
          {visible.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: C.muted, fontSize: 14 }}>
              {search ? "Nenhum resultado para esta busca." : "Nenhum registro ainda. Clique em + Novo."}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.tableHead }}>
                  {fields.filter(f => !f.formOnly).map((f) => (
                    <th key={f.key} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
                      {f.label}
                    </th>
                  ))}
                  <th style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, width: 100 }} />
                </tr>
              </thead>
              <tbody>
                {visible.map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: i < visible.length - 1 ? `1px solid ${C.border}` : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.rowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {fields.filter(f => !f.formOnly).map((f) => (
                      <td key={f.key} style={{ padding: "10px 14px", fontSize: 13, color: C.text, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {formatCell(row[f.key], f, data)}
                      </td>
                    ))}
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <Btn small onClick={() => onEdit(row)}>✏️ Editar</Btn>
                        <Btn small variant="danger" onClick={() => setDeleteId(row.id)}>🗑</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirm delete */}
      {deleteId && (
        <Modal title="Confirmar exclusão" onClose={() => setDeleteId(null)}>
          <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn onClick={() => setDeleteId(null)}>Cancelar</Btn>
            <Btn variant="primary" onClick={() => { onDelete(deleteId); setDeleteId(null); }}>Excluir</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, onDone }) => {
  useState(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); });
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, background: C.text, color: "#fff",
      padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
      zIndex: 2000, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ color: "#4ADE80" }}>✓</span> {msg}
    </div>
  );
};



// ─── APP ─────────────────────────────────────────────────────────────────────
export default function HotelCRUD() {


  const [data, setData] = useState({
    Guest: [],
    Employee: [],
    Bed: [],
    Room: [],
    Room_Bed: [],
    Booking: [],
    Guest_Booking: [],
    Payment: [],
    Products: [],
    Booking_Charges: []
  });

  const API_URL = "http://localhost:5000";

  const [active, setActive] = useState("Guest");
  const [modal, setModal] = useState(null); // null | { mode: "create"|"edit", row }
  const [toast, setToast] = useState(null);

  const notify = (msg) => setToast(msg);

  const handleAdd = () => setModal({ mode: "create", row: emptyRow(SCHEMA[active].fields) });
  const handleEdit = (row) => setModal({ mode: "edit", row: { ...row } });





  useEffect(() => {
    const carregarTudo = async () => {
      try {
        const resultados = await Promise.all(
          Object.entries(urlMap).map(async ([table, endpoint]) => {
            const response = await fetch(`${API_URL}/${endpoint}`);

            if (!response.ok) {
              throw new Error(`Erro ao carregar ${table}`);
            }

            const dados = await response.json();

            return [table, dados];
          })
        );

        const novoData = Object.fromEntries(resultados);

        setData(novoData);

      } catch (error) {
        console.error(error);
        notify("Erro ao carregar dados do servidor.");
      }
    };

    carregarTudo();
  }, []);

  const handleSave = useCallback(async (form) => {
    const isCreate = modal.mode === "create";

    // Se for criação, a URL é da tabela pura. Se for edição, inclui o ID no final
    const url = isCreate
      ? `${API_URL}/${urlMap[active]}`
      : `${API_URL}/${urlMap[active]}/${form.id}`;

    const method = isCreate ? "POST" : "PUT";

    const payload = { ...form };

    if (isCreate) {
      delete payload.id;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Erro ao salvar");

      const savedData = await response.json();

      setData((prev) => {
        const rows = prev[active] || [];
        if (isCreate) {
          return { ...prev, [active]: [...rows, savedData] };
        }
        return { ...prev, [active]: rows.map((r) => (r.id === savedData.id ? savedData : r)) };
      });

      notify(isCreate ? "Registro criado com sucesso." : "Registro atualizado.");
      setModal(null);
    } catch (error) {
      console.error(error);
      notify("Não foi possível salvar as alterações.");
    }
  }, [active, modal]);

  const handleDelete = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/${urlMap[active]}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao deletar");

      // Se o backend deletou com sucesso, removemos da nossa lista local
      setData((prev) => ({
        ...prev,
        [active]: (prev[active] || []).filter((r) => r.id !== id)
      }));

      notify("Registro excluído.");
    } catch (error) {
      console.error(error);
      notify("Erro ao tentar excluir o registro.");
    }
  }, [active]);

  const schema = SCHEMA[active];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter','Helvetica Neue',sans-serif", background: C.bg, fontSize: 14 }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, background: C.sidebar, display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 18px 24px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>H</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>BARONESS Hotel</div>
            <div style={{ color: "#555", fontSize: 11 }}>Gerenciador de dados</div>
          </div>
        </div>

        <div style={{ padding: "0 18px 8px", fontSize: 10, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tabelas</div>

        {Object.entries(SCHEMA).map(([key, s]) => {
          const isActive = active === key;
          const count = (data[key] || []).length;
          return (
            <button key={key} onClick={() => setActive(key)} style={{
              display: "flex", alignItems: "center", gap: 9, width: "100%",
              padding: "9px 18px", background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
              border: "none", borderLeft: `3px solid ${isActive ? s.color : "transparent"}`,
              color: isActive ? "#fff" : "#777", fontSize: 13,
              cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              transition: "all 0.12s",
            }}>
              <span style={{ fontSize: 15 }}>{s.icon}</span>
              <span style={{ flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: 11, background: isActive ? "rgba(255,255,255,0.15)" : "#222", color: isActive ? "#fff" : "#555", padding: "1px 7px", borderRadius: 10 }}>{count}</span>
            </button>
          );
        })}

        <div style={{ marginTop: "auto", padding: "16px 18px", borderTop: "1px solid #222", fontSize: 11, color: "#444" }}>
          {Object.values(data).reduce((a, b) => a + b.length, 0)} registros totais
        </div>
      </aside>

      {/* ── Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TableView
          key={active}
          tableKey={active}
          schema={schema}
          rows={data[active] || []}
          data={data}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* ── Modal ── */}
      {modal && (
        <Modal
          title={`${modal.mode === "create" ? "Novo registro" : "Editar registro"} — ${schema.label}`}
          onClose={() => setModal(null)}
        >
          <RowForm
            fields={schema.fields}
            initial={modal.row}
            data={data}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
