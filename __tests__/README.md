# Organizacao Dos Testes (Backend)

Use esta regra para encontrar rapidamente cada teste:

- `autenticacao/`: login, token JWT e middleware de autenticacao.
- `usuario/`: regras de usuario (service e validacao).
- `catalogo/`: regras de categoria, plataforma e chave de jogo.
- `checkout/`: validacao de checkout.
- `comum/`: utilitarios compartilhados (paginacao, request-validator, senha).

Sugestao de leitura:

1. Comece por `autenticacao/` para entender token e acesso.
2. Depois veja `usuario/` para regras de dono da conta.
3. Em seguida veja `catalogo/` e `checkout/`.
4. Use `comum/` como base para helpers reutilizados.
