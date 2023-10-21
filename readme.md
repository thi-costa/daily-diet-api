# Requisitos Funcionais (RF)

- [x] Deve ser possível criar um usuário;
- [x] Deve ser possível registrar uma refeição feita, com as seguintes informações:
  - Nome
  - Descrição
  - Data e Hora
  - Está dentro ou não da dieta
- [ ] Deve ser possível editar uma refeição
- [ ] Deve ser possível apagar uma refeição
- [x] Deve ser possível listar todas as refeições de um usuário
- [x] Deve ser possível visualizar uma única refeição
- [ ] Deve ser possível recuperar as métricas de um usuário
  - Quantidade total de refeições registradas
  - Quantidade total de refeições dentro da dieta
  - Quantidade total de refeições fora da dieta
  - Melhor sequência de refeições dentro da dieta

# Regras de negócio (RN)

- [x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou


# Requisitos não funcionais (RNF)
<!-- Foca na parte tech de como implementar os RF e RN -->

# Roteiro para configurar App e executar comandos

## Configurar variáveis de ambiente

- .env [Variáveis de ambiente em desenvolvimento]
```text
NODE_ENV=development
DATABASE_CLIENT=
DATABASE_URL=
SECRET_KEY=
```
- .env.test [Variáveis de ambiente de teste]
```
NODE_ENV=test
DATABASE_CLIENT=sqlite
DATABASE_URL="./db/test.db"
SECRET_KEY="teste"
```

## Rodar as Migrations
```bash
# Rodar todas as migrations pendentes
$ npm run knex migrate:up --all

# Rodar a próxima migration pendente
$ npm run knex migrate:up
```
