# ARG Terminal

Site estático (HTML/CSS/JS puro) para o teu ARG, pronto para o GitHub Pages.

## Estrutura

```
arg-site/
├── index.html          página principal (onboarding + boot + terminal)
├── style.css            todo o estilo (tema preto/verde)
├── script.js             lógica: onboarding, animação de arranque, chave
└── locations/
    ├── loc1.html         página de exemplo — pista/local nº1
    ├── loc2.html         página de exemplo — pista/local nº2
    └── loc3.html         página de exemplo — pista/local nº3
```

## Como funciona

1. **Primeira visita**: aparece um popup a pedir o nome real e o nome de
   utilizador do ARG. Fica guardado no `localStorage` do browser da pessoa
   (não há servidor — cada dispositivo guarda o seu próprio registo).
2. **Arranque (boot)**: mostra um conjunto de linhas de texto verde, uma a
   seguir à outra, como um sistema a iniciar. Depois apaga tudo e fica
   1 a 2 segundos em ecrã preto.
3. **Ecrã principal**: aparece um ícone, o texto "INSIRA A CHAVE DE ACESSO"
   e um campo de texto que mostra `_` para cada caráter (cresce à medida
   que se escreve, sem limite fixo). Ao premir **Enter**, a chave é
   comparada com a lista em `script.js` e aparece uma resposta por baixo.
4. **Nós escondidos**: há uns pontos (`·`) discretos espalhados pelo ecrã
   (cantos, margens) que são links para páginas em `locations/`. É aí que
   vais colocar as pistas para as pessoas encontrarem as chaves.

## Como adicionar/editar chaves

Abre `script.js` e edita o objeto `KEYS`:

```js
const KEYS = {
  "ECHO9": { ok: true,  message: "CHAVE ACEITE. Acesso concedido a: SETOR 1." },
  "NULLPOINT": { ok: true, message: "CHAVE ACEITE. Novo registo desbloqueado." },
};
```

- A comparação **não** distingue maiúsculas/minúsculas nem espaços à volta.
- Podes ter tantas chaves como quiseres, cada uma com a sua resposta.
- Se quiseres respostas "quase lá" (ex.: chave incompleta), usa `ok: false`
  com uma mensagem diferente do erro genérico.

## Como adicionar páginas/pistas novas

1. Cria um novo ficheiro em `locations/`, ex.: `loc4.html` (copia um dos
   existentes como modelo).
2. Escreve lá a pista, imagem, ficheiro escondido, comentário no código-
   fonte, etc.
3. Em `index.html`, adiciona um novo nó escondido:

```html
<a href="locations/loc4.html" class="hidden-node node-6" title="???">·</a>
```

4. Em `style.css`, define a posição desse nó (copia e ajusta uma das
   regras `.node-1` a `.node-5`).

## Publicar no GitHub Pages

1. Cria um repositório novo no GitHub (pode ser público ou privado,
   consoante o que quiseres para o ARG).
2. Faz upload de todos estes ficheiros para a raiz do repositório
   (mantendo a pasta `locations/`).
3. Vai a **Settings → Pages**, escolhe a branch `main` e a pasta `/root`.
4. Guarda. Ao fim de 1-2 minutos o site fica disponível em:
   `https://<o-teu-user>.github.io/<nome-do-repo>/`

## Notas

- Como é um site estático, não há forma de esconder verdadeiramente as
  chaves de alguém que veja o código-fonte (`script.js`) — mas para um ARG
  isso normalmente não é problema, faz parte da diversão que alguém possa
  "fazer engenharia inversa". Se quiseres dificultar um pouco, podes ofuscar
  as strings ou mover a lista de chaves para um ficheiro `.js` separado,
  carregado apenas depois de certas condições.
- O nome real e o username ficam só no browser da própria pessoa
  (`localStorage`), não são enviados para lado nenhum.
