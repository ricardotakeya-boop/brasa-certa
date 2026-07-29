# Brasa Certa

Calculadora de churrasco para estimar carnes, acompanhamentos e custos por
pessoa.

## Recursos

- quantidade separada de adultos e crianças;
- períodos de almoço, jantar ou dia inteiro;
- carnes bovinas, suínas e frangos;
- acompanhamentos tradicionais, saladas, bebidas e itens de apoio;
- quantidades e preços editáveis;
- divisão do custo entre adultos e crianças;
- itens trazidos por uma família, sem cobrança;
- salvamento local dos churrascos;
- exportação para PDF, Excel e backup JSON.

## Rodar localmente

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

## Publicação

O fluxo `Deploy Brasa Certa to GitHub Pages` gera automaticamente a versão
estática do site e a publica no GitHub Pages a cada atualização da branch
`main`.

Os churrascos salvos ficam somente no navegador do usuário. Eles não são
enviados para um banco de dados.
