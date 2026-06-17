# 🏨 Hotel Baroness — Backend

Backend do **Sistema de Gestão de Hotel Baroness**, desenvolvido para o Projeto Final de Banco de Dados II.

Tecnologias: **Node.js + Express + PostgreSQL**

---

## 📁 Estrutura do projeto

```
baroness-backend/
├── server.js                  → Servidor principal (registra rotas e sobe Express)
├── .env.example               → Modelo das variáveis de ambiente
├── package.json
└── src/
    ├── db/
    │   └── connection.js      → Conexão com o PostgreSQL (pool)
    └── routes/
        ├── guest.js           → CRUD de hóspedes
        ├── employee.js        → CRUD de funcionários
        ├── room.js            → CRUD de quartos
        ├── bed.js             → CRUD de tipos de cama
        ├── product.js         → CRUD de produtos
        ├── roomBed.js         → CRUD de relação quarto ↔ cama
        ├── booking.js         → CRUD de reservas
        ├── guestBooking.js    → CRUD de hóspedes adicionais na reserva
        ├── payment.js         → CRUD de pagamentos
        ├── bookingCharge.js   → CRUD de consumo de produtos na reserva
        └── db.js              → Views, Functions e Procedures do banco
```

---

## ⚙️ Como rodar

### 1. Configure o banco de dados

Execute o SQL do arquivo `hotel_baroness.sql` no PostgreSQL para criar o banco, as tabelas, views, functions, procedures e triggers.

### 2. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com seus dados:

```bash
cp .env.example .env
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_baroness
DB_USER=postgres
DB_PASSWORD=sua_senha
PORT=3000
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Inicie o servidor

```bash
npm start
```

O servidor sobe em: `http://localhost:3000`

---

## 🔗 Rotas disponíveis

Acesse `GET /` para ver todos os endpoints listados em JSON.

### CRUD das tabelas

| Tabela           | Listar          | Buscar por ID       | Criar           | Editar              | Remover             |
|------------------|-----------------|---------------------|-----------------|---------------------|---------------------|
| Hóspedes         | GET /guests     | GET /guests/:id     | POST /guests    | PUT /guests/:id     | DELETE /guests/:id  |
| Funcionários     | GET /employees  | GET /employees/:id  | POST /employees | PUT /employees/:id  | DELETE /employees/:id|
| Quartos          | GET /rooms      | GET /rooms/:id      | POST /rooms     | PUT /rooms/:id      | DELETE /rooms/:id   |
| Camas            | GET /beds       | GET /beds/:id       | POST /beds      | PUT /beds/:id       | DELETE /beds/:id    |
| Produtos         | GET /products   | GET /products/:id   | POST /products  | PUT /products/:id   | DELETE /products/:id|
| Quarto-Cama      | GET /room-beds  | GET /room-beds/:id  | POST /room-beds | PUT /room-beds/:id  | DELETE /room-beds/:id|
| Reservas         | GET /bookings   | GET /bookings/:id   | POST /bookings  | PUT /bookings/:id   | DELETE /bookings/:id|
| Hósp. Reserva    | GET /guest-bookings | GET /guest-bookings/:id | POST /guest-bookings | PUT /guest-bookings/:id | DELETE /guest-bookings/:id |
| Pagamentos       | GET /payments   | GET /payments/:id   | POST /payments  | PUT /payments/:id   | DELETE /payments/:id|
| Consumo          | GET /booking-charges | GET /booking-charges/:id | POST /booking-charges | PUT /booking-charges/:id | DELETE /booking-charges/:id |

### Views, Functions e Procedures do banco

| Tipo      | Rota                             | Descrição                                      |
|-----------|----------------------------------|------------------------------------------------|
| VIEW      | GET /db/reservas-ativas          | Lista reservas ativas com hóspede e quarto     |
| VIEW      | GET /db/quartos-disponiveis      | Lista quartos disponíveis com tipos de cama    |
| VIEW      | GET /db/faturamento              | Faturamento por reserva (diária + consumo)     |
| FUNCTION  | GET /db/total-reserva/:id        | Total a pagar de uma reserva específica        |
| FUNCTION  | GET /db/qtd-quartos-livres       | Quantidade de quartos disponíveis agora        |
| PROCEDURE | POST /db/checkout                | Realiza check-out e libera o quarto            |
| PROCEDURE | POST /db/registrar-pagamento     | Registra pagamento para uma reserva            |

### Exemplos de body (JSON)

**POST /db/checkout**
```json
{ "id_booking": "uuid-da-reserva" }
```

**POST /db/registrar-pagamento**
```json
{
  "id_booking": "uuid-da-reserva",
  "payment_type": "cartao",
  "status": "paid"
}
```

---

## 🔒 Triggers do banco (automáticos)

Os triggers já estão no banco e disparam automaticamente — o backend não precisa fazer nada além de chamar o INSERT/UPDATE:

| Trigger                      | Quando dispara        | O que faz                                              |
|------------------------------|-----------------------|--------------------------------------------------------|
| `trg_ocupar_quarto`          | INSERT em booking     | Verifica disponibilidade e ocupa o quarto (status=false) |
| `trg_verificar_estoque`      | INSERT em booking_charges | Valida estoque e desconta automaticamente            |
| `trg_bloquear_edicao_reserva`| UPDATE em booking     | Bloqueia edição de reservas finished ou cancelled      |

Se alguma regra for violada, o banco retorna um erro que a API repassa no campo `erro` da resposta.
