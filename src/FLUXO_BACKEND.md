# Fluxo Didatico do Backend Nexus

Este guia mostra o caminho de uma requisicao no backend de forma simples.

## 1. Fluxo padrao (CRUD)

Entrada da requisicao -> Route -> Controller -> Validator -> Service -> Model (Sequelize) -> Response

- Route: escolhe qual metodo do controller sera executado.
- Controller: orquestra o fluxo; valida dados e chama service.
- Validator: valida formato de entrada (body, query, params).
- Service: aplica regra de negocio e acessa banco de dados.
- Model: representa as tabelas e faz queries no PostgreSQL via Sequelize.

## 2. Exemplo completo: GET /users?page=2&limit=10

1. Route em src/routes/users.routes.ts chama UserController.list.
2. Controller usa validateListUsersQuery(req.query) para validar paginacao.
3. Service listUsers calcula offset e consulta Users.findAndCountAll.
4. Response retorna items + meta (page, limit, total, totalPages).

## 3. Como ler req.query, req.params e req.body

- req.query: parametros da URL apos ?
  Exemplo: /users?page=2&limit=10
- req.params: parametros dinamicos da rota
  Exemplo: /users/:id -> req.params.id
- req.body: dados enviados no corpo da requisicao (POST/PUT)

## 4. Regra pratica para validacao

- Validator valida formato e tipos de entrada.
  Exemplo: id precisa ser inteiro positivo, email precisa ter formato valido.
- Service valida regra de negocio/estado.
  Exemplo: email/username/CPF nao podem duplicar no banco.

## 5. Regra pratica para autenticacao

- Rota com authMiddleware exige token Bearer valido.
- Rota sem authMiddleware e publica.
- No modulo users:
  - GET /users e GET /users/:id sao publicas.
  - PUT /users/:id e DELETE /users/:id sao protegidas.

## 6. Mapa rapido de endpoints

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
