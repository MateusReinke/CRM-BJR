# Emissão de Nota Fiscal

Este módulo isola o app do "como" uma nota fiscal é efetivamente transmitida,
atrás da interface `NFeProvider` (`types.ts`).

## O que está pronto

- Modelo de dados completo (lojas com CNPJ/IE/IM/regime tributário, séries e
  numeração sequencial por loja, notas com itens, status, cancelamento).
- Fluxo de emissão (rascunho -> emitir -> cancelar) e numeração atômica.
- Visualização/impressão da nota (view `Notas Fiscais` no app).
- Um provedor `simulado`, que sempre "emite" localmente sem transmitir nada a
  Prefeitura/SEFAZ. Documentos emitidos assim **não têm valor fiscal** e são
  sinalizados como tal em toda a interface.

## O que falta para emitir nota fiscal de verdade

Emitir NFS-e/NF-e/NFC-e reais exige, por loja (CNPJ):

1. Certificado digital A1 ou A3 válido.
2. Cadastro fiscal em dia (inscrição estadual para NF-e/NFC-e, inscrição
   municipal para NFS-e - cada prefeitura tem regras próprias de NFS-e).
3. Uma conta em um provedor de emissão (ex.: Focus NFe, PlugNotas, eNotas,
   NFE.io) ou integração direta com o webservice da SEFAZ/prefeitura.

Como isso depende de credenciais e contratos que só o dono do negócio pode
providenciar, nenhum adaptador real foi implementado - `getNFeProvider()`
lança um erro claro (`501 Not Implemented`) explicando o que falta caso uma
loja seja configurada com um provedor diferente de `simulado`.

## Como plugar um provedor real

1. Crie `server/nfe/<provedor>.ts` implementando `NFeProvider`
   (`issueInvoice`, `cancelInvoice`), usando a API REST do provedor escolhido.
2. Leia a chave de API da loja via `decryptSecret(store.nfeApiKeyEncrypted)`
   (`server/utils/crypto.ts`).
3. Registre o novo provedor em `getNFeProvider()` (`index.ts`).
4. Configure a loja (tela "Lojas") com `nfeProvider` = o novo valor e salve a
   API key real - a partir daí `POST /api/invoices/:id/issue` passa a chamar
   o provedor real em vez do simulado.
