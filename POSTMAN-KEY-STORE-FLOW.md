# Fluxo real de teste no Postman (Loja de Keys)

Este roteiro segue uma compra real: login -> descobrir listing -> carrinho -> checkout -> pedidos -> biblioteca -> historico.

## 0) Preparacao (Environment do Postman)

Crie um Environment com variaveis:

- baseUrl = http://localhost:8080
- token =
- gameId =
- listingId =
- orderId =
- orderItemId =

Obs: se seu backend estiver rodando em outra porta, troque baseUrl.

## 1) Login (gera token)

Metodo: POST
URL: {{baseUrl}}/auth/login
Body (JSON):

{
  "email": "teste@nexus.com",
  "password": "Senha@123"
}

Tests (aba Tests do Postman):

pm.test("status 200", function () {
  pm.response.to.have.status(200);
});

const json = pm.response.json();
pm.environment.set("token", json.token);

## 2) Listar jogos (descobrir gameId)

Metodo: GET
URL: {{baseUrl}}/games?page=1&limit=10

No retorno, pegue um id de jogo e salve em gameId.

## 3) Detalhe do jogo (descobrir listingId)

Metodo: GET
URL: {{baseUrl}}/games/{{gameId}}

No retorno, use um id dentro de platformListings e salve em listingId.

## 4) Carrinho - listar (deve iniciar vazio)

Metodo: GET
URL: {{baseUrl}}/cart
Headers:
- Authorization: Bearer {{token}}

## 5) Carrinho - adicionar item

Metodo: POST
URL: {{baseUrl}}/cart/{{listingId}}
Headers:
- Authorization: Bearer {{token}}

## 6) Carrinho - listar novamente

Metodo: GET
URL: {{baseUrl}}/cart
Headers:
- Authorization: Bearer {{token}}

## 7) Checkout (fecha compra e entrega key)

Metodo: POST
URL: {{baseUrl}}/checkout
Headers:
- Authorization: Bearer {{token}}
Body (JSON):

{
  "paymentMethod": "pix"
}

Tests (salvar orderId):

pm.test("status 201", function () {
  pm.response.to.have.status(201);
});

const json = pm.response.json();
pm.environment.set("orderId", json.order.id);

## 8) Pedidos - listar

Metodo: GET
URL: {{baseUrl}}/orders?page=1&limit=10
Headers:
- Authorization: Bearer {{token}}

## 9) Pedido por id

Metodo: GET
URL: {{baseUrl}}/orders/{{orderId}}
Headers:
- Authorization: Bearer {{token}}

Tests (salvar orderItemId):

const json = pm.response.json();
if (json.items && json.items.length > 0) {
  pm.environment.set("orderItemId", json.items[0].id);
}

## 10) Itens de pedido - listar

Metodo: GET
URL: {{baseUrl}}/order-items?page=1&limit=10
Headers:
- Authorization: Bearer {{token}}

## 11) Item de pedido por id

Metodo: GET
URL: {{baseUrl}}/order-items/{{orderItemId}}
Headers:
- Authorization: Bearer {{token}}

## 12) Biblioteca de keys (jogos comprados)

Metodo: GET
URL: {{baseUrl}}/library/keys?page=1&limit=10
Headers:
- Authorization: Bearer {{token}}

## 13) Historico de compras

Metodo: GET
URL: {{baseUrl}}/history/purchases?page=1&limit=10
Headers:
- Authorization: Bearer {{token}}

## 14) Carrinho - confirmar que esvaziou apos checkout

Metodo: GET
URL: {{baseUrl}}/cart
Headers:
- Authorization: Bearer {{token}}

## 15) Testes extras de carrinho

### 15.1 Adicionar item e remover item especifico

1. POST {{baseUrl}}/cart/{{listingId}}
2. DELETE {{baseUrl}}/cart/{{listingId}}

Headers:
- Authorization: Bearer {{token}}

### 15.2 Limpar carrinho completo

Metodo: DELETE
URL: {{baseUrl}}/cart
Headers:
- Authorization: Bearer {{token}}

## Erros esperados uteis para validar regra

- Checkout com carrinho vazio: 400 CART_EMPTY
- Adicionar listing inexistente: 404 LISTING_NOT_FOUND
- Buscar pedido de outro usuario: 404 ORDER_NOT_FOUND
- Buscar item de pedido de outro usuario: 404 ORDER_ITEM_NOT_FOUND
- Token ausente/invalido: 401 UNAUTHORIZED
