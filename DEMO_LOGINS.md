# Contas de Demonstracao

Execute o endpoint abaixo para criar contas demo no banco:

- `POST /features/dev/seed-demo`
- Requer variavel `ALLOW_DEMO_SEED=true` no backend.

Credenciais criadas:

- Ana Demo - `ana.demo@finance.local` / `123456`
- Bruno Demo - `bruno.demo@finance.local` / `123456`
- Carla Demo - `carla.demo@finance.local` / `123456`
- Diego Demo - `diego.demo@finance.local` / `123456`

Dados ficticios para testar:

- Crie casal com Ana + Bruno usando as rotas de casal.
- Crie listas de compras e desejos no Perfil.
- Crie viagens compartilhadas no menu Viagens.
- Crie carteiras compartilhadas no menu Economias.
