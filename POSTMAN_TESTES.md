- Para endpoints com upload de imagem, use `Body > form-data`.
- Em vários `DELETE`, o backend responde com `204 No Content`. Isso é normal, mesmo sem corpo na resposta.

### POST `/auth/login`

```json
{
  "email": "murilinho.pequeno@gmail.com",
  "password": "SenhaForte123!"
}

### POST `/users`

```json
{
  "email": "murilinho.pequeno@gmail.com",
  "username": "murilop375",
  "password": "SenhaForte123!",
  "fullName": "Murilo Pereira Macedo",
  "cpf": "51603871888",
  "avatarUrl": "https://meusite.com/avatar.png"
}
```

Campos obrigatórios:

- `email`
- `username`
- `password`
- `fullName`
- `cpf`

Campo opcional:

- `avatarUrl`

Observações:

- O campo correto é `fullName`, não `fullname`.
- A senha deve ter pelo menos 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.
- O CPF deve ter 11 dígitos.

### PUT `/users/:id`

Precisa de token. Só o próprio usuário pode alterar a conta.

```json
{
  "username": "murilop375",
  "password": "NovaSenhaForte123!",
  "fullName": "Murilo Pereira Macedo",
  "cpf": "51603871888",
  "avatarUrl": "https://meusite.com/avatar-novo.png"
}
```

Campos obrigatórios:

- `username`
- `fullName`
- `cpf`

Campos opcionais:

- `password`
- `avatarUrl`

Não envie:

- `email`

### DELETE `/users/:id`

Precisa de token. Só o próprio usuário pode apagar a conta.

Não envia body.

---

## 3. Categorias

Rotas de escrita exigem token e perfil admin.

### POST `/categories`

```json
{
  "name": "Aventura"
}
```

Campo obrigatório:

- `name`

### PUT `/categories/:id`

```json
{
  "name": "Ação e Aventura"
}
```

Campo obrigatório:

- `name`

### DELETE `/categories/:id`

Não envia body.

---

## 4. Plataformas

Rotas de escrita exigem token e perfil admin.

### POST `/platforms`

```json
{
  "name": "PlayStation 5",
  "slug": "ps5",
  "iconUrl": "https://meusite.com/ps5.png"
}
```

Campos obrigatórios:

- `name`
- `slug`

Campo opcional:

- `iconUrl`

### PUT `/platforms/:id`

Envie pelo menos um campo.

```json
{
  "name": "PlayStation 5",
  "slug": "playstation-5",
  "iconUrl": "https://meusite.com/novo-ps5.png",
  "isActive": true
}
```

Campos aceitos:

- `name`
- `slug`
- `iconUrl`
- `isActive`

### DELETE `/platforms/:id`

Não envia body.

---

## 5. Carrinho

Todas as rotas exigem token.

### POST `/cart/:listingId`

Não envia body.

Esse endpoint adiciona 1 unidade do `listingId` no carrinho.

### PATCH `/cart/:listingId`

```json
{
  "quantity": 2
}
```

Campo obrigatório:

- `quantity`

Observação:

- `quantity` deve ser inteiro positivo.

### DELETE `/cart/:listingId`

Não envia body.

Remove esse item do carrinho.

### DELETE `/cart`

Não envia body.

Limpa todo o carrinho.

---

## 6. Checkout

Exige token.

### POST `/checkout`

```json
{
  "paymentMethod": "pix"
}
```

Campo obrigatório:

- `paymentMethod`

Valores aceitos:

- `card`
- `paypal`
- `pix`

Observações:

- O carrinho não pode estar vazio.
- Os itens precisam continuar ativos e com estoque disponível.

---

## 7. Reviews

### POST `/reviews`

Exige token.

```json
{
  "gameId": 1,
  "rating": 5,
  "comment": "Jogo muito bom, gostei bastante."
}
```

Campos obrigatórios:

- `gameId`
- `rating`
- `comment`

Regras:

- `rating` deve ser inteiro de `1` até `5`
- `comment` pode ter até `500` caracteres
- O usuário só pode criar uma review por jogo

### PUT `/reviews/:id`

Exige token. Só o dono da review pode editar.

```json
{
  "rating": 4,
  "comment": "Depois de jogar mais, continuo achando muito bom."
}
```

Campos obrigatórios:

- `rating`
- `comment`

### DELETE `/reviews/:id`

Exige token. Só o dono da review pode remover.

Não envia body.

---

## 8. Votos em Reviews

Todas as rotas de escrita exigem token.

### POST `/review-votes/:reviewId`

Não envia body.

### DELETE `/review-votes/:reviewId`

Não envia body.

---

## 9. Wishlist

Todas as rotas exigem token.

### POST `/wishlists/:gameId`

Não envia body.

### DELETE `/wishlists/:gameId`

Não envia body.

---

## 10. Game Keys

Rotas de escrita exigem token e perfil admin.

### POST `/game-keys`

```json
{
  "listingId": 1,
  "keyValue": "ABCD-EFGH-IJKL"
}
```

Campos obrigatórios:

- `listingId`
- `keyValue`

### POST `/game-keys/bulk`

```json
{
  "listingId": 1,
  "keyValues": [
    "ABCD-EFGH-IJKL",
    "MNOP-QRST-UVWX"
  ]
}
```

Campos obrigatórios:

- `listingId`
- `keyValues`

Observação:

- `keyValues` deve ser um array não vazio.

### PUT `/game-keys/:id`

```json
{
  "status": "available"
}
```

Campo obrigatório:

- `status`

Valores aceitos:

- `available`
- `reserved`
- `sold`

### POST `/game-keys/bulk-delete`

Este endpoint remove várias keys, mas usa `POST` em vez de `DELETE`.

```json
{
  "listingId": 1,
  "ids": [10, 11, 12]
}
```

Campos obrigatórios:

- `listingId`
- `ids`

Observação:

- Só remove keys com status `available` e que pertençam ao `listingId` enviado.

### DELETE `/game-keys/:id`

Não envia body.

---

## 11. Listings

Rotas de escrita exigem token e perfil admin.

### POST `/listings`

```json
{
  "gameId": 1,
  "platformId": 2,
  "price": 199.9
}
```

Campos obrigatórios:

- `gameId`
- `platformId`
- `price`

### PUT `/listings/:id`

Envie pelo menos um campo.

```json
{
  "price": 149.9,
  "isActive": true
}
```

Campos aceitos:

- `price`
- `isActive`

### DELETE `/listings/:id`

Não envia body.

---

## 12. Promoções

Rotas de escrita exigem token e perfil admin.

### POST `/promotions`

```json
{
  "name": "Promo de Fim de Semana",
  "description": "Desconto especial",
  "discountPercentage": 20,
  "startDate": "2026-04-12",
  "endDate": "2026-04-20",
  "isActive": true
}
```

Campos obrigatórios:

- `name`
- `discountPercentage`
- `startDate`
- `endDate`

Campos opcionais:

- `description`
- `isActive`

Regras:

- `discountPercentage` deve ser inteiro entre `1` e `100`
- As datas devem estar no formato `YYYY-MM-DD`

### PUT `/promotions/:id`

Envie pelo menos um campo.

```json
{
  "name": "Promo Atualizada",
  "description": "Desconto ainda maior",
  "discountPercentage": 30,
  "startDate": "2026-04-12",
  "endDate": "2026-04-25",
  "isActive": true
}
```

Campos aceitos:

- `name`
- `description`
- `discountPercentage`
- `startDate`
- `endDate`
- `isActive`

### POST `/promotions/:id/listings/:listingId`

Não envia body.

Esse endpoint só vincula a promoção ao listing.

### DELETE `/promotions/:id`

Não envia body.

### DELETE `/promotions/:id/listings/:listingId`

Não envia body.

---

## 13. Imagens de Jogo

Rotas de escrita exigem token e perfil admin.

### POST `/game-images`

```json
{
  "gameId": 1,
  "imageUrl": "https://meusite.com/imagem1.jpg",
  "sortOrder": 0
}
```

Campos obrigatórios:

- `gameId`
- `imageUrl`

Campo opcional:

- `sortOrder`

### PUT `/game-images/:id`

Envie pelo menos um campo.

```json
{
  "imageUrl": "https://meusite.com/imagem-nova.jpg",
  "sortOrder": 1
}
```

Campos aceitos:

- `imageUrl`
- `sortOrder`

### DELETE `/game-images/:id`

Não envia body.

---

## 14. Tags de Jogo

Rotas de escrita exigem token e perfil admin.

### POST `/game-tags`

```json
{
  "gameId": 1,
  "tagId": 3
}
```

Campos obrigatórios:

- `gameId`
- `tagId`

### DELETE `/game-tags/:gameId/:tagId`

Não envia body.

Observação:

- No backend atual existe o vínculo entre jogo e tag, mas não encontrei uma rota separada para CRUD completo de `tags`.

---

## 15. Configuração de Jogo por Plataforma

Rotas exigem token e perfil admin.

### PUT `/games/:id/platforms/:platformId`

Envie pelo menos um campo.

```json
{
  "price": 129.9,
  "isActive": true
}
```

Campos aceitos:

- `price`
- `isActive`

Regra importante:

- Se ainda não existir listing para essa combinação de jogo e plataforma, `price` passa a ser obrigatório.

### POST `/games/:id/platforms/:platformId/keys`

```json
{
  "keyValues": [
    "ABCD-EFGH-IJKL",
    "ZZZZ-YYYY-XXXX"
  ]
}
```

Campo obrigatório:

- `keyValues`

Observação:

- As keys são normalizadas para o formato `XXXX-XXXX-XXXX`.

---

## 16. Jogos

As rotas de escrita exigem token e perfil admin.

Os endpoints `POST /games` e `PUT /games/:id` aceitam upload de imagem, então o mais seguro no Postman é usar `Body > form-data`.

### Campos aceitos

Campos de texto:

- `title`
- `description`
- `longDescription`
- `releaseDate`
- `coverImageUrl`
- `isActive`
- `categoryIds`
- `galleryItems`

Campos de arquivo:

- `coverFile`
- `galleryFiles`

### POST `/games`

Exemplo em estrutura JSON:

```json
{
  "title": "God of War Ragnarok",
  "description": "Jogo de ação",
  "longDescription": "Descricao completa do jogo",
  "releaseDate": "2026-04-12",
  "coverImageUrl": "https://meusite.com/capa.jpg",
  "isActive": true,
  "categoryIds": [1, 2],
  "galleryItems": [
    {
      "kind": "url",
      "url": "https://meusite.com/print1.jpg"
    }
  ]
}
```

Campos obrigatórios:

- `title`
- `description`
- `longDescription`
- `releaseDate`
- `categoryIds`

Obrigatório informar capa de uma destas formas:

- `coverImageUrl`
- `coverFile`

Campos opcionais:

- `isActive`
- `galleryItems`

Regras:

- `releaseDate` deve estar em `YYYY-MM-DD`
- `categoryIds` deve ser um array com pelo menos uma categoria
- `galleryItems` aceita objetos com:
  - `{"kind":"existing","id":1}`
  - `{"kind":"file","fileIndex":0}`
  - `{"kind":"url","url":"https://..."}`

### Exemplo prático no Postman com `form-data`

Chaves de texto:

- `title` = `God of War Ragnarok`
- `description` = `Jogo de ação`
- `longDescription` = `Descricao completa do jogo`
- `releaseDate` = `2026-04-12`
- `isActive` = `true`
- `categoryIds` = `[1,2]`
- `galleryItems` = `[{"kind":"file","fileIndex":0},{"kind":"url","url":"https://meusite.com/print2.jpg"}]`

Chaves de arquivo:

- `coverFile` = selecione a imagem da capa
- `galleryFiles` = selecione uma ou mais imagens da galeria

### PUT `/games/:id`

Envie apenas os campos que deseja alterar.

```json
{
  "title": "God of War Ragnarok Deluxe",
  "description": "Nova descricao",
  "longDescription": "Descricao atualizada",
  "releaseDate": "2026-05-01",
  "coverImageUrl": "https://meusite.com/nova-capa.jpg",
  "isActive": true,
  "categoryIds": [1, 3],
  "galleryItems": [
    {
      "kind": "url",
      "url": "https://meusite.com/print2.jpg"
    }
  ]
}
```

Campos aceitos:

- `title`
- `description`
- `longDescription`
- `releaseDate`
- `coverImageUrl`
- `isActive`
- `categoryIds`
- `galleryItems`

Também pode enviar:

- `coverFile`
- `galleryFiles`

### DELETE `/games/:id`

Não envia body.

---

## Como remover algo no Postman

### Remover um registro simples

Exemplo: apagar categoria `1`

1. Método: `DELETE`
2. URL: `http://localhost:3000/categories/1`
3. Se a rota exigir autenticação, envie o token em `Authorization > Bearer Token`
4. Não envie body
5. Clique em `Send`

### Exemplos de remoção

Apagar usuário:

```text
DELETE /users/1
```

Apagar categoria:

```text
DELETE /categories/1
```

Apagar plataforma:

```text
DELETE /platforms/1
```

Apagar jogo:

```text
DELETE /games/1
```

Remover item do carrinho:

```text
DELETE /cart/5
```

Limpar carrinho:

```text
DELETE /cart
```

Remover da wishlist:

```text
DELETE /wishlists/3
```

Apagar review:

```text
DELETE /reviews/7
```

Remover voto em review:

```text
DELETE /review-votes/7
```

Apagar game key:

```text
DELETE /game-keys/10
```

Apagar listing:

```text
DELETE /listings/4
```

Apagar promoção:

```text
DELETE /promotions/2
```

Desvincular promoção de listing:

```text
DELETE /promotions/2/listings/9
```

Apagar imagem de jogo:

```text
DELETE /game-images/5
```

Remover vínculo de tag:

```text
DELETE /game-tags/10/4
```

### Exclusão em massa de keys

Para várias keys ao mesmo tempo, seu backend usa:

```text
POST /game-keys/bulk-delete
```

Com body:

```json
{
  "listingId": 1,
  "ids": [10, 11, 12]
}
```

---

## GETs úteis para apoio nos testes

Esses endpoints normalmente não precisam de body.

Públicos:

- `GET /`
- `GET /health`
- `GET /games`
- `GET /games/:id`
- `GET /games/:id/details`
- `GET /reviews`
- `GET /reviews/:id`
- `GET /review-votes`
- `GET /listings`
- `GET /listings/:id`
- `GET /listings/:id/stock`
- `GET /listings/:id/details`
- `GET /promotions`
- `GET /promotions/:id`
- `GET /game-images`
- `GET /game-images/:id`
- `GET /game-tags`

Autenticados:

- `GET /users/:id`
- `GET /categories`
- `GET /categories/:id`
- `GET /platforms`
- `GET /platforms/:id`
- `GET /wishlists`
- `GET /cart`
- `GET /orders`
- `GET /orders/:id`
- `GET /order-items`
- `GET /order-items/:id`
- `GET /library/keys`
- `GET /history/purchases`
- `GET /delivered-keys`
- `GET /delivered-keys/:id`

Admin:

- `GET /users`
- `GET /games/:id/platforms`
- `GET /game-keys`
- `GET /game-keys/:id`
- `GET /admin/orders`
- `GET /admin/orders/:id`
- `GET /admin/price-history`

---

## Query params úteis

Muitas listas aceitam:

- `page`
- `limit`

Filtros adicionais:

- `GET /games?q=god`
- `GET /reviews?gameId=1`
- `GET /review-votes?reviewId=1`
- `GET /listings?gameId=1&includeStock=true`
- `GET /promotions?activeNow=true`
- `GET /game-images?gameId=1`
- `GET /game-tags?gameId=1`
- `GET /admin/orders?q=nex&status=paid&paymentStatus=succeeded`
- `GET /admin/price-history?q=god&listingId=1`

---

## Resumo rápido

Se quiser só decorar o essencial:

- `POST` cria
- `PUT` atualiza
- `PATCH` altera parcialmente
- `DELETE` remove
- Quase todo `DELETE` vai sem body
- Rotas protegidas precisam de `Bearer Token`
- Rotas administrativas precisam de usuário admin
