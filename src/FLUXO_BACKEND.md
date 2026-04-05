# Fluxo Didático do Backend Nexus

Este guia mostra o caminho de uma requisição no backend de forma simples.

## 1. Fluxo padrão (CRUD)

Entrada da requisição -> Route -> Controller -> Validator -> Service -> Model (Sequelize) -> Response

- Route: escolhe qual método do controller será executado.
- Controller: orquestra o fluxo; valida dados e chama service.
- Validator: valida formato de entrada (body, query, params).
- Service: aplica regra de negócio e acessa banco de dados.
- Model: representa as tabelas e faz queries no PostgreSQL via Sequelize.

## 2. Exemplo completo: GET /users?page=2&limit=10

1. Route em src/routes/users.routes.ts chama UserController.list.
2. Controller usa validateListUsersQuery(req.query) para validar paginação.
3. Service listUsers calcula offset e consulta Users.findAndCountAll.
4. Response retorna items + meta (page, limit, total, totalPages).

## 3. Como ler req.query, req.params e req.body

- req.query: parâmetros da URL após ?
  Exemplo: /users?page=2&limit=10
- req.params: parâmetros dinâmicos da rota
  Exemplo: /users/:id -> req.params.id
- req.body: dados enviados no corpo da requisição (POST/PUT)

## 4. Regra prática para validação

- Validator valida formato e tipos de entrada.
  Exemplo: id precisa ser inteiro positivo, email precisa ter formato válido.
- Service valida regra de negócio/estado.
  Exemplo: email/username/CPF não podem duplicar no banco.

## 5. Regra prática para autenticação

- Rota com authMiddleware exige token Bearer válido.
- Rota sem authMiddleware é pública.
- No módulo users:
  - GET /users e GET /users/:id são públicas.
  - PUT /users/:id e DELETE /users/:id são protegidas.

## 6. Mapa rápido de endpoints

- Auth
  - POST /auth/login
- Users
  - GET /users
  - GET /users/:id
  - POST /users
  - PUT /users/:id
  - DELETE /users/:id
- Games
  - GET /games
  - GET /games/:id
  - POST /games
  - PUT /games/:id
  - DELETE /games/:id
- Categories
  - GET /categories
  - GET /categories/:id
  - POST /categories
  - PUT /categories/:id
  - DELETE /categories/:id
- Platforms
  - GET /platforms
  - GET /platforms/:id
  - POST /platforms
  - PUT /platforms/:id
  - DELETE /platforms/:id

## 7. Ordem recomendada para estudar

1. src/routes/users.routes.ts
2. src/controllers/user.controller.ts
3. src/validators/user.validator.ts
4. src/services/user.service.ts
5. src/models/Users.ts

Depois repetir o mesmo caminho para games, categories e platforms.
